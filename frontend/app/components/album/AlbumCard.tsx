import { Link } from "@remix-run/react";
import { PhotoIcon } from "~/components/icons/Icons";
import { formatDate } from "~/utils/date";

interface AlbumCardProps {
    /** アルバムID */
    albumId: string;
    /** コンテンツ数 */
    contentCount: number;
    /** 作成日 */
    createdAt: string;
}

export function AlbumCard({ albumId, contentCount, createdAt }: AlbumCardProps) {
    return (
        <Link
            to={`/albums/${albumId}`}
            className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-indigo-200"
        >
            {/* Album Thumbnail Placeholder */}
            <div className="aspect-video bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center">
                <PhotoIcon className="w-16 h-16 text-indigo-300 group-hover:scale-110 transition-transform duration-300" />
            </div>

            {/* Album Info */}
            <div className="p-5">
                <h3 className="text-lg font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors">
                    アルバム #{albumId}
                </h3>
                <div className="flex items-center justify-between mt-3 text-sm text-gray-500">
                    <span className="flex items-center">
                        <PhotoIcon className="w-4 h-4 mr-1" />
                        {contentCount} 枚
                    </span>
                    <span>{formatDate(createdAt)}</span>
                </div>
            </div>
        </Link>
    );
}
