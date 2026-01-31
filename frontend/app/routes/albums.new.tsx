import type { MetaFunction } from "@remix-run/node";
import { useState } from "react";
import { useNavigate, Link } from "@remix-run/react";
import { createAlbum } from "~/services/api";

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

export default function NewAlbum() {
    const [nickname, setNickname] = useState("");
    const [childRelation, setChildRelation] = useState("");
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const isFormValid = nickname.trim().length > 0 && childRelation.length > 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) return;

        try {
            setCreating(true);
            setError(null);
            const result = await createAlbum({
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
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    {/* Back Link */}
                    <Link
                        to="/albums"
                        className="inline-flex items-center text-gray-600 hover:text-indigo-600 transition-colors mb-6"
                    >
                        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        アルバム一覧
                    </Link>

                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                            <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                            </svg>
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
                        <button
                            type="submit"
                            disabled={!isFormValid || creating}
                            className="w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {creating ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    作成中...
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    アルバムを作成
                                </>
                            )}
                        </button>
                    </form>

                    {/* Info Note */}
                    <p className="mt-6 text-center text-sm text-gray-500">
                        作成後、アルバムに写真や動画を追加できます
                    </p>
                </div>
            </div>
        </div>
    );
}
