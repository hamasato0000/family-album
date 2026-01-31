interface LoadingSpinnerProps {
    /** 全画面表示モード */
    fullScreen?: boolean;
    /** サイズ: sm, md, lg */
    size?: "sm" | "md" | "lg";
}

const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-12 w-12",
    lg: "h-16 w-16",
};

export function LoadingSpinner({ fullScreen = false, size = "md" }: LoadingSpinnerProps) {
    const spinner = (
        <div
            className={`animate-spin rounded-full border-b-2 border-indigo-600 ${sizeClasses[size]}`}
        />
    );

    if (fullScreen) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
                {spinner}
            </div>
        );
    }

    return (
        <div className="flex justify-center items-center py-20">
            {spinner}
        </div>
    );
}
