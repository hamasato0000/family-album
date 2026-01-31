import { BackLink } from "./BackLink";

interface ErrorMessageProps {
    /** エラーメッセージ */
    message?: string;
    /** 戻り先のパス */
    backTo?: string;
    /** 戻るリンクのテキスト */
    backLabel?: string;
    /** 全画面表示モード */
    fullScreen?: boolean;
}

export function ErrorMessage({
    message = "エラーが発生しました",
    backTo,
    backLabel = "戻る",
    fullScreen = false,
}: ErrorMessageProps) {
    const content = (
        <div className="text-center">
            <div className="text-red-500 mb-4">{message}</div>
            {backTo && (
                <BackLink to={backTo} className="font-medium">
                    ← {backLabel}
                </BackLink>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
                {content}
            </div>
        );
    }

    return content;
}
