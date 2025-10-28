import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";
import { isAllowedImageContentType } from "./uploadConstants.js";

const app = new Hono();
const prisma = new PrismaClient();

const s3 = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

app.get("/", (c) => c.text("Hello Hono 🫶"));

// DB ヘルスチェック
app.get("/health/db", async (c) => {
    try {
        // 軽量クエリ: 現在時刻取得 (Prisma の RAW クエリ不要、簡易に SELECT 1)
        const result = await prisma.$queryRaw`SELECT 1 as ok`;
        return c.json({ status: "ok", result });
    } catch (e) {
        console.error("DB health check failed", e);
        return c.json({ status: "error" }, 500);
    }
});

/*
 * アップロード用の署名付きURLを生成する
 */
app.post("/contents/generate-signed-url", async (c) => {
    console.log("Request context:", c);

    let contentType: string;

    try {
        const body = await c.req.json();
        contentType = body.contentType;
    } catch (e) {
        return c.json(
            { error: "Invalid request body. Must be a valid JSON." },
            400
        );
    }

    if (!isAllowedImageContentType(contentType)) {
        return c.json({ error: "Invalid content type." }, 400);
    }

    // ユニークなオブジェクトキーを生成する
    // まずはUUIDv4を使う
    // キーの形式は "/{yyyy}/{mm}/{dd}/{uuidv4}.jpg"
    const dateDir = new Date().toISOString().slice(0, 10).replaceAll("-", "/");
    const objectKey = `${dateDir}/${randomUUID()}.jpg`;

    console.log("Generated object key:", objectKey);

    const mime = "image/jpeg";
    const putObjectCommand = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET!,
        Key: objectKey,
        ContentType: mime,
    });

    // アップロード用の署名付きURLを生成
    const uploadUrl = await getSignedUrl(s3, putObjectCommand, {
        expiresIn: 60, // TODO: マジックナンバーを廃止
    });

    const newUploadSession = await prisma.eUploadSessions.create({
        data: {
            objectKey: objectKey,
            uploadStatus: "pending",
            expectedContentType: contentType,
            maxBytes: 10 * 1024 * 1024, // TODO: マジックナンバーを廃止
            expiresAt: new Date(Date.now() + 60 * 1000), // TODO: マジックナンバーを廃止
            presignedUrl: uploadUrl,
        },
    });

    console.log("Created upload session:", newUploadSession);

    return c.json({ uploadUrl });
});

const port = Number(process.env.PORT ?? 3000);
console.log(`Listening on http://localhost:${port}`);
serve({ fetch: app.fetch, port });

// Graceful shutdown
const shutdown = async () => {
    console.log("Shutting down server...");
    try {
        await prisma.$disconnect();
        console.log("Prisma disconnected.");
    } catch (e) {
        console.error("Error during Prisma disconnect", e);
    } finally {
        process.exit(0);
    }
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
