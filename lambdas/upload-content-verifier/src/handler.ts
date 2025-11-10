import type { S3Event, Context } from "aws-lambda";

export const handler = async (event: S3Event): Promise<void> => {
    console.log("Received S3 Event:", JSON.stringify(event, null, 2));
};
