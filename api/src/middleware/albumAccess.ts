import type { Context, Next } from "hono";
import { PrismaClient } from "@prisma/client";
import type { AuthUser } from "./auth.js";

const prisma = new PrismaClient();

/**
 * アルバムアクセス権限チェックミドルウェア
 * ユーザーが指定されたアルバムのメンバーかどうかを検証する
 * 
 * 前提: authMiddlewareが先に実行されていること
 */
export async function albumAccessMiddleware(c: Context, next: Next) {
    const user = c.get("user") as AuthUser | undefined;

    if (!user) {
        return c.json({ message: "Unauthorized: User not authenticated" }, 401);
    }

    const albumId = c.req.param("albumId");

    if (!albumId) {
        return c.json({ message: "Bad Request: Album ID is required" }, 400);
    }

    try {
        // idpUserIdからDBのユーザーを取得
        const dbUser = await prisma.rUsers.findUnique({
            where: { idpUserId: user.sub },
        });

        if (!dbUser) {
            return c.json({ message: "User not found in database" }, 404);
        }

        // ユーザーがアルバムのメンバーかチェック
        const membership = await prisma.rUsersAlbums.findUnique({
            where: {
                userId_albumId: {
                    userId: dbUser.userId,
                    albumId: BigInt(albumId),
                },
            },
        });

        if (!membership) {
            return c.json({ message: "Forbidden: You are not a member of this album" }, 403);
        }

        // DBユーザーとメンバーシップ情報をコンテキストに設定
        c.set("dbUser", dbUser);
        c.set("membership", membership);
        await next();
    } catch (error) {
        console.error("Album access check failed:", error);
        return c.json({ message: "Internal Server Error" }, 500);
    }
}
