import {
    GetObjectCommand,
    PutObjectCommand,
    S3Client,
} from "@aws-sdk/client-s3";
import { S3Event, Context } from "aws-lambda";
import sharp from "sharp";

const s3 = new S3Client({ region: "ap-northeast-1" });

const THUMBNAIL_WIDTH = 300;
const THUMBNAIL_HEIGHT = 300;
const THUMBNAIL_PREFIX = "thumbnails/";

export const handler = async (
    event: S3Event,
    context: Context
): Promise<void> => {
    for (const record of event.Records) {
        const bucket = record.s3.bucket.name;
        const srcKey = decodeURIComponent(
            record.s3.object.key.replace(/\+/g, " ")
        );

        if (srcKey.startsWith(THUMBNAIL_PREFIX)) {
            console.log("This is a thumbnail, skipping.");
            continue;
        }

        try {
            // S3から画像データを取得
            const getCommand = new GetObjectCommand({
                Bucket: bucket,
                Key: srcKey,
            });
            const response = await s3.send(getCommand);

            if (!response.Body) throw new Error("No object body found");

            // ストリームをバッファに変換
            const srcArrayBuffer = await response.Body.transformToByteArray();
            const srcBuffer = Buffer.from(srcArrayBuffer);

            // 画像をリサイズ
            const resizedBuffer = await sharp(srcBuffer)
                .resize(THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT, {
                    fit: "cover", // 枠いっぱいに埋める（はみ出た部分はトリミング）
                    position: "center", // 中央を基準にトリミング
                })
                .toFormat("jpeg", { quality: 80 }) // 形式を統一
                .toBuffer();

            // サムネイルをS3にアップロード
            const destKey = `${THUMBNAIL_PREFIX}${srcKey}`;
            await s3.send(
                new PutObjectCommand({
                    Bucket: bucket,
                    Key: destKey,
                    Body: resizedBuffer,
                    ContentType: "image/jpeg",
                })
            );

            console.log(`Successfully resized ${srcKey} to ${destKey}`);
        } catch (error) {
            console.error("Error processing object", srcKey, error);
            throw error;
        }
    }
};
