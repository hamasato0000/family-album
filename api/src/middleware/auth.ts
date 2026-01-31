import type { Context, Next } from "hono";
import { createRemoteJWKSet, jwtVerify } from "jose";

const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN!;
const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE!;

// JWKSをキャッシュするためにモジュールレベルで初期化
let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

function getJWKS() {
    if (!jwks) {
        if (!AUTH0_DOMAIN) {
            throw new Error("AUTH0_DOMAIN environment variable is not set");
        }
        jwks = createRemoteJWKSet(
            new URL(`https://${AUTH0_DOMAIN}/.well-known/jwks.json`)
        );
    }
    return jwks;
}

/**
 * 認証済みユーザーの情報
 */
export interface AuthUser {
    /** Auth0のユーザーID（sub claim）- DBのidpUserIdに対応 */
    sub: string;
}

/**
 * JWT検証ミドルウェア
 * Authorizationヘッダーからトークンを取得し、Auth0のJWKSで検証する
 */
export async function authMiddleware(c: Context, next: Next) {
    const authHeader = c.req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return c.json({ message: "Unauthorized: Missing or invalid Authorization header" }, 401);
    }

    const token = authHeader.slice(7); // "Bearer "を除去

    try {
        const { payload } = await jwtVerify(token, getJWKS(), {
            issuer: `https://${AUTH0_DOMAIN}/`,
            audience: AUTH0_AUDIENCE,
        });

        if (!payload.sub) {
            return c.json({ message: "Unauthorized: Invalid token payload" }, 401);
        }

        // 認証済みユーザー情報をコンテキストに設定
        c.set("user", { sub: payload.sub } as AuthUser);
        await next();
    } catch (error) {
        console.error("JWT verification failed:", error);
        return c.json({ message: "Unauthorized: Invalid token" }, 401);
    }
}
