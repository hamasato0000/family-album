import { PhotoIcon, VideoIcon } from "~/components/icons/Icons";

interface ContentItemProps {
    /** コンテンツID */
    contentId: string;
    /** コンテンツタイプ */
    contentType: "image" | "video";
    /** コンテンツのURI */
    uri?: string;
    /** キャプション */
    caption?: string;
    /** コンテンツの処理状態 */
    status: "pending" | "processing" | "completed" | "failed";
}

/**
 * スケルトン表示用コンポーネント
 * status が pending / processing / failed の場合に表示
 */
function ContentSkeleton({ contentType, status }: { contentType: "image" | "video"; status: string }) {
    return (
        <div className="w-full h-full bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 flex flex-col items-center justify-center gap-2">
            {/* パルスアニメーション付きアイコン */}
            <div className={`${status === "failed" ? "" : "animate-pulse"}`}>
                {contentType === "video" ? (
                    <VideoIcon className={`w-10 h-10 ${status === "failed" ? "text-red-300" : "text-gray-300"}`} />
                ) : (
                    <PhotoIcon className={`w-10 h-10 ${status === "failed" ? "text-red-300" : "text-gray-300"}`} />
                )}
            </div>
            {/* ステータス表示 */}
            <span className={`text-xs font-medium ${status === "failed" ? "text-red-400" : "text-gray-400"}`}>
                {status === "pending" && "処理待ち"}
                {status === "processing" && "処理中..."}
                {status === "failed" && "処理失敗"}
            </span>
        </div>
    );
}

export function ContentItem({ contentId, contentType, uri, caption, status }: ContentItemProps) {
    const isReady = status === "completed" && uri;

    return (
        <div
            key={contentId}
            className="group relative aspect-square bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer border border-gray-100 hover:border-primary-200"
        >
            {isReady ? (
                <img
                    src={uri}
                    alt={caption || "コンテンツ"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                />
            ) : (
                <ContentSkeleton contentType={contentType} status={status} />
            )}
            {/* Video indicator badge */}
            {contentType === "video" && (
                <div className="absolute bottom-2 right-2 bg-black/60 text-white px-2 py-1 rounded-md text-xs font-medium">
                    動画
                </div>
            )}
        </div>
    );
}
