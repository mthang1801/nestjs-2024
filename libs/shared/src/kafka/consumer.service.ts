import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IConsumer } from './interfaces/consumer.interface';
import { IConsumerConfigOptions } from './interfaces/consumer-config-options.interface';
import { KafkajsConsumer } from './kafkajs.consumer';

@Injectable()
export class ConsumerService {
	private readonly consumers: IConsumer[] = [];

	constructor(private readonly configService: ConfigService) {}

	async consume({ topic, config, onMessage }: IConsumerConfigOptions) {
		const consume = new KafkajsConsumer(
			topic,
			config,
			this.configService.get('KAFKA_BROKER'),
		);
		await consume.connect();
		await consume.consume(onMessage);
		this.consumers.push(consume);
	}
}
