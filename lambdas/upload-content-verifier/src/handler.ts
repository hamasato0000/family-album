import type { S3Event, Context } from "aws-lambda";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from "stream";
import dotenv from "dotenv";
import { fileTypeFromBuffer } from "file-type";

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
            const response = await s3.send(getObjectCommand);

            // S3から取得したデータをストリームとして扱う
            const stream = response.Body as Readable;

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

            // ファイルタイプを検出
            const fileType = await fileTypeFromBuffer(imageBuffer);

            console.log(fileType);
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
