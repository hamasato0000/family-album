import type { S3Event, Context } from "aws-lambda";
import {
    S3Client,
    GetObjectCommand,
    PutObjectCommand,
} from "@aws-sdk/client-s3";
import sharp from "sharp";
import { fileTypeFromBuffer } from "file-type";
import { prisma } from "@family-album/prisma";
import dotenv from "dotenv";

dotenv.config();

// 許容するファイルタイプ
const ALLOWED_FILE_TYPES = new Set(["jpg", "jpeg", "png", "heic", "heif"]);

// サムネイル設定
const THUMBNAIL_MAX_SIZE = 400; // 長辺の最大サイズ

// 最大ファイルサイズ（50MB）
const MAX_FILE_SIZE = 50 * 1024 * 1024;

const s3 = new S3Client({
    region: process.env.AWS_REGION || "ap-northeast-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "test",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "test",
    },
    ...(process.env.AWS_ENDPOINT_URL && {
        endpoint: process.env.AWS_ENDPOINT_URL,
        forcePathStyle: true,
    }),
});

/**
 * S3キーからupload_idとcontent_idを抽出
 * キー形式: raws/{upload_id}/{content_id}.{ext}
 */
function parseS3Key(key: string): { uploadId: string; contentId: string } | null {
    const match = key.match(/^raws\/([^/]+)\/([^.]+)/);
    if (!match) {
        return null;
    }
    return {
        uploadId: match[1],
        contentId: match[2],
    };
}

/**
 * EXIF情報から撮影日時を取得
 */
async function extractExifData(buffer: Buffer): Promise<{
    takenAt: Date | null;
    width: number | null;
    height: number | null;
    exifData: Record<string, unknown> | undefined;
}> {
    try {
        const metadata = await sharp(buffer).metadata();

        let takenAt: Date | null = null;
        let exifData: Record<string, unknown> | undefined = undefined;

        if (metadata.exif) {
            try {
                // exif-parserを使用してEXIFデータを解析（型定義がないためanyを使用）
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const ExifParser = (await import("exif-parser")) as any;
                const parser = ExifParser.create(buffer);
                const result = parser.parse();

                if (result.tags) {
                    // JSON互換の値に変換
                    exifData = JSON.parse(JSON.stringify(result.tags)) as Record<string, unknown>;

                    // DateTimeOriginalまたはDateTimeから撮影日時を取得
                    const dateTimeOriginal = result.tags.DateTimeOriginal;
                    if (dateTimeOriginal && typeof dateTimeOriginal === "number") {
                        takenAt = new Date(dateTimeOriginal * 1000);
                    }
                }
            } catch (exifError) {
                console.log("Failed to parse EXIF data:", exifError);
            }
        }

        return {
            takenAt,
            width: metadata.width || null,
            height: metadata.height || null,
            exifData,
        };
    } catch (error) {
        console.error("Error extracting EXIF data:", error);
        return {
            takenAt: null,
            width: null,
            height: null,
            exifData: undefined,
        };
    }
}

/**
 * コンテンツ処理Lambda ハンドラー
 */
