import { z } from "zod";

// アップロード開始リクエスト
export const createUploadSchema = z.object({
    content_count: z.number().int().positive("content_count must be a positive integer"),
});

export type CreateUploadRequest = z.infer<typeof createUploadSchema>;

// 署名付きURL生成リクエスト
const contentInfoSchema = z.object({
    filename: z.string().min(1, "filename is required"),
    contentType: z.enum(["image/jpeg", "image/png"], {
        message: "contentType must be image/jpeg or image/png",
    }),
});

export const createUploadContentsSchema = z.object({
    contents: z.array(contentInfoSchema).min(1).max(20, "Maximum 20 files per request"),
});

export type CreateUploadContentsRequest = z.infer<typeof createUploadContentsSchema>;
export type ContentInfo = z.infer<typeof contentInfoSchema>;
