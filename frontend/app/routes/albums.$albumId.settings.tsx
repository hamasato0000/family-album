import type { MetaFunction } from "@remix-run/node";
import { useParams } from "@remix-run/react";
import { useEffect, useState } from "react";
import { getAlbum, type AlbumDetail } from "~/services/api";
import { PageLayout } from "~/components/common/PageLayout";
import { LoadingSpinner } from "~/components/common/LoadingSpinner";
import { ErrorMessage } from "~/components/common/ErrorMessage";
import { BackLink } from "~/components/common/BackLink";
import { Button } from "~/components/ui/Button";
import { MemberItem } from "~/components/album/MemberItem";
import { InfoIcon, UsersIcon, UserPlusIcon } from "~/components/icons/Icons";
import { formatDate } from "~/utils/date";

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
        <PageLayout maxWidth="4xl">
            {/* Header */}
            <div className="mb-8">
                <BackLink to={`/albums/${album.albumId}`} className="mb-4">
                    コンテンツ一覧に戻る
                </BackLink>
                <h1 className="text-3xl font-bold text-gray-900">アルバム設定</h1>
                <p className="mt-2 text-gray-600">アルバム #{album.albumId}</p>
            </div>

            {/* Album Info */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <InfoIcon className="w-5 h-5 mr-2 text-indigo-600" />
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
                    <UsersIcon className="w-5 h-5 mr-2 text-indigo-600" />
                    メンバー ({album.members.length}人)
                </h2>
                <div className="space-y-3">
                    {album.members.map((member) => (
                        <MemberItem
                            key={member.userId}
                            userId={member.userId}
                            nickname={member.nickname}
                            displayName={member.displayName}
                            childRelation={member.childRelation}
                            role={member.role as "owner" | "admin" | "member"}
                            joinedAt={member.joinedAt}
                        />
                    ))}
                </div>

                {/* Invite button */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                    <Button
                        variant="outline"
                        onClick={() => alert("メンバー招待機能は今後実装予定です")}
                    >
                        <UserPlusIcon className="w-5 h-5 mr-2" />
                        メンバーを招待
                    </Button>
                </div>
            </div>
        </PageLayout>
    );
}