export const handler = async (event: S3Event, context: Context): Promise<void> => {
    console.log("Received S3 Event:", JSON.stringify(event, null, 2));

    for (const record of event.Records) {
        const bucketName = record.s3.bucket.name;
        const objectKey = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));

        console.log(`Processing file: ${objectKey}`);

        // S3キーからIDを抽出
        const ids = parseS3Key(objectKey);
        if (!ids) {
            console.error(`Invalid S3 key format: ${objectKey}`);
            continue;
        }

        const { uploadId, contentId } = ids;

        try {
            // 1. コンテンツレコードを取得し、status=processingに更新
            const content = await prisma.rContent.findUnique({
                where: { contentId },
            });

            if (!content) {
                console.error(`Content not found: ${contentId}`);
                continue;
            }

            // 2. S3から画像データを取得
            const getObjectCommand = new GetObjectCommand({
                Bucket: bucketName,
                Key: objectKey,
            });

            const getObjectResponse = await s3.send(getObjectCommand);

            if (!getObjectResponse.Body) {
                throw new Error("No object body found");
            }

            // ストリームをバッファに変換
            const chunks: Uint8Array[] = [];
            const stream = getObjectResponse.Body as AsyncIterable<Uint8Array>;
            for await (const chunk of stream) {
                chunks.push(chunk);
            }
            const imageBuffer = Buffer.concat(chunks);

            console.log(`Fetched object of size ${imageBuffer.length} bytes`);

            // 3. ファイルサイズチェック
            if (imageBuffer.length > MAX_FILE_SIZE) {
                await updateContentAsFailed(
                    contentId,
                    uploadId,
                    `File size exceeds maximum allowed (${MAX_FILE_SIZE} bytes)`
                );
                continue;
            }

            // 4. ファイルタイプを検出
            const fileType = await fileTypeFromBuffer(imageBuffer);
            if (!fileType) {
                await updateContentAsFailed(contentId, uploadId, "Could not determine file type");
                continue;
            }

            const { ext, mime } = fileType;
            console.log(`Detected file type: ${ext}, MIME type: ${mime}`);

            // 5. ファイルタイプのバリデーション
            const lowerCaseExt = ext.toLowerCase();
            if (!ALLOWED_FILE_TYPES.has(lowerCaseExt)) {
                await updateContentAsFailed(
                    contentId,
                    uploadId,
                    `Unsupported file type: ${ext}`
                );
                continue;
            }

            // 6. 画像の検証（破損チェック）とメタデータ取得
            let imageMetadata: sharp.Metadata;
            try {
                imageMetadata = await sharp(imageBuffer).metadata();
                if (!imageMetadata.width || !imageMetadata.height) {
                    throw new Error("Invalid image dimensions");
                }
            } catch (error) {
                await updateContentAsFailed(contentId, uploadId, "Image is corrupted or invalid");
                continue;
            }

            // 7. EXIF情報を取得
            const { takenAt, exifData, width, height } = await extractExifData(imageBuffer);

            // 8. サムネイル生成
            const thumbnailBuffer = await sharp(imageBuffer)
                .resize({
                    width: THUMBNAIL_MAX_SIZE,
                    height: THUMBNAIL_MAX_SIZE,
                    fit: "inside", // アスペクト比を維持して収める
                    withoutEnlargement: true, // オリジナルより大きくしない
                })
                .toFormat("jpeg", { quality: 80 })
                .toBuffer();

            // 9. サムネイルをS3に保存
            const thumbnailPath = `thumbnails/${uploadId}/${contentId}.jpg`;
            await s3.send(
                new PutObjectCommand({
                    Bucket: bucketName,
                    Key: thumbnailPath,
                    Body: thumbnailBuffer,
                    ContentType: "image/jpeg",
                })
            );

            console.log(`Successfully created thumbnail: ${thumbnailPath}`);

            // 10. r_contentとr_photoレコードを更新
            await prisma.$transaction(async (tx) => {
                // コンテンツの更新
                await tx.rContent.update({
                    where: { contentId },
                    data: {
                        thumbnailPath,
                        fileSize: BigInt(imageBuffer.length),
                        takenAt,
                        processedAt: new Date(),
                        updatedAt: new Date(),
                    },
                });

                // 写真メタデータの作成（まだ存在しない場合）
                const existingPhoto = await tx.rPhoto.findUnique({
                    where: { photoId: contentId },
                });

                if (!existingPhoto) {
                    await tx.rPhoto.create({
                        data: {
                            photoId: contentId,
                            width: BigInt(width || imageMetadata.width || 0),
                            height: BigInt(height || imageMetadata.height || 0),
                            exif: exifData ? JSON.parse(JSON.stringify(exifData)) : undefined,
                        },
                    });
                } else {
                    await tx.rPhoto.update({
                        where: { photoId: contentId },
                        data: {
                            width: BigInt(width || imageMetadata.width || 0),
                            height: BigInt(height || imageMetadata.height || 0),
                            exif: exifData ? JSON.parse(JSON.stringify(exifData)) : undefined,
                            updatedAt: new Date(),
                        },
                    });
                }
            });

            console.log(`Successfully processed content: ${contentId}`);

            // 11. 完了判定処理
            await checkUploadCompletion(uploadId);
        } catch (error) {
            console.error(`Error processing content ${contentId}:`, error);
            await updateContentAsFailed(
                contentId,
                uploadId,
                error instanceof Error ? error.message : "Unknown error"
            );
        }
    }
};

/**
 * コンテンツを失敗状態に更新
 */
async function updateContentAsFailed(
    contentId: string,
    uploadId: string,
    errorMessage: string
): Promise<void> {
    try {
        await prisma.rContent.update({
            where: { contentId },
            data: {
                errorMessage,
                processedAt: new Date(),
                updatedAt: new Date(),
            },
        });
        console.log(`Marked content ${contentId} as failed: ${errorMessage}`);

        // 完了判定
        await checkUploadCompletion(uploadId);
    } catch (error) {
        console.error(`Failed to update content ${contentId}:`, error);
    }
}

/**
 * アップロードの完了判定
 * 全コンテンツが処理完了（completed + failed）の場合、uploadsをcompletedに更新
 */
async function checkUploadCompletion(uploadId: string): Promise<void> {
    try {
        const upload = await prisma.eUpload.findUnique({
            where: { uploadId },
        });

        if (!upload) {
            console.error(`Upload not found: ${uploadId}`);
            return;
        }

        const expectedCount = Number(upload.photoCount + upload.videoCount);

        // 処理済み（thumbnailPathあり または errorMessageあり）のコンテンツ数をカウント
        const processedCount = await prisma.rContent.count({
            where: {
                uploadId,
                processedAt: { not: null },
            },
        });

        console.log(`Upload ${uploadId}: ${processedCount}/${expectedCount} processed`);

        if (processedCount >= expectedCount) {
            await prisma.eUpload.update({
                where: { uploadId },
                data: {
                    status: "completed",
                    updatedAt: new Date(),
                },
            });
            console.log(`Upload ${uploadId} marked as completed`);
        }
    } catch (error) {
        console.error(`Failed to check upload completion for ${uploadId}:`, error);
    }
}
