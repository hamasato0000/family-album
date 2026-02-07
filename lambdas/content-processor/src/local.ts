/**
 * ローカル開発用のエントリーポイント
 * SQSからメッセージを受信し、Lambdaハンドラーを呼び出す
 */
import {
    SQSClient,
    ReceiveMessageCommand,
    DeleteMessageCommand,
} from "@aws-sdk/client-sqs";
import type { S3Event, Context } from "aws-lambda";
import { handler } from "./handler.js";
import dotenv from "dotenv";

dotenv.config();

const sqsClient = new SQSClient({
    region: process.env.AWS_REGION || "ap-northeast-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "test",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "test",
    },
    ...(process.env.AWS_ENDPOINT_URL && {
        endpoint: process.env.AWS_ENDPOINT_URL,
    }),
});

const QUEUE_URL = process.env.SQS_QUEUE_URL || "http://localstack:4566/000000000000/content-processor-queue";
const POLL_INTERVAL = 5000; // 5秒

async function pollMessages(): Promise<void> {
    console.log("Polling for messages from SQS...");

    while (true) {
        try {
            const receiveCommand = new ReceiveMessageCommand({
                QueueUrl: QUEUE_URL,
                MaxNumberOfMessages: 10,
                WaitTimeSeconds: 20, // ロングポーリング
            });

            const response = await sqsClient.send(receiveCommand);

            if (response.Messages && response.Messages.length > 0) {
                for (const message of response.Messages) {
                    console.log("Received message:", message.MessageId);

                    try {
                        // メッセージボディをS3Eventにパース
                        const body = JSON.parse(message.Body || "{}");

                        // S3イベント通知はRecordsフィールドに含まれる
                        let s3Event: S3Event;
                        if (body.Records) {
                            s3Event = body as S3Event;
                        } else if (body.Message) {
                            // SNS経由の場合
                            s3Event = JSON.parse(body.Message) as S3Event;
                        } else {
                            console.error("Unknown message format:", body);
                            continue;
                        }

                        // Lambdaハンドラーを呼び出す
                        const context: Context = {
                            functionName: "content-processor",
                            functionVersion: "1",
                            invokedFunctionArn: "arn:aws:lambda:local:000000000000:function:content-processor",
                            memoryLimitInMB: "512",
                            awsRequestId: message.MessageId || "local-request",
                            logGroupName: "/aws/lambda/content-processor",
                            logStreamName: "local",
                            callbackWaitsForEmptyEventLoop: true,
                            getRemainingTimeInMillis: () => 300000,
                            done: () => { },
                            fail: () => { },
                            succeed: () => { },
                        };

                        await handler(s3Event, context);

                        // メッセージを削除
                        if (message.ReceiptHandle) {
                            await sqsClient.send(
                                new DeleteMessageCommand({
                                    QueueUrl: QUEUE_URL,
                                    ReceiptHandle: message.ReceiptHandle,
                                })
                            );
                            console.log("Deleted message:", message.MessageId);
                        }
                    } catch (error) {
                        console.error("Error processing message:", error);
                    }
                }
            }
        } catch (error) {
            console.error("Error polling SQS:", error);
            await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
        }
    }
}

console.log("Starting content-processor local development server...");
pollMessages().catch(console.error);
