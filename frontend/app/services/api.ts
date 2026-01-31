const API_BASE_URL = "http://localhost:3000";

export interface SignedUrlResponse {
    uploadUrl: string;
}

export async function generateSignedUrl(
    contentType: string
): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/contents/generate-signed-url`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ contentType }),
    });

    if (!response.ok) {
        throw new Error("Failed to generate signed URL");
    }

    const data: SignedUrlResponse = await response.json();
    return data.uploadUrl;
}

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

// Album Types
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
    uri: string | null;
    storageKey: string;
    caption: string | null;
    takenAt: string | null;
    createdAt: string;
}

export interface AlbumContentsResponse {
    albumId: string;
    contents: AlbumContent[];
}

// Album API Functions
export interface CreateAlbumParams {
    nickname: string;
    childRelation: string;
}

export async function createAlbum(params: CreateAlbumParams): Promise<{ albumId: string; createdAt: string }> {
    const response = await fetch(`${API_BASE_URL}/albums`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
    });

    if (!response.ok) {
        throw new Error("Failed to create album");
    }

    return response.json();
}

export async function getAlbums(): Promise<AlbumsResponse> {
    const response = await fetch(`${API_BASE_URL}/albums`);

    if (!response.ok) {
        throw new Error("Failed to fetch albums");
    }

    return response.json();
}

export async function getAlbum(albumId: string): Promise<AlbumDetail> {
    const response = await fetch(`${API_BASE_URL}/albums/${albumId}`);

    if (!response.ok) {
        throw new Error("Failed to fetch album");
    }

    return response.json();
}

export async function getAlbumContents(albumId: string): Promise<AlbumContentsResponse> {
    const response = await fetch(`${API_BASE_URL}/albums/${albumId}/contents`);

    if (!response.ok) {
        throw new Error("Failed to fetch album contents");
    }

    return response.json();
}
