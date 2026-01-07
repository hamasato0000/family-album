import { handler } from "./handler";
import * as dotenv from "dotenv";

dotenv.config();

const mockEvent = {
    Records: [
        {
            s3: {
                bucket: {
                    name: process.env.S3_BUCKET_NAME,
                },
                object: {
                    key: "verified/2025/11/10/cat.jpeg",
                },
            },
        },
    ],
} as any;

const mockContext = {} as any;

handler(mockEvent, mockContext)
    .then(() => {
        console.log("Thumbnail generation completed.");
    })
    .catch((error) => {
        console.error("Error during thumbnail generation:", error);
    });
