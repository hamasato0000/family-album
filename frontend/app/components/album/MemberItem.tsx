import { formatDate } from "~/utils/date";

interface MemberItemProps {
    /** ユーザーID */
    userId: string;
    /** ニックネーム */
    nickname: string;
    /** 表示名 */
    displayName: string;
    /** 子どもとの関係 */
    childRelation: string;
    /** 役割 */
    role: "owner" | "admin" | "member";
    /** 参加日 */
    joinedAt: string;
}

export function MemberItem({
    nickname,
    displayName,
    childRelation,
    role,
    joinedAt,
}: MemberItemProps) {
    const roleLabel = role === "owner" ? "管理者" : role === "admin" ? "副管理者" : "メンバー";
    const roleClasses =
        role === "owner"
            ? "bg-amber-100 text-amber-800"
            : role === "admin"
                ? "bg-blue-100 text-blue-800"
                : "bg-gray-100 text-gray-700";

    return (
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                    {nickname.charAt(0)}
                </div>
                <div className="ml-4">
                    <p className="font-semibold text-gray-900 text-lg">{nickname}</p>
                    <p className="text-sm text-gray-500">
                        {displayName} • {childRelation}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">参加日: {formatDate(joinedAt)}</p>
                </div>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${roleClasses}`}>
                {roleLabel}
            </span>
        </div>
    );
}
