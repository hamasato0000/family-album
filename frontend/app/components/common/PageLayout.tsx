import { Header } from "./Header";

interface PageLayoutProps {
    /** ページのコンテンツ */
    children: React.ReactNode;
    /** コンテンツの最大幅クラス */
    maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "4xl" | "6xl";
    /** 中央揃えにするかどうか */
    centered?: boolean;
    /** ヘッダーを表示するかどうか */
    showHeader?: boolean;
}

const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "4xl": "max-w-4xl",
    "6xl": "max-w-6xl",
};

export function PageLayout({ children, maxWidth = "6xl", centered = false, showHeader = true }: PageLayoutProps) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            {showHeader && <Header />}
            <div
                className={`${centered ? "flex items-center justify-center px-4 min-h-[calc(100vh-57px)]" : ""}`}
            >
                <div className={`${maxWidthClasses[maxWidth]} ${centered ? "w-full" : "mx-auto px-4 py-12"}`}>
                    {children}
                </div>
            </div>
        </div>
    );
}
