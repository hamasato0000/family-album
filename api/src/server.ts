import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PrismaClient, Prisma } from "@prisma/client";
import type { RUser } from "@prisma/client";
import { nanoid } from "nanoid";
import { createHash } from "crypto";
import { zValidator } from "@hono/zod-validator";
import { createAlbumRequestSchema } from "./schemas.js";
import { createUploadSchema, createUploadContentsSchema } from "./schemas/upload.js";
import {
    PRESIGNED_URL_EXPIRES_SECONDS,
    getExtensionFromContentType,
} from "./uploadConstants.js";
import { cors } from "hono/cors";
import { authMiddleware } from "./middleware/auth.js";
import type { AuthUser } from "./middleware/auth.js";
import { albumAccessMiddleware } from "./middleware/albumAccess.js";

// Hono の Variables 型を定義
type Variables = {
    user: AuthUser;
    dbUser: RUser;
};

const app = new Hono<{ Variables: Variables }>();

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

// NanoID生成（12文字）
function generateNanoId(): string {
    return nanoid(12);
}

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

/**
 * ヘルパー関数: Auth0のsub（idpUserId）からDBユーザーを取得
 */
async function getDbUserFromAuth(user: AuthUser): Promise<RUser | null> {
    return prisma.rUser.findUnique({
        where: { idpUserId: user.sub },
    });
}

// ============================================================
// アップロードAPI
// ============================================================

/*
 * アップロード開始API
 * アップロードを作成し、upload_idを返却する
 * POST /albums/:albumId/uploads
 */
app.post(
    "/albums/:albumId/uploads",
    authMiddleware,
    albumAccessMiddleware,
    zValidator("json", createUploadSchema),
    async (c) => {
        const user = c.get("user");
        const albumId = c.req.param("albumId");
        const { content_count } = c.req.valid("json");

        // DBユーザーを取得
        const dbUser = await getDbUserFromAuth(user);
        if (!dbUser) {
            return c.json({ message: "User not found in database" }, 404);
        }

        // トランザクションでe_activityとe_uploadを作成
        const uploadId = generateNanoId();
        const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            // 1. e_activityレコード作成
            await tx.eActivity.create({
                data: {
                    activityId: uploadId,
                    albumId: albumId,
                    activityType: "upload",
                },
            });

            // 2. e_uploadレコード作成
            const upload = await tx.eUpload.create({
                data: {
                    uploadId: uploadId,
                    uploaderId: dbUser.userId,
                    photoCount: BigInt(content_count),
                    videoCount: BigInt(0),
                    status: "pending",
                },
            });

            return upload;
        });

        return c.json({
            upload_id: result.uploadId,
            status: result.status,
            content_count: content_count,
            created_at: result.createdAt.toISOString(),
        }, 201);
    }
);

/*
 * 署名付きURL生成API
 * コンテンツごとの署名付きURLを一括生成する
 * POST /uploads/:uploadId/contents
 */
app.post(
    "/uploads/:uploadId/contents",
    authMiddleware,
    zValidator("json", createUploadContentsSchema),
    async (c) => {
        const user = c.get("user");
        const uploadId = c.req.param("uploadId");
        const { contents } = c.req.valid("json");

        // DBユーザーを取得
        const dbUser = await getDbUserFromAuth(user);
        if (!dbUser) {
            return c.json({ message: "User not found in database" }, 404);
        }

        // uploadの存在確認と所有者確認
        const upload = await prisma.eUpload.findUnique({
            where: { uploadId },
            include: {
                activity: true,
            },
        });

        if (!upload) {
            return c.json({ message: "Upload not found" }, 404);
        }

        if (upload.uploaderId !== dbUser.userId) {
            return c.json({ message: "Forbidden: You are not the owner of this upload" }, 403);
        }

        // 既存コンテンツ数の確認
        const existingContentsCount = await prisma.rContent.count({
            where: { uploadId },
        });

        if (existingContentsCount + contents.length > Number(upload.photoCount + upload.videoCount)) {
            return c.json({ message: "Bad Request: Content count exceeds the expected count" }, 400);
        }

        // 各コンテンツの署名付きURLを生成
        const createdContents = [];

        for (const contentInfo of contents) {
            const contentId = generateNanoId();
            const extension = getExtensionFromContentType(contentInfo.contentType);

            if (!extension) {
                return c.json({ message: `Unsupported content type: ${contentInfo.contentType}` }, 400);
            }

            // S3キーの生成（raws/{upload_id}/{content_id}.{ext}）
            const rawPath = `raws/${uploadId}/${contentId}.${extension}`;

            // ファイル名からハッシュを生成（一意性のため、後で実際のファイルハッシュに更新可能）
            const contentHash = createHash("sha256")
                .update(`${uploadId}:${contentId}:${contentInfo.filename}:${Date.now()}`)
                .digest("hex");

            // 署名付きURL生成
            const putObjectCommand = new PutObjectCommand({
                Bucket: process.env.S3_BUCKET!,
                Key: rawPath,
                ContentType: contentInfo.contentType,
            });

            const presignedUrl = await getSignedUrl(s3ForPresignedUrl, putObjectCommand, {
                expiresIn: PRESIGNED_URL_EXPIRES_SECONDS,
            });

            // r_contentレコード作成
            await prisma.rContent.create({
                data: {
                    contentId,
                    albumId: upload.activity.albumId,
                    uploadId,
                    contentType: contentInfo.contentType.startsWith("image/") ? "image" : "video",
                    contentHash,
                    rawPath,
                    // thumbnailPath, fileSize, errorMessage, processedAt は Lambda で設定
                },
            });

            createdContents.push({
                content_id: contentId,
                presigned_url: presignedUrl,
                expires_in: PRESIGNED_URL_EXPIRES_SECONDS,
            });
        }

        return c.json({ contents: createdContents }, 201);
    }
);

