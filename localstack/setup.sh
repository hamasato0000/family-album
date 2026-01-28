#!/bin/bash

# LocalStack初期化スクリプト
# S3バケットの作成、SQSキューの作成、S3イベント通知設定を行う

set -e

# .envファイルを読み込む
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
if [ -f "$PROJECT_ROOT/.env" ]; then
  export $(grep -v '^#' "$PROJECT_ROOT/.env" | xargs)
fi

# デフォルト値を設定
ENDPOINT_URL="${AWS_ENDPOINT_URL:-http://localhost:4566}"

echo "Starting LocalStack initialization..."
echo "Endpoint: $ENDPOINT_URL"

# LocalStackが起動するまで待機
echo "Waiting for LocalStack to be ready..."
until aws --endpoint-url=$ENDPOINT_URL s3 ls 2>/dev/null; do
  echo "LocalStack is not ready yet, waiting..."
  sleep 2
done
echo "LocalStack is ready!"

# S3バケットの作成（存在しない場合）
echo "Creating S3 bucket: $S3_BUCKET"
if aws --endpoint-url=$ENDPOINT_URL s3 ls "s3://$S3_BUCKET" 2>/dev/null; then
  echo "Bucket $S3_BUCKET already exists"
else
  aws --endpoint-url=$ENDPOINT_URL s3 mb "s3://$S3_BUCKET"
  echo "Bucket $S3_BUCKET created successfully"
fi

# SQSキューの作成
echo "Creating SQS queue: $SQS_QUEUE_NAME"
QUEUE_URL=$(aws --endpoint-url=$ENDPOINT_URL sqs create-queue \
  --queue-name $SQS_QUEUE_NAME \
  --query 'QueueUrl' \
  --output text 2>/dev/null || echo "")

if [ -z "$QUEUE_URL" ]; then
  # キューが既に存在する場合はURLを取得
  QUEUE_URL=$(aws --endpoint-url=$ENDPOINT_URL sqs get-queue-url \
    --queue-name $SQS_QUEUE_NAME \
    --query 'QueueUrl' \
    --output text)
  echo "Queue $SQS_QUEUE_NAME already exists"
else
  echo "Queue $SQS_QUEUE_NAME created successfully"
fi

echo "Queue URL: $QUEUE_URL"

# QueueのARNを取得
QUEUE_ARN=$(aws --endpoint-url=$ENDPOINT_URL sqs get-queue-attributes \
  --queue-url $QUEUE_URL \
  --attribute-names QueueArn \
  --query 'Attributes.QueueArn' \
  --output text)

echo "Queue ARN: $QUEUE_ARN"

# S3イベント通知設定
echo "Configuring S3 event notification..."

# イベント通知設定JSONを作成
cat > /tmp/notification.json <<EOF
{
  "QueueConfigurations": [
    {
      "QueueArn": "$QUEUE_ARN",
      "Events": ["s3:ObjectCreated:*"]
    }
  ]
}
EOF

# S3バケットにイベント通知を設定
aws --endpoint-url=$ENDPOINT_URL s3api put-bucket-notification-configuration \
  --bucket $S3_BUCKET \
  --notification-configuration file:///tmp/notification.json

echo "S3 event notification configured successfully"

# 設定確認
echo "Verifying notification configuration..."
aws --endpoint-url=$ENDPOINT_URL s3api get-bucket-notification-configuration \
  --bucket $S3_BUCKET

echo "LocalStack initialization completed!"
