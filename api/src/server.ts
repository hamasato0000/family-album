import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const app = new Hono();

const s3 = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

app.get("/", (c) => c.text("Hello Hono 🫶"));

app.post("/contents/generate-signed-url", async (c) => {
    console.log(c);
    const objectKey = "test.text"; // TODO: 適切なオブジェクトキーを設定
    const mime = "text/plain"; // TODO: 適切なMIMEタイプを設定
    const putObjectCommand = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET!,
        Key: objectKey,
        ContentType: mime,
    });

    // アップロード用の署名付きURLを生成
    const uploadUrl = await getSignedUrl(s3, putObjectCommand, {
        expiresIn: 60, // 60秒
    });

    return c.json({ uploadUrl });
});

const port = Number(process.env.PORT ?? 3000);
console.log(`Listening on http://localhost:${port}`);
serve({ fetch: app.fetch, port });
