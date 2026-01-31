import { Button } from "./Button";

interface EmptyStateProps {
    /** アイコン（React要素） */
    icon?: React.ReactNode;
    /** タイトル */
    title: string;
    /** 説明文 */
    description?: string;
    /** アクションボタンのテキスト */
    actionLabel?: string;
    /** アクションボタンのリンク先 */
    actionTo?: string;
    /** アクションボタンのクリックハンドラ */
    onAction?: () => void;
}

export function EmptyState({
    icon,
    title,
    description,
    actionLabel,
    actionTo,
    onAction,
}: EmptyStateProps) {
    return (
        <div className="text-center py-20">
            {icon && (
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                    {icon}
                </div>
            )}
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">{title}</h2>
            {description && <p className="text-gray-500 mb-8">{description}</p>}
            {actionLabel && (actionTo || onAction) && (
                <Button to={actionTo} onClick={onAction}>
                    {actionLabel}
                </Button>
            )}
        </div>
    );
}
