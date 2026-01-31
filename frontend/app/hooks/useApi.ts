import { useAuth0 } from "@auth0/auth0-react";
import { useCallback } from "react";
import * as api from "~/services/api";

/**
 * アクセストークンを自動で取得してAPIを呼び出すためのカスタムフック
 */
export function useApi() {
    const { getAccessTokenSilently } = useAuth0();

    const getAlbums = useCallback(async () => {
        const accessToken = await getAccessTokenSilently();
        return api.getAlbums({ accessToken });
    }, [getAccessTokenSilently]);

    const getAlbum = useCallback(async (albumId: string) => {
        const accessToken = await getAccessTokenSilently();
        return api.getAlbum(albumId, { accessToken });
    }, [getAccessTokenSilently]);

    const getAlbumContents = useCallback(async (albumId: string) => {
        const accessToken = await getAccessTokenSilently();
        return api.getAlbumContents(albumId, { accessToken });
    }, [getAccessTokenSilently]);

    const createAlbum = useCallback(async (params: api.CreateAlbumParams) => {
        const accessToken = await getAccessTokenSilently();
        return api.createAlbum(params, { accessToken });
    }, [getAccessTokenSilently]);

    const generateSignedUrl = useCallback(async (contentType: string) => {
        const accessToken = await getAccessTokenSilently();
        return api.generateSignedUrl(contentType, { accessToken });
    }, [getAccessTokenSilently]);

    return {
        getAlbums,
        getAlbum,
        getAlbumContents,
        createAlbum,
        generateSignedUrl,
    };
}
