import { Link } from "@remix-run/react";

interface BackLinkProps {
    /** 戻り先のパス */
    to: string;
    /** リンクテキスト */
    children: React.ReactNode;
    /** 追加のCSSクラス */
    className?: string;
}

export function BackLink({ to, children, className = "" }: BackLinkProps) {
    return (
        <Link
            to={to}
            className={`inline-flex items-center text-gray-600 hover:text-indigo-600 transition-colors ${className}`}
        >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {children}
        </Link>
    );
}
