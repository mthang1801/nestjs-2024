import { ConsumerConfig, ConsumerSubscribeTopics, Message } from 'kafkajs';

export interface IConsumerConfigOptions {
	topic: ConsumerSubscribeTopics;
	config: ConsumerConfig;
	onMessage: (message: Message) => Promise<void>;
}
