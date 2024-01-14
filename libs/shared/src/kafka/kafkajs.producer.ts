import { Logger } from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';
import { IProducer } from './interfaces/producer.interface';
import { debounce } from '../utils/function.utils';

export class KafkajsProducer implements IProducer {
	private readonly kafka: Kafka;
	private readonly producer: Producer;
	private readonly logger: Logger;

	constructor(private readonly topic: string, broker: string) {
		this.kafka = new Kafka({ brokers: [broker] });
		this.producer = this.kafka.producer();
		this.logger = new Logger(topic);
	}

	async connect() {
		try {
			await this.producer.connect();
		} catch (error) {
			this.logger.error(error);
			await debounce(5000);
			await this.connect();
		}
	}

	async disconnect(): Promise<void> {
		await this.producer.disconnect();
	}

	async produce(message: any): Promise<void> {
		await this.producer.send({ topic: this.topic, messages: [message] });
	}
}