/*
 * アップロード状態確認API
 * アップロードと配下のコンテンツの状態を取得する
 * GET /uploads/:uploadId
 */
app.get("/uploads/:uploadId", authMiddleware, async (c) => {
    const user = c.get("user");
    const uploadId = c.req.param("uploadId");

    // DBユーザーを取得
    const dbUser = await getDbUserFromAuth(user);
    if (!dbUser) {
        return c.json({ message: "User not found in database" }, 404);
    }

    // uploadの存在確認と所有者確認
    const upload = await prisma.eUpload.findUnique({
        where: { uploadId },
        include: {
            contents: {
                select: {
                    contentId: true,
                    rawPath: true,
                    thumbnailPath: true,
                    fileSize: true,
                    errorMessage: true,
                    photo: {
                        select: {
                            width: true,
                            height: true,
                        },
                    },
                },
            },
        },
    });

    if (!upload) {
        return c.json({ message: "Upload not found" }, 404);
    }

    if (upload.uploaderId !== dbUser.userId) {
        return c.json({ message: "Forbidden: You are not the owner of this upload" }, 403);
    }

    // コンテンツの状態をマッピング
    // 現在のスキーマではコンテンツのstatusフィールドは存在しないため、
    // thumbnailPath の有無や errorMessage の有無で状態を判別
    const contents = upload.contents.map((content) => {
        // 状態の判別ロジック
        let status: string;
        if (content.errorMessage) {
            status = "failed";
        } else if (content.thumbnailPath) {
            status = "completed";
        } else {
            status = "pending";
        }

        const baseResponse = {
            content_id: content.contentId,
            status,
        };

        if (status === "completed") {
            return {
                ...baseResponse,
                thumbnail_url: `${process.env.CDN_BASE_URL || ""}/${content.thumbnailPath}`,
                raw_url: `${process.env.CDN_BASE_URL || ""}/${content.rawPath}`,
                width: content.photo ? Number(content.photo.width) : null,
                height: content.photo ? Number(content.photo.height) : null,
                file_size: content.fileSize ? Number(content.fileSize) : null,
            };
        } else if (status === "failed") {
            return {
                ...baseResponse,
                error_message: content.errorMessage,
            };
        }

        return baseResponse;
    });

    // サマリ計算
    const summary = {
        pending: contents.filter((c) => c.status === "pending").length,
        processing: 0, // 現在のスキーマでは判別不可
        completed: contents.filter((c) => c.status === "completed").length,
        failed: contents.filter((c) => c.status === "failed").length,
    };

    return c.json({
        upload_id: upload.uploadId,
        status: upload.status,
        content_count: Number(upload.photoCount + upload.videoCount),
        created_at: upload.createdAt.toISOString(),
        completed_at: null, // スキーマにcompletedAtがないため
        contents,
        summary,
    });
});

// ============================================================
// アルバムAPI
// ============================================================

/*
 * アルバムを作成する
 * NOTE: 認証必須
 */
