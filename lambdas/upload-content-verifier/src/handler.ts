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

// 許容するファイルタイプのリストを定義
const ALLOWED_FILE_TYPES = new Set(["jpg", "png", "heic", "heif"]);

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
        try {
            ////////////////////////////////////////////
            // イベント発生源のS3オブジェクトの取得
            ////////////////////////////////////////////
            const bucketName = record.s3.bucket.name;
            const objectKey = record.s3.object.key;

            console.log(`Processing file ${objectKey}`);

            const getObjectCommand = new GetObjectCommand({
                Bucket: bucketName,
                Key: objectKey,
            });

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

            ////////////////////////////////////////////
            // ファイルタイプを検出とチェック
            ////////////////////////////////////////////
            const fileType = await fileTypeFromBuffer(imageBuffer);
            if (!fileType) {
                throw new Error(
                    `Could not determine file type for ${objectKey}`
                );
            }

            const { ext, mime } = fileType;
            console.log(`Detected file type: ${ext}, MIME type: ${mime}`);

            const lowerCaseExt = ext.toLowerCase();

            // 検出したファイルタイプが許容リストに含まれているか確認
            if (!ALLOWED_FILE_TYPES.has(lowerCaseExt)) {
                console.error(
                    `Invalid file type: ${ext} for file ${objectKey}`
                );
                continue;
            }

            ////////////////////////////////////////////
            // 拡張子の正規化
            ////////////////////////////////////////////
            const lastDotPosition = objectKey.lastIndexOf(".");

            const normalizedObjectKey =
                lastDotPosition === -1 ||
                objectKey.slice(lastDotPosition + 1).includes("/")
                    ? `${objectKey}.${lowerCaseExt}`
                    : `${objectKey.slice(
                          0,
                          lastDotPosition + 1
                      )}${lowerCaseExt}`;

            console.log("Normalized object key:", normalizedObjectKey);

            ////////////////////////////////////////////////
            // 検証済みコンテンツをS3の別オブジェクトとしてコピー
            ////////////////////////////////////////////////
            const copySource = `${bucketName}/${encodeURIComponent(objectKey)}`;
            const copyObjectCommandInput: CopyObjectCommandInput = {
                Bucket: bucketName,
                CopySource: copySource,
                ContentType: mime,
                Key: `verified/${objectKey}`,
                MetadataDirective: "REPLACE",
            };
            await s3.send(new CopyObjectCommand(copyObjectCommandInput));

            // アップロードセッションのステータスを更新
            // TODO: アップロードセッションの期待コンテンツタイプの検証（必要？）
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
            console.error("Error fetching object from S3:", error);
            throw error;
        }
    }
};
