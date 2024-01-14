import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ClientProxyFactory,
  RmqContext,
  RmqOptions,
  RmqRecordBuilder,
  Transport,
} from '@nestjs/microservices';

import { RmqClientOptions } from './types/rabbitmq-client-options.type';
@Injectable()
export class RMQService {
	logger = new Logger(RMQService.name);

	@Inject()
	configService: ConfigService;

	/**
	 * Apply for new version
	 * @param {RmqClientOptions} properties
	 */
	getConsumer(properties: RmqClientOptions): RmqOptions {
		return {
			transport: Transport.RMQ,
			options: {
				urls: [this.configService.get<string>('RMQ_URI')],
				prefetchCount: 10,
				isGlobalPrefetchCount: true,
				queueOptions: {
					durable: true,
				},
				socketOptions: {
					noDelay: true,
					retryAttempts: 5,
					retryDelay: 10,
					heartbeatIntervalInSeconds: 60,
					reconnectTimeInSeconds: 5,
				},
				...properties,
				noAck: !!!properties.isAck,
			},
		};
	}

	createClient(properties: RmqClientOptions) {
		return ClientProxyFactory.create({
			transport: Transport.RMQ,
			options: {
				urls: [
					this?.configService?.get<string>('RMQ_URI') || process.env.RMQ_URI,
				],
				queue: properties.queue,
				queueOptions: { durable: true },
				socketOptions: {
					noDelay: true,
					retryAttempts: 3,
					retryDelay: 10,
					heartbeatIntervalInSeconds: 60,
					reconnectTimeInSeconds: 5,
				},
			},
			...properties,
		});
	}

	/**
	 * Publish data to queue
	 * @param queue
	 * @param pattern
	 * @param payload
	 */
	publishDataToQueue<T extends any>(
		queue: string,
		pattern: string,
		payload: T,
		queueOptions?: RmqClientOptions,
	) {
		this.logger.log('*********** publishDataToQueue ***********');
		console.log(
			`Sending to queue : ${JSON.stringify({ queue, payload, queueOptions })}`,
		);
		const { client, record } = this.createClientBuilder(
			queue,
			payload,
			queueOptions,
		);

		client
			.emit<T, any>(pattern, record)
			.subscribe({ complete: () => client.close() });
	}

	/**
	 * Generate client builder queue
	 * @param queue
	 * @param pattern
	 * @param payload
	 */
	createClientBuilder<T extends any>(
		queue: string,
		payload: T,
		queueOptions?: RmqClientOptions,
	) {
		const rmqOptions = { ...queueOptions, queue };
		const record = this.createBuilder(payload, rmqOptions);
		const client = this.createClient(rmqOptions);
		return { record, client };
	}

	/**
	 * Pub/ sub data to queue
	 * @param queue
	 * @param pattern
	 * @param payload
	 */
	async requestResponseDataToQueue<T extends any>(
		queue: string,
		pattern: Record<'cmd', string>,
		payload: T,
		queueOptions?: RmqClientOptions,
	): Promise<T> {
		this.logger.log('*********** requestResponseDataToQueue ***********');

		const { client, record } = this.createClientBuilder(
			queue,
			payload,
			queueOptions,
		);

		return new Promise((resolve, reject) => {
			let result;
			client.send(pattern, record).subscribe({
				next: (value) => {
					result = value;
				},
				error: (error) => reject(error),
				complete: () => {
					client.close();
					return resolve(result);
				},
			});
		});
	}

	createBuilder(payload: any, options?: RmqClientOptions) {
		return new RmqRecordBuilder()
			.setOptions({
				...options,
				priority: options.priority ?? 0,
			})
			.setData(payload)
			.build();
	}

	ack(context: RmqContext) {
		const channel = context.getChannelRef();
		const message = context.getMessage();
		channel.ack(message);
	}

	async handlePubSubMessage(asyncFunction: any, ctx: RmqContext) {
		this.logger.log('************ handleMessage *************');
		try {
			await asyncFunction;
		} catch (error) {
			const queue = ctx.getArgByIndex(0).fields.routingKey;
			const { data, pattern } = JSON.parse(ctx.getArgByIndex(0).content);

			if ([408, 429, 502, 503, 504].includes(Number(error.status))) {
				this.publishDataToQueue(queue, pattern, data);
			}
		} finally {
			this.ack(ctx);
		}
	}
}
