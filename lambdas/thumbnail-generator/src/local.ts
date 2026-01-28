import { handler } from "./handler";
import { readFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import * as dotenv from "dotenv";
import type { S3Event, Context } from "aws-lambda";

// ESM用の__dirname代替
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// .envファイルを読み込む
dotenv.config({ path: join(__dirname, "..", ".env") });

// ローカル実行時はLocalStackを向くようにデフォルト設定
if (!process.env.AWS_ENDPOINT_URL) {
    process.env.AWS_ENDPOINT_URL = "http://localhost:4566";
}

const EVENTS_DIR = join(__dirname, "..", "events");

// モックContext
const mockContext: Context = {
    callbackWaitsForEmptyEventLoop: false,
    functionName: "thumbnail-generator",
    functionVersion: "$LATEST",
    invokedFunctionArn: "arn:aws:lambda:ap-northeast-1:000000000000:function:thumbnail-generator",
    memoryLimitInMB: "128",
    awsRequestId: "local-request-id",
    logGroupName: "/aws/lambda/thumbnail-generator",
    logStreamName: "local",
    getRemainingTimeInMillis: () => 300000,
    done: () => { },
    fail: () => { },
    succeed: () => { },
};

// ヘルプ表示
if (process.argv[2] === "--help" || process.argv[2] === "-h") {
    console.log("Usage: npm run dev [event-file.json]");
    console.log("\nAvailable event files:");
    try {
        const files = readdirSync(EVENTS_DIR).filter((f) => f.endsWith(".json"));
        for (const file of files) {
            console.log(`  - ${file}`);
        }
    } catch {
        console.log("  (no events directory found)");
    }
    process.exit(0);
}

// コマンドライン引数でイベントファイルを指定可能
const eventFile = process.argv[2] || "s3-put.json";
const eventPath = join(EVENTS_DIR, eventFile);

console.log("===========================================");
console.log("Local Lambda Invoke: thumbnail-generator");
console.log("===========================================");
console.log(`Event file: ${eventPath}`);
console.log(`AWS_ENDPOINT_URL: ${process.env.AWS_ENDPOINT_URL}`);
console.log(`AWS_REGION: ${process.env.AWS_REGION}`);
console.log("===========================================\n");

// イベントファイルを読み込む
const eventJson = readFileSync(eventPath, "utf-8");
const event: S3Event = JSON.parse(eventJson);

console.log("Invoking handler with event...\n");

handler(event, mockContext)
    .then(() => {
        console.log("\n===========================================");
        console.log("✅ Thumbnail generation completed.");
        console.log("===========================================");
    })
    .catch((error) => {
        console.error("\n===========================================");
        console.error("❌ Error during thumbnail generation:", error);
        console.error("===========================================");
        process.exit(1);
    });
