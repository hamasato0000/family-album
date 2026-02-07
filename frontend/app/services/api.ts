const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export interface ApiOptions {
    accessToken?: string;
}

function createHeaders(options?: ApiOptions): HeadersInit {
    const headers: HeadersInit = {
        "Content-Type": "application/json",
    };
    if (options?.accessToken) {
        headers["Authorization"] = `Bearer ${options.accessToken}`;
    }
    return headers;
}

// ============================================================
// アップロード API
// ============================================================

// アップロード開始レスポンス
export interface CreateUploadResponse {
    upload_id: string;
    status: string;
    content_count: number;
    created_at: string;
}

// 署名付きURL生成リクエスト
export interface ContentInfo {
    filename: string;
    contentType: "image/jpeg" | "image/png";
}

// 署名付きURL生成レスポンス
export interface ContentWithUrl {
    content_id: string;
    presigned_url: string;
    expires_in: number;
}

export interface CreateUploadContentsResponse {
    contents: ContentWithUrl[];
}

// アップロード状態レスポンス
export interface UploadContentStatus {
    content_id: string;
    status: "pending" | "processing" | "completed" | "failed";
    thumbnail_url?: string;
    raw_url?: string;
    width?: number;
    height?: number;
    file_size?: number;
    error_message?: string;
}

export interface UploadStatusResponse {
    upload_id: string;
    status: string;
    content_count: number;
    created_at: string;
    completed_at: string | null;
    contents: UploadContentStatus[];
    summary: {
        pending: number;
        processing: number;
        completed: number;
        failed: number;
    };
}

/**
 * アップロードを開始する
 * POST /albums/:albumId/uploads
 */
export async function createUpload(
    albumId: string,
    contentCount: number,
    options?: ApiOptions
): Promise<CreateUploadResponse> {
    const response = await fetch(`${API_BASE_URL}/albums/${albumId}/uploads`, {
        method: "POST",
        headers: createHeaders(options),
        body: JSON.stringify({ content_count: contentCount }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || "Failed to create upload");
    }

    return response.json();
}

/**
 * 署名付きURLを一括生成する
 * POST /uploads/{uploadId}/contents
 */
export async function createUploadContents(
    uploadId: string,
    contents: ContentInfo[],
    options?: ApiOptions
): Promise<CreateUploadContentsResponse> {
    const response = await fetch(`${API_BASE_URL}/uploads/${uploadId}/contents`, {
        method: "POST",
        headers: createHeaders(options),
        body: JSON.stringify({ contents }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || "Failed to create upload contents");
    }

    return response.json();
}

/**
 * アップロード状態を取得する
 * GET /uploads/{uploadId}
 */
export async function getUploadStatus(
    uploadId: string,
    options?: ApiOptions
): Promise<UploadStatusResponse> {
    const headers: HeadersInit = {};
    if (options?.accessToken) {
        headers["Authorization"] = `Bearer ${options.accessToken}`;
    }

    const response = await fetch(`${API_BASE_URL}/uploads/${uploadId}`, { headers });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || "Failed to get upload status");
    }

    return response.json();
}

/**
 * S3に直接ファイルをアップロードする
 */
export async function uploadFileToS3(
    file: File,
    signedUrl: string,
    onProgress?: (progress: number) => void
): Promise<void> {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.open("PUT", signedUrl);
        xhr.setRequestHeader("Content-Type", file.type);

        if (onProgress) {
            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percentComplete = (event.loaded / event.total) * 100;
                    onProgress(percentComplete);
                }
            };
        }

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve();
            } else {
                reject(new Error(`Upload failed with status ${xhr.status}`));
            }
        };

        xhr.onerror = () => {
            reject(new Error("Network error occurred during upload"));
        };

        xhr.send(file);
    });
}

// ============================================================
// アルバム API
// ============================================================

export interface Album {
    albumId: string;
    createdAt: string;
    updatedAt: string;
    contentCount: number;
    role: "owner" | "admin" | "member";
    nickname: string;
}

export interface AlbumsResponse {
    albums: Album[];
}

export interface AlbumMember {
    userId: string;
    displayName: string;
    nickname: string;
    role: "owner" | "admin" | "member";
    childRelation: string;
    joinedAt: string;
}

export interface AlbumDetail {
    albumId: string;
    createdAt: string;
    updatedAt: string;
    contentCount: number;
    members: AlbumMember[];
}

export interface AlbumContent {
    contentId: string;
    contentType: "image" | "video";
    rawUrl: string | null;
    thumbnailUrl: string | null;
    caption: string | null;
    takenAt: string | null;
    createdAt: string;
}

export interface AlbumContentsResponse {
    albumId: string;
    contents: AlbumContent[];
}

export interface CreateAlbumParams {
    nickname: string;
    childRelation: string;
}

export async function createAlbum(
    params: CreateAlbumParams,
    options?: ApiOptions
): Promise<{ albumId: string; createdAt: string }> {
    const response = await fetch(`${API_BASE_URL}/albums`, {
        method: "POST",
        headers: createHeaders(options),
        body: JSON.stringify(params),
    });

    if (!response.ok) {
        throw new Error("Failed to create album");
    }

    return response.json();
}

export async function getAlbums(options?: ApiOptions): Promise<AlbumsResponse> {
    const headers: HeadersInit = {};
    if (options?.accessToken) {
        headers["Authorization"] = `Bearer ${options.accessToken}`;
    }
    const response = await fetch(`${API_BASE_URL}/albums`, { headers });

    if (!response.ok) {
        throw new Error("Failed to fetch albums");
    }

    return response.json();
}

export async function getAlbum(albumId: string, options?: ApiOptions): Promise<AlbumDetail> {
    const headers: HeadersInit = {};
    if (options?.accessToken) {
        headers["Authorization"] = `Bearer ${options.accessToken}`;
    }
    const response = await fetch(`${API_BASE_URL}/albums/${albumId}`, { headers });

    if (!response.ok) {
        throw new Error("Failed to fetch album");
    }

    return response.json();
}

export async function getAlbumContents(
    albumId: string,
    options?: ApiOptions
): Promise<AlbumContentsResponse> {
    const headers: HeadersInit = {};
    if (options?.accessToken) {
        headers["Authorization"] = `Bearer ${options.accessToken}`;
    }
    const response = await fetch(`${API_BASE_URL}/albums/${albumId}/contents`, { headers });

    if (!response.ok) {
        throw new Error("Failed to fetch album contents");
    }

    return response.json();
}
