import { ConsumerService } from '@app/shared/kafka/consumer.service';
import { ProducerService } from '@app/shared/kafka/producer.service';
import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class AppService implements OnModuleInit {
	constructor(
		private readonly producerService: ProducerService,
		private readonly consumerService: ConsumerService,
	) {}

	async createMessage() {
		const value = 'Hello World';
		await this.producerService.produce('test', { value });
		return value;
	}

	async onModuleInit() {
		this.consumerService.consume({
			topic: { topics: ['test'] },
			config: { groupId: 'test-consumer' },
			onMessage: async (message) => {
				console.log({ value: message.value.toString() });
			},
		});
	}
}
