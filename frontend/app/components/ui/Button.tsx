import { Link } from "@remix-run/react";

interface ButtonProps {
    /** ボタンの種類 */
    variant?: "primary" | "secondary" | "outline";
    /** ボタンのサイズ */
    size?: "sm" | "md" | "lg";
    /** 無効状態 */
    disabled?: boolean;
    /** ローディング状態 */
    loading?: boolean;
    /** クリックハンドラ */
    onClick?: () => void;
    /** buttonタイプ */
    type?: "button" | "submit";
    /** 子要素 */
    children: React.ReactNode;
    /** 追加のCSSクラス */
    className?: string;
    /** リンク先（指定するとLinkになる） */
    to?: string;
}

const variantClasses = {
    primary:
        "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5",
    secondary:
        "bg-white border border-gray-300 text-gray-700 shadow hover:bg-gray-50",
    outline:
        "bg-indigo-50 text-indigo-700 hover:bg-indigo-100",
};

const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3",
    lg: "px-6 py-4",
};

export function Button({
    variant = "primary",
    size = "md",
    disabled = false,
    loading = false,
    onClick,
    type = "button",
    children,
    className = "",
    to,
}: ButtonProps) {
    const baseClasses = `inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 ${sizeClasses[size]} ${variantClasses[variant]}`;
    const disabledClasses = disabled || loading ? "opacity-50 cursor-not-allowed transform-none" : "";
    const combinedClasses = `${baseClasses} ${disabledClasses} ${className}`;

    const content = loading ? (
        <>
            <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
            >
                <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                />
                <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
            </svg>
            {children}
        </>
    ) : (
        children
    );

    if (to && !disabled && !loading) {
        return (
            <Link to={to} className={combinedClasses}>
                {content}
            </Link>
        );
    }

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={combinedClasses}
        >
            {content}
        </button>
    );
}
