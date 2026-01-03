import type { S3Event, Context } from "aws-lambda";
import {
    S3Client,
    GetObjectCommand,
    type CopyObjectCommandInput,
    CopyObjectCommand,
} from "@aws-sdk/client-s3";
import { Readable } from "stream";
import dotenv from "dotenv";
import { fileTypeFromBuffer } from "file-type";
import { prisma } from "@family-album/prisma";

dotenv.config();

console.log("AWS_ACCESS_KEY_ID:", process.env.AWS_ACCESS_KEY_ID);

const s3 = new S3Client({
    region: "ap-northeast-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "test",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "test",
    },
});

export const handler = async (event: S3Event): Promise<void> => {
    console.log("Received S3 Event:", JSON.stringify(event, null, 2));

    for (const record of event.Records) {
        const bucketName = record.s3.bucket.name;
        const objectKey = record.s3.object.key;

        console.log(`Processing file ${objectKey}`);

        const getObjectCommand = new GetObjectCommand({
            Bucket: bucketName,
            Key: objectKey,
        });

        try {
            const getObjectCommandResponse = await s3.send(getObjectCommand);

            // S3から取得したデータをストリームとして扱う
            const stream = getObjectCommandResponse.Body as Readable;

            // S3から受け取ったデータチャンクをバイナリとして保持する配列
            const chunks: Uint8Array[] = [];

            // チャンクを結合して1つの連続したバッファにする
            for await (const chunk of stream) {
                chunks.push(chunk);
            }
            const imageBuffer = Buffer.concat(chunks);

            console.log(
                `Fetched object of size ${imageBuffer.length} bytes from S3`
            );

            // 許容するファイルタイプのリストを定義
            // TODO: とりあえずコード内に定義（将来的に設定ファイルなどに移す）
            const ALLOWED_FILE_TYPES = new Set(["jpg", "png", "heic", "heif"]);

            // ファイルタイプを検出
            const fileType = await fileTypeFromBuffer(imageBuffer);
            if (!fileType) {
                console.error(`Could not determine file type for ${objectKey}`);
                continue;
            }

            const { ext, mime } = fileType;
            console.log(`Detected file type: ${ext}, MIME type: ${mime}`);

            // 検出したファイルタイプが許容リストに含まれているか確認
            if (!ALLOWED_FILE_TYPES.has(ext.toLowerCase())) {
                console.error(
                    `Invalid file type: ${ext} for file ${objectKey}`
                );
                continue;
            }

            // 拡張子の正規化
            const lastDotPosition = objectKey.lastIndexOf(".");
            console.log("Last dot position:", lastDotPosition);

            let normalizedObjectKey = null;

            if (
                lastDotPosition === -1 ||
                objectKey.slice(lastDotPosition + 1).includes("/")
            ) {
                normalizedObjectKey = `${objectKey}.${ext}`;
            } else {
                normalizedObjectKey = `${objectKey.slice(
                    0,
                    lastDotPosition + 1
                )}${ext}`;
            }

            console.log("Normalized object key:", normalizedObjectKey);

            // 検証済みコンテンツをS3の別オブジェクトとしてコピー
            // TODO: contentTypeも正す
            const copySource = `${bucketName}/${encodeURIComponent(objectKey)}`;
            const copyObjectCommandInput: CopyObjectCommandInput = {
                Bucket: bucketName,
                CopySource: copySource,
                Key: `verified/${objectKey}`,
                MetadataDirective: "COPY",
            };

            const copyObjectCommandResponse = await s3.send(
                new CopyObjectCommand(copyObjectCommandInput)
            );

            // アップロードセッションのステータスを更新
            // TODO: アップロードセッションの期待コンテンツタイプの検証（必要？）
            // TODO: エラーハンドリング
            const result = await prisma.eUploadSessions.update({
                where: {
                    objectKey: objectKey,
                },
                data: {
                    uploadStatus: "uploaded",
                    updatedAt: new Date(), // TODO: ちゃんと考える
                },
            });

            // console.log("Updated upload session:", result);
        } catch (error: any) {
            if (error?.$metadata?.httpStatusCode === 404) {
                console.error(
                    `File not found: ${objectKey} in bucket ${bucketName}`
                );
            } else {
                console.error("Error fetching object from S3:", error);
            }
            throw error;
        }
    }
};
