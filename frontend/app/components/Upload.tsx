import { useState } from "react";
import { generateSignedUrl, uploadFileToS3 } from "~/services/api";

export function Upload() {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
            setMessage(null);
            setProgress(0);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setMessage(null);
        setProgress(0);

        try {
            // 1. Get Signed URL
            const signedUrl = await generateSignedUrl(file.type);

            // 2. Upload to S3
            await uploadFileToS3(file, signedUrl, (p) => setProgress(p));

            setMessage({ type: "success", text: "Upload successful!" });
            setFile(null); // Reset file input
            // Reset input element value if needed, but controlled input is tricky with file.
            // We can use a ref to clear it, but for MVP this is okay.

        } catch (error) {
            setMessage({ type: "error", text: "Upload failed. Please try again." });
            console.error(error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto mt-10">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Upload Photo/Video</h2>

            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="file-upload">
                    Select File
                </label>
                <input
                    id="file-upload"
                    type="file"
                    accept="image/jpeg,image/png,video/mp4"
                    onChange={handleFileChange}
                    disabled={uploading}
                    className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100
          "
                />
            </div>

            {uploading && (
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                    <div
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            )}

            {message && (
                <div className={`p-3 mb-4 rounded ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {message.text}
                </div>
            )}

            <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className={`w-full font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out
          ${!file || uploading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg transform hover:-translate-y-0.5"
                    }
        `}
            >
                {uploading ? `Uploading... ${Math.round(progress)}%` : "Upload"}
            </button>
        </div>
    );
}
