import type { MetaFunction } from "@remix-run/node";
import { useParams, Link } from "@remix-run/react";
import { useEffect, useState } from "react";
import { getAlbum, type AlbumDetail } from "~/services/api";

export const meta: MetaFunction = () => {
    return [
        { title: "アルバム設定 - Family Album" },
        { name: "description", content: "アルバムの設定とメンバー管理" },
    ];
};

export default function AlbumSettings() {
    const { albumId } = useParams<{ albumId: string }>();
    const [album, setAlbum] = useState<AlbumDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (albumId) {
            fetchAlbum(albumId);
        }
    }, [albumId]);

    const fetchAlbum = async (id: string) => {
        try {
            setLoading(true);
            const albumData = await getAlbum(id);
            setAlbum(albumData);
        } catch (err) {
            setError("アルバムの取得に失敗しました");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("ja-JP", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error || !album) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 mb-4">{error || "アルバムが見つかりません"}</div>
                    <Link
                        to="/albums"
                        className="text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                        ← アルバム一覧に戻る
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            <div className="max-w-4xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        to={`/albums/${album.albumId}`}
                        className="inline-flex items-center text-gray-600 hover:text-indigo-600 transition-colors mb-4"
                    >
                        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        コンテンツ一覧に戻る
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">
                        アルバム設定
                    </h1>
                    <p className="mt-2 text-gray-600">
                        アルバム #{album.albumId}
                    </p>
                </div>

                {/* Album Info */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        アルバム情報
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-500 mb-1">作成日</p>
                            <p className="font-medium text-gray-900">{formatDate(album.createdAt)}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-500 mb-1">コンテンツ数</p>
                            <p className="font-medium text-gray-900">{album.contentCount} 枚</p>
                        </div>
                    </div>
                </div>

                {/* Members Section */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                        メンバー ({album.members.length}人)
                    </h2>
                    <div className="space-y-3">
                        {album.members.map((member) => (
                            <div
                                key={member.userId}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                            >
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                                        {member.nickname.charAt(0)}
                                    </div>
                                    <div className="ml-4">
                                        <p className="font-semibold text-gray-900 text-lg">
                                            {member.nickname}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {member.displayName} • {member.childRelation}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            参加日: {formatDate(member.joinedAt)}
                                        </p>
                                    </div>
                                </div>
                                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${member.role === "owner"
                                        ? "bg-amber-100 text-amber-800"
                                        : member.role === "admin"
                                            ? "bg-blue-100 text-blue-800"
                                            : "bg-gray-100 text-gray-700"
                                    }`}>
                                    {member.role === "owner" ? "管理者" : member.role === "admin" ? "副管理者" : "メンバー"}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Invite button placeholder */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <button
                            className="inline-flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 font-medium rounded-lg hover:bg-indigo-100 transition-colors"
                            onClick={() => alert("メンバー招待機能は今後実装予定です")}
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                            メンバーを招待
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
