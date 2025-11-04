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
