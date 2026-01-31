import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";
import { zValidator } from "@hono/zod-validator";
import { generateSignedUrlRequestSchema } from "./schemas.js";
import {
    MAX_UPLOAD_BYTES,
    PRESIGNED_URL_EXPIRES_SECONDS,
    getExtensionFromContentType,
} from "./uploadConstants.js";
import { cors } from "hono/cors";

const app = new Hono();

app.use(
    "*",
    cors({
        origin: "*", // MVP development: allow all origins
        allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowHeaders: ["Content-Type", "Authorization"],
        exposeHeaders: ["Content-Length"],
        maxAge: 600,
        credentials: true,
    })
);
const prisma = new PrismaClient();

const s3 = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
    ...(process.env.AWS_ENDPOINT_URL && {
        endpoint: process.env.AWS_ENDPOINT_URL,
        forcePathStyle: true,
    }),
});

// 署名付きURL生成用のS3クライアント（ブラウザからアクセスするためlocalhostを使用）
const s3ForPresignedUrl = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
    ...(process.env.S3_PRESIGNED_ENDPOINT && {
        endpoint: process.env.S3_PRESIGNED_ENDPOINT,
        forcePathStyle: true,
    }),
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
app.post(
    "/contents/generate-signed-url",
    zValidator("json", generateSignedUrlRequestSchema),
    async (c) => {
        console.log("Request context:", c);

        const contentType = c.req.valid("json").contentType;

        // ユニークなオブジェクトキーを生成する
        // まずはUUIDv4を使う
        // キーの形式は "/{yyyy}/{mm}/{dd}/{uuidv4}.jpg"
        const dateDir = new Date()
            .toISOString()
            .slice(0, 10)
            .replaceAll("-", "/");

        // Content-Typeから拡張子を決定する
        // NOTE: ここはスキーマでバリデーション済みなので必ず取得できるはず
        const extension = getExtensionFromContentType(contentType);
        if (!extension) {
            return c.json(
                { message: "Unsupported content type for extension mapping" },
                400
            );
        }

        const objectKey = `${dateDir}/${randomUUID()}.${extension}`;

        console.log("Generated object key:", objectKey);

        const putObjectCommand = new PutObjectCommand({
            Bucket: process.env.S3_BUCKET!,
            Key: objectKey,
            ContentType: contentType,
        });

        // アップロード用の署名付きURLを生成
        const uploadUrl = await getSignedUrl(s3ForPresignedUrl, putObjectCommand, {
            expiresIn: 60, // TODO: マジックナンバーを廃止
        });

        const newUploadSession = await prisma.eUploadSessions.create({
            data: {
                objectKey: objectKey,
                uploadStatus: "pending",
                expectedContentType: contentType,
                maxBytes: MAX_UPLOAD_BYTES,
                expiresAt: new Date(
                    Date.now() + PRESIGNED_URL_EXPIRES_SECONDS * 1000
                ),
                presignedUrl: uploadUrl,
            },
        });

        console.log("Created upload session:", newUploadSession);

        return c.json({ uploadUrl });
    }
);

/*
 * アルバムを作成する
 */
app.post("/albums", async (c) => {
    const newAlbum = await prisma.rAlbums.create({
        data: {},
    });

    return c.json({
        albumId: newAlbum.albumId.toString(),
        createdAt: newAlbum.createdAt.toISOString(),
    }, 201);
});

/*
 * アルバム一覧を取得する
 */
app.get("/albums", async (c) => {
    const albums = await prisma.rAlbums.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            _count: {
                select: { contents: true },
            },
        },
    });

    return c.json({
        albums: albums.map((album) => ({
            albumId: album.albumId.toString(),
            createdAt: album.createdAt.toISOString(),
            updatedAt: album.updatedAt.toISOString(),
            contentCount: album._count.contents,
        })),
    });
});

/*
 * アルバム詳細を取得する
 */
app.get("/albums/:albumId", async (c) => {
    const albumId = c.req.param("albumId");

    const album = await prisma.rAlbums.findUnique({
        where: { albumId: BigInt(albumId) },
        include: {
            _count: {
                select: { contents: true },
            },
        },
    });

    if (!album) {
        return c.json({ message: "Album not found" }, 404);
    }

    return c.json({
        albumId: album.albumId.toString(),
        createdAt: album.createdAt.toISOString(),
        updatedAt: album.updatedAt.toISOString(),
        contentCount: album._count.contents,
    });
});

/*
 * アルバム内のコンテンツ一覧を取得する
 */
app.get("/albums/:albumId/contents", async (c) => {
    const albumId = c.req.param("albumId");

    // アルバムの存在確認
    const album = await prisma.rAlbums.findUnique({
        where: { albumId: BigInt(albumId) },
    });

    if (!album) {
        return c.json({ message: "Album not found" }, 404);
    }

    const contents = await prisma.rContents.findMany({
        where: { albumId: BigInt(albumId) },
        orderBy: { createdAt: "desc" },
        select: {
            contentId: true,
            contentType: true,
            uri: true,
            storageKey: true,
            caption: true,
            takenAt: true,
            createdAt: true,
        },
    });

    return c.json({
        albumId: albumId,
        contents: contents.map((content) => ({
            contentId: content.contentId.toString(),
            contentType: content.contentType,
            uri: content.uri,
            storageKey: content.storageKey,
            caption: content.caption,
            takenAt: content.takenAt?.toISOString() ?? null,
            createdAt: content.createdAt.toISOString(),
        })),
    });
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
