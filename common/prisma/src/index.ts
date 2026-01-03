import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
    prisma?: PrismaClient;
};

// PrismaClientのインスタンスを作成
export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        // log: ['query', 'info', 'warn', 'error'], // 必要なら
    });

// 開発環境ではグローバルにキャッシュしてホットリロード時の再生成を防止
if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}
