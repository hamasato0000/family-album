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

    const getAlbumContents = useCallback(async (albumId: string, params?: { limit?: number; cursor?: string }) => {
        const accessToken = await getAccessTokenSilently();
        return api.getAlbumContents(albumId, params, { accessToken });
    }, [getAccessTokenSilently]);

    const createAlbum = useCallback(async (params: api.CreateAlbumParams) => {
        const accessToken = await getAccessTokenSilently();
        return api.createAlbum(params, { accessToken });
    }, [getAccessTokenSilently]);

    // 新しいアップロードAPI
    const createUpload = useCallback(async (albumId: string, contentCount: number) => {
        const accessToken = await getAccessTokenSilently();
        return api.createUpload(albumId, contentCount, { accessToken });
    }, [getAccessTokenSilently]);

    const createUploadContents = useCallback(async (uploadId: string, contents: api.ContentInfo[]) => {
        const accessToken = await getAccessTokenSilently();
        return api.createUploadContents(uploadId, contents, { accessToken });
    }, [getAccessTokenSilently]);

    const getUploadStatus = useCallback(async (uploadId: string) => {
        const accessToken = await getAccessTokenSilently();
        return api.getUploadStatus(uploadId, { accessToken });
    }, [getAccessTokenSilently]);

    const getContent = useCallback(async (albumId: string, contentId: string) => {
        const accessToken = await getAccessTokenSilently();
        return api.getContent(albumId, contentId, { accessToken });
    }, [getAccessTokenSilently]);

    const deleteContent = useCallback(async (albumId: string, contentId: string) => {
        const accessToken = await getAccessTokenSilently();
        return api.deleteContent(albumId, contentId, { accessToken });
    }, [getAccessTokenSilently]);

    return {
        getAlbums,
        getAlbum,
        getAlbumContents,
        createAlbum,
        createUpload,
        createUploadContents,
        getUploadStatus,
        getContent,
        deleteContent,
    };
}
