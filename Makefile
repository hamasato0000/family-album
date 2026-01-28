up:
	docker compose up -d
down:
	docker compose down
logs:
	docker compose logs -f db
psql:
	docker compose exec db psql -U $$POSTGRES_USER -d $$POSTGRES_DB

# LocalStack初期化スクリプトを実行
init-localstack:
	./localstack/setup.sh

# SQSメッセージを確認
sqs-messages:
	aws --endpoint-url=http://localhost:4566 sqs receive-message \
		--queue-url http://sqs.ap-northeast-1.localhost.localstack.cloud:4566/000000000000/s3-event-queue \
		--max-number-of-messages 10

# Event Processorのログを確認
logs-event-processor:
	docker compose logs -f event-processor
