import type { MetaFunction } from "@remix-run/node";
import { useState } from "react";
import { useNavigate } from "@remix-run/react";
import { useApi } from "~/hooks/useApi";
import { ProtectedRoute } from "~/components/auth/ProtectedRoute";
import { PageLayout } from "~/components/common/PageLayout";
import { BackLink } from "~/components/common/BackLink";
import { Button } from "~/components/ui/Button";
import { PlusIcon } from "~/components/icons/Icons";

export const meta: MetaFunction = () => {
    return [
        { title: "新規アルバム作成 - Family Album" },
        { name: "description", content: "新しいアルバムを作成します" },
    ];
};

// 子どもとの関係の選択肢
const CHILD_RELATIONS = [
    "父",
    "母",
    "祖父",
    "祖母",
    "叔父",
    "叔母",
    "その他",
];

export default function NewAlbumPage() {
    return (
        <ProtectedRoute>
            <NewAlbumContent />
        </ProtectedRoute>
    );
}

function NewAlbumContent() {
    const [nickname, setNickname] = useState("");
    const [childRelation, setChildRelation] = useState("");
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const api = useApi();

    const isFormValid = nickname.trim().length > 0 && childRelation.length > 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) return;

        try {
            setCreating(true);
            setError(null);
            const result = await api.createAlbum({
                nickname: nickname.trim(),
                childRelation,
            });
            navigate(`/albums/${result.albumId}`);
        } catch (err) {
            setError("アルバムの作成に失敗しました。もう一度お試しください。");
            console.error(err);
        } finally {
            setCreating(false);
        }
    };

    return (
        <PageLayout maxWidth="md" centered>
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                {/* Back Link */}
                <BackLink to="/albums" className="mb-6">
                    アルバム一覧
                </BackLink>

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                        <PlusIcon className="w-10 h-10 text-indigo-600" strokeWidth={1.5} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        新規アルバム作成
                    </h1>
                    <p className="text-gray-600">
                        あなたの情報を入力してアルバムを作成しましょう
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Nickname Input */}
                    <div>
                        <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-2">
                            ニックネーム <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="nickname"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            placeholder="例: パパ、ママ、おじいちゃん"
                            maxLength={50}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                            disabled={creating}
                        />
                        <p className="mt-1 text-sm text-gray-500">
                            アルバム内で表示される名前です
                        </p>
                    </div>

                    {/* Child Relation Select */}
                    <div>
                        <label htmlFor="childRelation" className="block text-sm font-medium text-gray-700 mb-2">
                            子どもとの関係 <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="childRelation"
                            value={childRelation}
                            onChange={(e) => setChildRelation(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white"
                            disabled={creating}
                        >
                            <option value="">選択してください</option>
                            {CHILD_RELATIONS.map((relation) => (
                                <option key={relation} value={relation}>
                                    {relation}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Create Button */}
                    <Button
                        type="submit"
                        size="lg"
                        disabled={!isFormValid}
                        loading={creating}
                        className="w-full"
                    >
                        <PlusIcon className="w-5 h-5 mr-2" />
                        {creating ? "作成中..." : "アルバムを作成"}
                    </Button>
                </form>

                {/* Info Note */}
                <p className="mt-6 text-center text-sm text-gray-500">
                    作成後、アルバムに写真や動画を追加できます
                </p>
            </div>
        </PageLayout>
    );
}

