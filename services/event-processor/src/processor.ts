import {
    SQSClient,
    ReceiveMessageCommand,
    DeleteMessageCommand,
    type Message,
} from "@aws-sdk/client-sqs";

// 環境変数の検証
const requiredEnvVars = [
    "AWS_REGION",
    "AWS_ACCESS_KEY_ID",
    "AWS_SECRET_ACCESS_KEY",
    "SQS_QUEUE_NAME",
];

for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.error(`Error: ${envVar} environment variable is not set`);
        process.exit(1);
    }
}

// SQSクライアントの初期化
const sqsClient = new SQSClient({
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
    ...(process.env.AWS_ENDPOINT_URL && {
        endpoint: process.env.AWS_ENDPOINT_URL,
    }),
});

// キューURLを構築
const QUEUE_NAME = process.env.SQS_QUEUE_NAME!;
const QUEUE_URL = process.env.SQS_QUEUE_URL ||
    `http://sqs.${process.env.AWS_REGION}.localhost.localstack.cloud:4566/000000000000/${QUEUE_NAME}`;

console.log(`Event Processor starting...`);
console.log(`Queue URL: ${QUEUE_URL}`);

/**
 * S3イベントメッセージを処理する
 */
async function processS3Event(messageBody: string): Promise<void> {
    try {
        const event = JSON.parse(messageBody);

        console.log("========================================");
        console.log("Received S3 Event:");
        console.log(JSON.stringify(event, null, 2));
        console.log("========================================");

        // S3イベントレコードを処理
        if (event.Records && Array.isArray(event.Records)) {
            for (const record of event.Records) {
                if (record.eventName?.startsWith("ObjectCreated")) {
                    const bucketName = record.s3?.bucket?.name;
                    const objectKey = record.s3?.object?.key;
                    const eventTime = record.eventTime;

                    console.log(`✅ File uploaded:`);
                    console.log(`   Bucket: ${bucketName}`);
                    console.log(`   Key: ${objectKey}`);
                    console.log(`   Event Time: ${eventTime}`);

                    // ここに将来的な処理を追加できます
                    // 例: サムネイル生成、メタデータ抽出、データベース更新など
                }
            }
        }
    } catch (error) {
        console.error("Error processing S3 event:", error);
        throw error;
    }
}

/**
 * SQSからメッセージを受信して処理する
 */
async function pollMessages(): Promise<void> {
    try {
        const command = new ReceiveMessageCommand({
            QueueUrl: QUEUE_URL,
            MaxNumberOfMessages: 10, // 一度に最大10メッセージ受信
            WaitTimeSeconds: 20, // Long Polling (20秒待機)
            MessageAttributeNames: ["All"],
        });

        const response = await sqsClient.send(command);

        if (response.Messages && response.Messages.length > 0) {
            console.log(`Received ${response.Messages.length} message(s)`);

            for (const message of response.Messages) {
                try {
                    // メッセージ処理
                    if (message.Body) {
                        await processS3Event(message.Body);
                    }

                    // 処理成功後、メッセージを削除
                    if (message.ReceiptHandle) {
                        await deleteMessage(message);
                        console.log("✅ Message processed and deleted successfully");
                    }
                } catch (error) {
                    console.error("Error processing message:", error);
                    // エラーが発生した場合、メッセージは削除されず、
                    // visibility timeoutが切れた後に再度処理される
                }
            }
        } else {
            // メッセージがない場合（Long Polling中）
            process.stdout.write(".");
        }
    } catch (error) {
        console.error("Error polling messages:", error);
        // エラーが発生してもポーリングは継続
    }
}

/**
 * メッセージをキューから削除する
 */
async function deleteMessage(message: Message): Promise<void> {
    if (!message.ReceiptHandle) {
        return;
    }

    const command = new DeleteMessageCommand({
        QueueUrl: QUEUE_URL,
        ReceiptHandle: message.ReceiptHandle,
    });

    await sqsClient.send(command);
}

/**
 * メインループ
 */
async function main(): Promise<void> {
    console.log("Starting message polling...");

    // 無限ループでメッセージをポーリング
    while (true) {
        await pollMessages();
        // ポーリング間隔は不要（Long Pollingで制御）
    }
}

// Graceful shutdown
const shutdown = async () => {
    console.log("\nShutting down Event Processor...");
    try {
        sqsClient.destroy();
        console.log("SQS client destroyed.");
    } catch (e) {
        console.error("Error during shutdown:", e);
    } finally {
        process.exit(0);
    }
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

// アプリケーション開始
main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});
