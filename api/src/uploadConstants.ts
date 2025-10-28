// 許可されている画像のContent-Type一覧
export const ALLOWED_IMAGE_CONTENT_TYPES = [
    "image/jpeg",
    "image/png",
    "image/heic",
    "image/heif",
    "image/heic-sequence",
    "image/heif-sequence",
] as const;

// 許可されたが画像のContent-Typeの型
export type AllowedImageContentType =
    (typeof ALLOWED_IMAGE_CONTENT_TYPES)[number];

/*
 * 指定されたContent-Typeが許可された画像のContent-Typeかどうかを判定する
 */
export const isAllowedImageContentType = (
    value: string
): value is AllowedImageContentType =>
    (ALLOWED_IMAGE_CONTENT_TYPES as readonly string[]).includes(value);
