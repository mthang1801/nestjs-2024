import { LibTelegramService } from '@app/shared/telegram/telegram.service';
import { dateBefore, startOfDay } from '@app/shared/utils/dates.utils';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SaveLogDto } from './dto/save-log.dto';
import { LogRepository } from './log.repository';

@Injectable()
export class LogService {
	logger = new Logger(LogService.name);
	constructor(
		readonly logRepository: LogRepository,
		private readonly telegramService: LibTelegramService,
	) {}

	async publishMessageToTelegram(message: string) {
		this.logger.log('************** publishMessageToTelegram *************');
		await this.telegramService.sendMessage(message);
	}

	async saveLog(payload: SaveLogDto) {
		await this.logRepository.primaryModel.create(payload);
	}

	@Cron(CronExpression.EVERY_WEEKEND)
	async clearLog() {
		await this.logRepository.primaryModel.deleteMany({
			created_at: { $gte: startOfDay(dateBefore(7)) },
		});
	}
}
