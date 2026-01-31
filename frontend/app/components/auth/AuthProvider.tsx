import { Auth0Provider } from "@auth0/auth0-react";

interface AuthProviderProps {
    children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const domain = import.meta.env.VITE_AUTH0_DOMAIN;
    const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
    const audience = import.meta.env.VITE_AUTH0_AUDIENCE;
    const redirectUri = import.meta.env.VITE_AUTH0_REDIRECT_URI || window.location.origin;

    if (!domain || !clientId) {
        console.error("Auth0 domain and client ID must be set in environment variables");
        return <>{children}</>;
    }

    return (
        <Auth0Provider
            domain={domain}
            clientId={clientId}
            authorizationParams={{
                redirect_uri: redirectUri,
                audience: audience,
            }}
        >
            {children}
        </Auth0Provider>
    );
}
