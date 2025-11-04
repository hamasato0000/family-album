// 許可されている画像のContent-Typeと対応するメタ情報（拡張子）の一覧
export const IMAGE_CONTENT_TYPE_META = {
    "image/jpeg": { extension: "jpg" },
    "image/png": { extension: "png" },
    "image/heic": { extension: "heic" },
    "image/heif": { extension: "heif" },
    "image/heic-sequence": { extension: "heic" }, // sequenceも単一と同じ拡張子運用
    "image/heif-sequence": { extension: "heif" },
} as const; // as constでプロパティをreadonly化

// typeofでIMAGE_CONTENT_TYPE_METAの型を取得
// keyofでそのキーのユニオン型を取得
export type AllowedImageContentType = keyof typeof IMAGE_CONTENT_TYPE_META;

// 許可されている画像のContent-Type一覧（配列が必要なケース向け）
export const ALLOWED_IMAGE_CONTENT_TYPES: readonly AllowedImageContentType[] =
    Object.keys(IMAGE_CONTENT_TYPE_META) as AllowedImageContentType[];

/**
 * 指定された Content-Type が許可されているか
 */
export const isAllowedImageContentType = (
    value: string
): value is AllowedImageContentType => value in IMAGE_CONTENT_TYPE_META;

export const PRESIGNED_URL_EXPIRES_SECONDS = 60;
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10MB

/**
 * Content-Type から拡張子 (ドットなし) を取得。不明な場合は undefined
 **/
export const getExtensionFromContentType = (
    contentType: string
): string | undefined =>
    isAllowedImageContentType(contentType)
        ? IMAGE_CONTENT_TYPE_META[contentType].extension
        : undefined;
