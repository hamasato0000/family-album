import type { MetaFunction } from "@remix-run/node";
import { useParams, useNavigate } from "@remix-run/react";
import { useEffect, useState } from "react";
import { type ContentDetail } from "~/services/api";
import { useApi } from "~/hooks/useApi";
import { ProtectedRoute } from "~/components/auth/ProtectedRoute";
import { PageLayout } from "~/components/common/PageLayout";
import { LoadingSpinner } from "~/components/common/LoadingSpinner";
import { ErrorMessage } from "~/components/common/ErrorMessage";
import { BackLink } from "~/components/common/BackLink";
import { Button } from "~/components/ui/Button";
import { Modal } from "~/components/ui/Modal";
import { TrashIcon } from "~/components/icons/Icons";
import { formatDate } from "~/utils/date";

export const meta: MetaFunction = () => {
    return [
        { title: "コンテンツ詳細 - Family Album" },
        { name: "description", content: "コンテンツの詳細表示" },
    ];
};

export default function ContentDetailPage() {
    return (
        <ProtectedRoute>
            <ContentDetailContent />
        </ProtectedRoute>
    );
}

function ContentDetailContent() {
    const { albumId, contentId } = useParams<{ albumId: string; contentId: string }>();
    const navigate = useNavigate();
    const [content, setContent] = useState<ContentDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const api = useApi();

    useEffect(() => {
        if (albumId && contentId) {
            fetchContent(albumId, contentId);
        }
    }, [albumId, contentId]);

    const fetchContent = async (aId: string, cId: string) => {
        try {
            setLoading(true);
            const data = await api.getContent(aId, cId);
            setContent(data);
        } catch (err) {
            setError("コンテンツの取得に失敗しました");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!albumId || !contentId) return;

        try {
            setDeleting(true);
            await api.deleteContent(albumId, contentId);
            navigate(`/albums/${albumId}`, { replace: true });
        } catch (err) {
            console.error("コンテンツの削除に失敗しました:", err);
            setDeleting(false);
            setIsDeleteModalOpen(false);
        }
    };

    if (loading) {
        return <LoadingSpinner fullScreen />;
    }

    if (error || !content) {
        return (
            <ErrorMessage
                fullScreen
                message={error || "コンテンツが見つかりません"}
                backTo={`/albums/${albumId}`}
                backLabel="アルバムに戻る"
            />
        );
    }

    const formatFileSize = (bytes: number | null): string => {
        if (bytes === null) return "不明";
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <PageLayout>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div>
                    <BackLink to={`/albums/${albumId}`} className="mb-4">
                        アルバムに戻る
                    </BackLink>
                    <h1 className="text-2xl font-bold text-gray-900">
                        コンテンツ詳細
                    </h1>
                </div>
                <div className="flex items-center gap-3 mt-4 md:mt-0">
                    <button
                        onClick={() => setIsDeleteModalOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors duration-200"
                        aria-label="削除"
                    >
                        <TrashIcon className="w-5 h-5" />
                        削除
                    </button>
                </div>
            </div>

            {/* メイン画像 */}
            <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
                <div className="flex items-center justify-center bg-gray-50 min-h-[300px] max-h-[70vh]">
                    {content.rawUrl ? (
                        <img
                            src={content.rawUrl}
                            alt={content.caption || "コンテンツ"}
                            className="max-w-full max-h-[70vh] object-contain"
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                            <p className="text-lg">画像を表示できません</p>
                        </div>
                    )}
                </div>

                {/* メタ情報 */}
                <div className="p-6 border-t border-gray-100">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {content.takenAt && (
                            <div>
                                <p className="text-xs text-gray-400 font-medium mb-1">撮影日</p>
                                <p className="text-sm text-gray-700">{formatDate(content.takenAt)}</p>
                            </div>
                        )}
                        <div>
                            <p className="text-xs text-gray-400 font-medium mb-1">アップロード日</p>
                            <p className="text-sm text-gray-700">{formatDate(content.createdAt)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 font-medium mb-1">種類</p>
                            <p className="text-sm text-gray-700">{content.contentType === "image" ? "写真" : "動画"}</p>
                        </div>
                        {content.fileSize !== null && (
                            <div>
                                <p className="text-xs text-gray-400 font-medium mb-1">ファイルサイズ</p>
                                <p className="text-sm text-gray-700">{formatFileSize(content.fileSize)}</p>
                            </div>
                        )}
                        {content.width !== null && content.height !== null && (
                            <div>
                                <p className="text-xs text-gray-400 font-medium mb-1">解像度</p>
                                <p className="text-sm text-gray-700">{content.width} × {content.height}</p>
                            </div>
                        )}
                        {content.durationSeconds !== null && (
                            <div>
                                <p className="text-xs text-gray-400 font-medium mb-1">再生時間</p>
                                <p className="text-sm text-gray-700">{content.durationSeconds}秒</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 削除確認モーダル */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="コンテンツの削除"
            >
                <div className="space-y-4">
                    <p className="text-gray-600">
                        このコンテンツを削除しますか？この操作は取り消せません。
                    </p>
                    <div className="flex justify-end gap-3">
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setIsDeleteModalOpen(false)}
                            disabled={deleting}
                        >
                            キャンセル
                        </Button>
                        <button
                            onClick={handleDelete}
                            disabled={deleting}
                            className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {deleting ? (
                                <>
                                    <svg
                                        className="animate-spin -ml-1 mr-2 h-4 w-4"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    削除中...
                                </>
                            ) : (
                                "削除する"
                            )}
                        </button>
                    </div>
                </div>
            </Modal>
        </PageLayout>
    );
}
