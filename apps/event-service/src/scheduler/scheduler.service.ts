import { LibTelegramService } from '@app/shared/telegram/telegram.service';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as fsExtra from 'fs-extra';
import { join } from 'path';

@Injectable()
export class SchedulerService {
	logger = new Logger(SchedulerService.name);
	constructor(
		private readonly telegramService: LibTelegramService,
		private readonly configService: ConfigService,
	) {}

	/**
	 * Clear logs file every weendend
	 */
	@Cron(CronExpression.EVERY_WEEKEND)
	async clearLogFilesEveryDay() {
		this.logger.log('********* clearLogFilesEveryDay *********');
		const logsDir = join(process.cwd(), 'logs');
		const listFiles = await fsExtra.readdir(logsDir);
		await Promise.all(
			listFiles.map(async (fileName) => {
				const filePath = join(logsDir, fileName);
				await fsExtra.writeFile(filePath, '', 'utf8');
				await this.telegramService.sendMessage(
					`File ${filePath} đã được dọn dẹp.`,
				);
			}),
		);
	}
}
