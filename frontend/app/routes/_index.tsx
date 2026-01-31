import type { MetaFunction } from "@remix-run/node";
import { Upload } from "~/components/Upload";

export const meta: MetaFunction = () => {
    return [
        { title: "Family Album - Upload" },
        { name: "description", content: "Upload your memories" },
    ];
};

export default function Index() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Family Album
                    </h1>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Share your favorite moments safely with your family.
                    </p>
                </div>

                <Upload />

            </div>
        </div>
    );
}

