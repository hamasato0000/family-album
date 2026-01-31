import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";
import { LoadingSpinner } from "~/components/common/LoadingSpinner";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

/**
 * 認証が必要なルートを保護するラッパーコンポーネント
 * 未認証の場合はAuth0のユニバーサルログインにリダイレクトする
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            loginWithRedirect();
        }
    }, [isLoading, isAuthenticated, loginWithRedirect]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    if (!isAuthenticated) {
        // リダイレクト中は何も表示しない
        return null;
    }

    return <>{children}</>;
}
