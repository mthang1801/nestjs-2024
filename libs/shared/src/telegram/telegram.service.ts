import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TelegramMessage, TelegramService } from 'nestjs-telegram';
import { utils } from '..';
@Injectable()
export class LibTelegramService {
	logger = new Logger(LibTelegramService.name);
	chatId: string;
	constructor(
		private readonly configService: ConfigService,
		private readonly telegramService: TelegramService,
	) {
		this.chatId = this.configService.get<string>('TELEGRAM_GROUP_ID');
	}

	canNotify(): boolean {
		return utils.toBoolean(
			this.configService.get<boolean>('TELEGRAM_ENALBE_NOTI'),
		);
	}

	async sendMessage(message: string): Promise<TelegramMessage> {
		if (!this.canNotify()) return;
		return this.telegramService
			.sendMessage({
				chat_id: this.chatId,
				text: message,
			})
			.toPromise()
			.catch((error) => {
				throw new Error(JSON.stringify(error));
			});
	}

	async sendDocument(document: Buffer | string) {
		if (!this.canNotify()) return;
		return this.telegramService
			.sendDocument({ chat_id: this.chatId, document })
			.toPromise()
			.catch((error) => {
				throw new Error(error.message);
			});
	}
}
