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
