import type { MetaFunction } from "@remix-run/node";
import { useEffect, useState } from "react";
import { getAlbums, type Album } from "~/services/api";
import { PageLayout } from "~/components/common/PageLayout";
import { LoadingSpinner } from "~/components/common/LoadingSpinner";
import { EmptyState } from "~/components/ui/EmptyState";
import { Button } from "~/components/ui/Button";
import { AlbumCard } from "~/components/album/AlbumCard";
import { PhotoIcon, PlusIcon } from "~/components/icons/Icons";

export const meta: MetaFunction = () => {
    return [
        { title: "アルバム一覧 - Family Album" },
        { name: "description", content: "アルバムを選択してください" },
    ];
};

export default function AlbumsIndex() {
    const [albums, setAlbums] = useState<Album[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchAlbums();
    }, []);

    const fetchAlbums = async () => {
        try {
            setLoading(true);
            const response = await getAlbums();
            setAlbums(response.albums);
        } catch (err) {
            setError("アルバムの取得に失敗しました");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageLayout>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
                <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        Family Album
                    </h1>
                    <p className="mt-2 text-gray-600">
                        大切な思い出を家族と共有しましょう
                    </p>
                </div>
                <Button to="/albums/new" className="mt-4 md:mt-0">
                    <PlusIcon className="w-5 h-5 mr-2" />
                    新規アルバム作成
                </Button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
                    {error}
                </div>
            )}

            {/* Loading State */}
            {loading ? (
                <LoadingSpinner />
            ) : albums.length === 0 ? (
                /* Empty State */
                <EmptyState
                    icon={<PhotoIcon className="w-12 h-12 text-indigo-400" />}
                    title="アルバムがありません"
                    description="新しいアルバムを作成して、思い出を残しましょう"
                    actionLabel="最初のアルバムを作成"
                    actionTo="/albums/new"
                />
            ) : (
                /* Album Grid */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {albums.map((album) => (
                        <AlbumCard
                            key={album.albumId}
                            albumId={album.albumId}
                            contentCount={album.contentCount}
                            createdAt={album.createdAt}
                        />
                    ))}
                </div>
            )}
        </PageLayout>
    );
}
