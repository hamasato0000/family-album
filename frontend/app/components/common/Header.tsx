import { useAuth0 } from "@auth0/auth0-react";
import { LogoutIcon, UserIcon } from "../icons/Icons";

interface HeaderProps {
    /** ページタイトル（オプション） */
    title?: string;
}

export function Header({ title }: HeaderProps) {
    const { user, logout, isAuthenticated } = useAuth0();

    const handleLogout = () => {
        logout({
            logoutParams: {
                returnTo: window.location.origin,
            },
        });
    };

    if (!isAuthenticated) {
        return null;
    }

    return (
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
                {/* Left: Logo/Title */}
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">FA</span>
                    </div>
                    {title && (
                        <h1 className="text-lg font-semibold text-gray-800">{title}</h1>
                    )}
                </div>

                {/* Right: User info & Logout */}
                <div className="flex items-center space-x-4">
                    {/* User info */}
                    <div className="flex items-center space-x-2">
                        {user?.picture ? (
                            <img
                                src={user.picture}
                                alt={user.name || "ユーザー"}
                                className="w-8 h-8 rounded-full ring-2 ring-indigo-100"
                            />
                        ) : (
                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center">
                                <UserIcon className="w-4 h-4 text-white" />
                            </div>
                        )}
                        <span className="text-sm font-medium text-gray-700 hidden sm:inline">
                            {user?.name || user?.email || "ユーザー"}
                        </span>
                    </div>

                    {/* Logout button */}
                    <button
                        onClick={handleLogout}
                        className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                        <LogoutIcon className="w-4 h-4 mr-1.5" />
                        <span className="hidden sm:inline">ログアウト</span>
                    </button>
                </div>
            </div>
        </header>
    );
}
