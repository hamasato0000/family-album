import { z } from "zod";
import {
    ALLOWED_IMAGE_CONTENT_TYPES,
    isAllowedImageContentType,
} from "./uploadConstants.js";

// アップロード用の署名付きURL生成リクエストのスキーマ
export const generateSignedUrlRequestSchema = z.object({
    contentType: z.string().refine(isAllowedImageContentType, {
        message: `Unsupported content type. Allowed types are: ${ALLOWED_IMAGE_CONTENT_TYPES.join(
            ", "
        )}`,
    }),
});

// アルバム作成リクエストのスキーマ
export const createAlbumRequestSchema = z.object({
    nickname: z.string().min(1, "ニックネームは必須です").max(50, "ニックネームは50文字以内で入力してください"),
    childRelation: z.string().min(1, "子どもとの関係は必須です").max(20, "子どもとの関係は20文字以内で入力してください"),
});
