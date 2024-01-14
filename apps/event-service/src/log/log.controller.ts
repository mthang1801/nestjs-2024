import { SaveLogDto } from '@app/common/modules/log/dto/save-log.dto';
import { LogService } from '@app/common/modules/log/log.service';
import {
    CommonConfig,
    RMQService
} from '@app/shared';
import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';

@Controller()
export class LogController {
	constructor(
		private readonly rmqService: RMQService,
		private readonly logService: LogService,
	) {}

	@EventPattern(CommonConfig.RMQ_EVENT_PATTERNS.SAVE_LOG)
	async saveLog(@Payload() payload: SaveLogDto, @Ctx() ctx: RmqContext) {
		await this.logService.saveLog(payload);
		this.rmqService.ack(ctx);
	}

	@EventPattern(CommonConfig.RMQ_EVENT_PATTERNS.TELEGRAM_MESSAGE)
	async publishMessageToTelegram(@Payload() { message }: { message: string }) {
		await this.logService.publishMessageToTelegram(message);
	}
}
