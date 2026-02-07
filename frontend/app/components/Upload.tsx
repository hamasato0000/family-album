import { useState } from "react";
import { useApi } from "~/hooks/useApi";
import { uploadFileToS3, type ContentInfo } from "~/services/api";

interface UploadProps {
    albumId: string;
    onUploadComplete?: () => void;
    onCancel?: () => void;
}

export function Upload({ albumId, onUploadComplete, onCancel }: UploadProps) {
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const api = useApi();

    const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFiles(Array.from(e.target.files));
            setMessage(null);
            setProgress(0);
        }
    };

    const handleUpload = async () => {
        if (!files.length) return;

        setUploading(true);
        setMessage(null);
        setProgress(0);

        try {
            // 1. アップロード開始
            const uploadResponse = await api.createUpload(albumId, files.length);
            const uploadId = uploadResponse.upload_id;

            // 2. 署名付きURL一括生成
            const contentInfos: ContentInfo[] = files.map((file) => ({
                filename: file.name,
                contentType: file.type as "image/jpeg" | "image/png",
            }));

            const urlsResponse = await api.createUploadContents(uploadId, contentInfos);

            // 3. 各ファイルをS3にアップロード
            const totalFiles = files.length;
            let completedFiles = 0;

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const presignedUrl = urlsResponse.contents[i].presigned_url;

                await uploadFileToS3(file, presignedUrl, (fileProgress) => {
                    // 全体の進捗を計算
                    const overallProgress = ((completedFiles + fileProgress / 100) / totalFiles) * 100;
                    setProgress(overallProgress);
                });

                completedFiles++;
                setProgress((completedFiles / totalFiles) * 100);
            }

            setMessage({ type: "success", text: `${files.length}件のファイルをアップロードしました！` });
            setFiles([]);

            // 少し待ってからコールバックを呼ぶ（成功メッセージを表示するため）
            setTimeout(() => {
                onUploadComplete?.();
            }, 1500);

        } catch (error) {
            setMessage({ type: "error", text: "アップロードに失敗しました。もう一度お試しください。" });
            console.error(error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="file-upload">
                    ファイルを選択
                </label>
                <input
                    id="file-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/heic,image/heif"
                    multiple
                    onChange={handleFilesChange}
                    disabled={uploading}
                    className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-indigo-50 file:text-indigo-700
                        hover:file:bg-indigo-100"
                />
                {files.length > 0 && (
                    <p className="mt-2 text-sm text-gray-600">{files.length}件のファイルが選択されています</p>
                )}
            </div>

            {uploading && (
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                    <div
                        className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            )}

            {message && (
                <div className={`p-3 mb-4 rounded ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {message.text}
                </div>
            )}

            <div className="flex gap-3">
                <button
                    onClick={handleUpload}
                    disabled={!files.length || uploading}
                    className={`flex-1 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out
                        ${!files.length || uploading
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg"
                        }`}
                >
                    {uploading ? `アップロード中... ${Math.round(progress)}%` : "アップロード"}
                </button>
                {onCancel && !uploading && (
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition"
                    >
                        キャンセル
                    </button>
                )}
            </div>
        </div>
    );
}
