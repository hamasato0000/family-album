import type { MetaFunction } from "@remix-run/node";
import { useParams } from "@remix-run/react";
import { useEffect, useState } from "react";
import { type AlbumDetail, type AlbumContent } from "~/services/api";
import { useApi } from "~/hooks/useApi";
import { ProtectedRoute } from "~/components/auth/ProtectedRoute";
import { PageLayout } from "~/components/common/PageLayout";
import { LoadingSpinner } from "~/components/common/LoadingSpinner";
import { ErrorMessage } from "~/components/common/ErrorMessage";
import { BackLink } from "~/components/common/BackLink";
import { EmptyState } from "~/components/ui/EmptyState";
import { Button } from "~/components/ui/Button";
import { Modal } from "~/components/ui/Modal";
import { ContentItem } from "~/components/album/ContentItem";
import { Upload } from "~/components/Upload";
import { PhotoIcon, UploadIcon, SettingsIcon } from "~/components/icons/Icons";
import { formatDate } from "~/utils/date";

export const meta: MetaFunction = () => {
    return [
        { title: "アルバム詳細 - Family Album" },
        { name: "description", content: "アルバムの写真・動画一覧" },
    ];
};

export default function AlbumDetailPage() {
    return (
        <ProtectedRoute>
            <AlbumDetailContent />
        </ProtectedRoute>
    );
}

function AlbumDetailContent() {
    const { albumId } = useParams<{ albumId: string }>();
    const [album, setAlbum] = useState<AlbumDetail | null>(null);
    const [contents, setContents] = useState<AlbumContent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const api = useApi();

    useEffect(() => {
        if (albumId) {
            fetchAlbumData(albumId);
        }
    }, [albumId]);

    const fetchAlbumData = async (id: string) => {
        try {
            setLoading(true);
            const [albumData, contentsData] = await Promise.all([
                api.getAlbum(id),
                api.getAlbumContents(id),
            ]);
            setAlbum(albumData);
            setContents(contentsData.contents);
        } catch (err) {
            setError("アルバムの取得に失敗しました");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUploadComplete = () => {
        setIsUploadModalOpen(false);
        // コンテンツを再読み込み
        if (albumId) {
            fetchAlbumData(albumId);
        }
    };

    if (loading) {
        return <LoadingSpinner fullScreen />;
    }

    if (error || !album) {
        return (
            <ErrorMessage
                fullScreen
                message={error || "アルバムが見つかりません"}
                backTo="/albums"
                backLabel="アルバム一覧に戻る"
            />
        );
    }

    return (
        <PageLayout>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                <div>
                    <BackLink to="/albums" className="mb-4">
                        アルバム一覧
                    </BackLink>
                    <h1 className="text-3xl font-bold text-gray-900">
                        アルバム #{album.albumId}
                    </h1>
                    <p className="mt-2 text-gray-600">
                        作成日: {formatDate(album.createdAt)} • {album.contentCount} 枚
                    </p>
                </div>
                <div className="flex items-center gap-3 mt-4 md:mt-0">
                    <Button onClick={() => setIsUploadModalOpen(true)}>
                        <UploadIcon className="w-5 h-5 mr-2" />
                        写真を追加
                    </Button>
                    <Button variant="secondary" to={`/albums/${album.albumId}/settings`}>
                        <SettingsIcon className="w-5 h-5 mr-2" />
                        設定
                    </Button>
                </div>
            </div>

            {/* Contents Grid */}
            {contents.length === 0 ? (
                <EmptyState
                    icon={<PhotoIcon className="w-12 h-12 text-indigo-400" />}
                    title="まだ写真がありません"
                    description="上の「写真を追加」ボタンから、思い出を残しましょう"
                />
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {contents.map((content) => (
                        <ContentItem
                            key={content.contentId}
                            contentId={content.contentId}
                            contentType={content.contentType as "image" | "video"}
                            uri={content.thumbnailUrl ?? content.rawUrl ?? undefined}
                            caption={content.caption ?? undefined}
                        />
                    ))}
                </div>
            )}

            {/* Upload Modal */}
            <Modal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                title="写真をアップロード"
            >
                <Upload
                    albumId={albumId!}
                    onUploadComplete={handleUploadComplete}
                    onCancel={() => setIsUploadModalOpen(false)}
                />
            </Modal>
        </PageLayout>
    );
}
