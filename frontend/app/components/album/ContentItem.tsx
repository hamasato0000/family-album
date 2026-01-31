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
}

export function ContentItem({ contentId, contentType, uri, caption }: ContentItemProps) {
    return (
        <div
            key={contentId}
            className="group relative aspect-square bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer border border-gray-100 hover:border-indigo-200"
        >
            {uri ? (
                <img
                    src={uri}
                    alt={caption || "コンテンツ"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
            ) : (
                <div className="w-full h-full bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center">
                    {contentType === "video" ? (
                        <VideoIcon className="w-12 h-12 text-indigo-400" />
                    ) : (
                        <PhotoIcon className="w-12 h-12 text-indigo-400" />
                    )}
                </div>
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