app.post(
    "/albums",
    authMiddleware,
    zValidator("json", createAlbumRequestSchema),
    async (c) => {
        const user = c.get("user");
        const { nickname, childRelation } = c.req.valid("json");

        // DBユーザーを取得
        const dbUser = await getDbUserFromAuth(user);
        if (!dbUser) {
            return c.json({ message: "User not found in database" }, 404);
        }

        // トランザクションでアルバムとユーザー紐付けを同時に作成
        const albumId = generateNanoId();
        const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            // 1. アルバムを作成
            const newAlbum = await tx.rAlbum.create({
                data: {
                    albumId,
                },
            });

            // 2. ユーザーとアルバムを紐付け（作成者は owner ロール）
            await tx.rUserAlbum.create({
                data: {
                    userId: dbUser.userId,
                    albumId: newAlbum.albumId,
                    role: "owner",
                    childRelation: childRelation,
                    nickname: nickname,
                },
            });

            return newAlbum;
        });

        return c.json({
            albumId: result.albumId,
            createdAt: result.createdAt.toISOString(),
        }, 201);
    }
);

/*
 * アルバム一覧を取得する
 * NOTE: ユーザーが参加しているアルバムのみ取得、認証必須
 */
app.get("/albums", authMiddleware, async (c) => {
    const user = c.get("user");

    // DBユーザーを取得
    const dbUser = await getDbUserFromAuth(user);
    if (!dbUser) {
        return c.json({ message: "User not found in database" }, 404);
    }

    // ユーザーが参加しているアルバムを取得
    const userAlbums = await prisma.rUserAlbum.findMany({
        where: { userId: dbUser.userId },
        include: {
            album: {
                include: {
                    _count: {
                        select: { contents: true },
                    },
                },
            },
        },
        orderBy: { album: { createdAt: "desc" } },
    });

    return c.json({
        albums: userAlbums.map((ua: typeof userAlbums[number]) => ({
            albumId: ua.album.albumId,
            createdAt: ua.album.createdAt.toISOString(),
            updatedAt: ua.album.updatedAt.toISOString(),
            contentCount: ua.album._count.contents,
            role: ua.role,
            nickname: ua.nickname,
        })),
    });
});

/*
 * アルバム詳細を取得する（メンバー情報含む）
 * NOTE: 認証必須、アルバムメンバーのみアクセス可能
 */
app.get("/albums/:albumId", authMiddleware, albumAccessMiddleware, async (c) => {
    const albumId = c.req.param("albumId");

    const album = await prisma.rAlbum.findUnique({
        where: { albumId },
        include: {
            _count: {
                select: { contents: true },
            },
            userAlbums: {
                include: {
                    user: {
                        select: {
                            userId: true,
                            displayName: true,
                        },
                    },
                },
                orderBy: [
                    { role: "asc" }, // owner -> admin -> member の順
                    { joinedAt: "asc" },
                ],
            },
        },
    });

    if (!album) {
        return c.json({ message: "Album not found" }, 404);
    }

    return c.json({
        albumId: album.albumId,
        createdAt: album.createdAt.toISOString(),
        updatedAt: album.updatedAt.toISOString(),
        contentCount: album._count.contents,
        members: album.userAlbums.map((ua: typeof album.userAlbums[number]) => ({
            userId: ua.user.userId.toString(),
            displayName: ua.user.displayName,
            nickname: ua.nickname,
            role: ua.role,
            childRelation: ua.childRelation,
            joinedAt: ua.joinedAt.toISOString(),
        })),
    });
});

/*
 * アルバム内のコンテンツ一覧を取得する
 * NOTE: 認証必須、アルバムメンバーのみアクセス可能
 */
app.get("/albums/:albumId/contents", authMiddleware, albumAccessMiddleware, async (c) => {
    const albumId = c.req.param("albumId");

    const contents = await prisma.rContent.findMany({
        where: { albumId },
        orderBy: { createdAt: "desc" },
        select: {
            contentId: true,
            contentType: true,
            rawPath: true,
            thumbnailPath: true,
            caption: true,
            takenAt: true,
            createdAt: true,
        },
    });

    return c.json({
        albumId: albumId,
        contents: contents.map((content) => ({
            contentId: content.contentId,
            contentType: content.contentType,
            rawUrl: content.rawPath ? `${process.env.CDN_BASE_URL || ""}/${content.rawPath}` : null,
            thumbnailUrl: content.thumbnailPath ? `${process.env.CDN_BASE_URL || ""}/${content.thumbnailPath}` : null,
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
