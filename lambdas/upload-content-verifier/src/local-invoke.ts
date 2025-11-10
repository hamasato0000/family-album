import { handler } from "./handler";
import type { S3Event, Context } from "aws-lambda";

const s3Event: S3Event = {
    Records: [
        {
            eventVersion: "2.1",
            eventSource: "aws:s3",
            awsRegion: "ap-northeast-1",
            eventTime: "2025-10-31T15:50:53.560Z",
            eventName: "ObjectCreated:Put",
            userIdentity: {
                principalId: "AWS:AIDA35KFEOHM7R4FCHDVT",
            },
            requestParameters: {
                sourceIPAddress: "123.456.78.9",
            },
            responseElements: {
                "x-amz-request-id": "M25E7D0P6F20P48Y",
                "x-amz-id-2":
                    "jlRJOz5wEFTy6E7XwxweMtA5CVdbNzl2zMC4EbFezqeg6A+rzrrcMHIEmy0/lxeXnC0Zgteau2e2NbnOZncDs2iM3vmd51rQ",
            },
            s3: {
                s3SchemaVersion: "1.0",
                configurationId: "PutObjectEvent",
                bucket: {
                    name: "hogehoge-bucket",
                    ownerIdentity: {
                        principalId: "A2992W3C838OHB",
                    },
                    arn: "arn:aws:s3:::hogehoge-bucket",
                },
                object: {
                    key: "2025/10/31/dd8b0044-4aee-4743-b1e4-fe31916d2dcf.jpg",
                    size: 7631,
                    eTag: "70743883e75144195d7be865d26ccd96",
                    sequencer: "006904DADD79190A5F",
                },
            },
        },
    ],
};

// Call the handler function with the S3Event test data
handler(s3Event);
