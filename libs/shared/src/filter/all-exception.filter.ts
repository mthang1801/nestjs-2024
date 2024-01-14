import { Log } from '@app/common';
import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { I18nService } from 'nestjs-i18n';
import { CommonConfig } from '../config';
import { ENUM_LOG_STATUS, ENUM_LOG_TOPIC } from '../constants';
import { RMQService } from '../rabbitmq';
import { LibTelegramService } from '../telegram/telegram.service';
import { typeOf } from '../utils/function.utils';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
	constructor(
		protected readonly configService: ConfigService,
		protected readonly telegramService: LibTelegramService,
		private readonly i18n: I18nService,
		private readonly rmqService: RMQService,
	) {}
	protected logger = new Logger(AllExceptionsFilter.name);
	protected serviceName = AllExceptionsFilter.name;

	async catch(exception: HttpException, host: ArgumentsHost) {
		this.logger.log('**************** Catch **************');
		const ctx = host.switchToHttp();
		const res: Response = ctx.getResponse();
		const req: Request = ctx.getRequest();

		const statusCode = this.getStatusCode(exception);

		const message = await this.getMessage(exception, statusCode);

		this.writeLogger(message, req, exception);
		this.sendToTelegram(exception, statusCode);
		this.sendToLog(ctx, exception, statusCode);

		res.status(statusCode).json({
			success: false,
			statusCode,
			data: null,
			message,
		});
	}

	getStatusCode(exception: HttpException): number {
		const statusCode =
			exception instanceof HttpException
				? exception.getStatus() || 500
				: HttpStatus.INTERNAL_SERVER_ERROR;
		return statusCode;
	}

	async getMessage(
		exception: HttpException,
		statusCode: number,
	): Promise<string> {
		let messageResponse: any;
		if ((exception as any) instanceof HttpException) {
			messageResponse =
				exception.getResponse()?.['message'] ||
				exception.getResponse().valueOf() ||
				exception.message;
		} else if (exception instanceof Error) {
			if (/E11000 duplicate key error collection/i.test(exception.message)) {
				const uniqErrorValue = exception.message
					.substring(
						exception.message.lastIndexOf('{') - 1,
						exception.message.lastIndexOf('}') + 1,
					)
					.trim();
				return await this.i18n.t('errors.unique_code_exists', {
					args: { code: uniqErrorValue },
				});
			} else {
				messageResponse =
					exception['errors'] && typeOf(exception['errors']) === 'array'
						? exception['errors'].join(' ')
						: exception?.message || exception;
			}
		} else {
			messageResponse = exception['message'] || exception || 'Internal server';
		}

		let messageResult = '';
		if (messageResponse instanceof Object) {
			if (typeOf(messageResponse) === 'array') {
				messageResult = messageResponse.filter(Boolean).join(', ');
			} else if (typeOf(messageResponse) === 'object') {
				messageResult = Object.values(messageResponse)
					.filter(Boolean)
					.join(', ');
			}
		} else {
			messageResult = messageResponse;
		}

		return (
			messageResult || (await this.i18n.t(`errors.STATUS_CODE.${statusCode}`))
		);
	}

	writeLogger(message: string, req: Request, exception: HttpException) {
		this.logger.log('**************** writeLogger **************');

		const stack = [
			{ stack: exception.stack },
			{ url: req.url },
			{ method: req.method },
			{ body: req.body },
			{ params: req['params'] },
			{ query: req['query'] },
		];

		this.logger.error(message, stack, exception.name);
	}

	async sendToTelegram(exception: HttpException, statusCode: number) {
		this.logger.log('**************** sendToTelegram **************');
		this.logger.error(`❌[${this.serviceName}] ${exception}`);

		if (statusCode < 500) return;

		this.rmqService.publishDataToQueue(
			CommonConfig.RMQ_QUEUES.TELEGRAM,
			CommonConfig.RMQ_EVENT_PATTERNS.TELEGRAM_MESSAGE,
			{
				message: `❌[${exception.name}]-->${exception.message}-->${exception.stack}`,
			},
		);
	}

	sendToLog(
		ctx: HttpArgumentsHost,
		exception: HttpException,
		statusCode: number,
	) {
		if (statusCode < 501) return;
		const req: Request = ctx.getRequest();
		const res: Response = ctx.getResponse();
		this.rmqService.publishDataToQueue<Log>(
			CommonConfig.RMQ_QUEUES.SAVE_LOG,
			CommonConfig.RMQ_EVENT_PATTERNS.SAVE_LOG,
			{
				request_body: JSON.stringify(req.body),
				request_method: req.method,
				request_query_params: JSON.stringify(req.query),
				request_url: req.url,
				response_data: JSON.stringify(exception.stack),
				response_message: exception.message,
				response_status_code: statusCode,
				status: ENUM_LOG_STATUS.ERROR,
				topic: ENUM_LOG_TOPIC.HTTP_REQUEST,
			},
		);
	}
}
