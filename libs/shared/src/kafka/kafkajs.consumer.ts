import { Logger } from '@nestjs/common';
import {
	Consumer,
	ConsumerConfig,
	ConsumerSubscribeTopics,
	Kafka,
	KafkaMessage,
} from 'kafkajs';
import { debounce } from '../utils/function.utils';
import { IConsumer } from './interfaces/consumer.interface';
import * as retry from 'async-retry';
import { CommonConfig } from '../config';

export class KafkajsConsumer implements IConsumer {
	private readonly kafka: Kafka;
	private readonly consumer: Consumer;
	private readonly logger: Logger;

	constructor(
		private readonly topic: ConsumerSubscribeTopics,
		config: ConsumerConfig,
		broker: string,
	) {
		this.kafka = new Kafka({ brokers: [broker] });
		this.consumer = this.kafka.consumer(config);
		this.logger = new Logger(`${topic.topics}-${config.groupId}`);
	}

	async connect() {
		try {
			await this.consumer.connect();
		} catch (error) {
			this.logger.error(error);
			await debounce(5000);
			await this.connect();
		}
	}

	async disconnect() {
		await this.consumer.disconnect();
	}

	async consume(onMessage: (message: any) => Promise<void>): Promise<void> {
		await this.consumer.subscribe(this.topic);
		await this.consumer.run({
			eachMessage: async ({ message, heartbeat, partition, topic }) => {
				this.logger.debug(`Processing message partition: ${partition}`);
				try {
					await retry(() => onMessage(message), {
						retries: CommonConfig.KAFKA_RETRY_ATTEMP,
						onRetry: (error, attempt) => {
							this.logger.error(
								`Error consuming message, execiting retry ${attempt}/ 3`,
								error,
							);
						},
					});
				} catch (error) {
					this.logger.error(
						'Error consuming message. Adding to dead letter queue...',
						error,
					);
				}
			},
		});
	}
}
