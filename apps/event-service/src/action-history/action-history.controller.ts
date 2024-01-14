import { ActionHistory, ActionHistoryService } from '@app/common';
import { CommonConfig, RMQService } from '@app/shared';
import { Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
@Controller()
export class ActionHistoryController {
	logger = new Logger(ActionHistoryController.name);

	constructor(
		private readonly rmqClientService: RMQService,
		private readonly actionHistoryService: ActionHistoryService,
	) {}

	@EventPattern(CommonConfig.RMQ_EVENT_PATTERNS.SAVE_ACTION)
	async saveLogAction(
		@Payload() payload: ActionHistory<any, any>,
		@Ctx() context: RmqContext,
	) {
		await this.actionHistoryService.save(payload);
		this.rmqClientService.ack(context);
	}
}
