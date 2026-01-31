/**
 * 日付を日本語フォーマットで表示
 * @param dateString - ISO形式の日付文字列
 * @returns フォーマットされた日付文字列（例: 2026年1月31日）
 */
export function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}
