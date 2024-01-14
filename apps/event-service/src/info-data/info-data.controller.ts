import { InfoDataService } from '@app/common/modules/info-data/info-data.service';
import { CommonConfig } from '@app/shared';
import { AbstractType } from '@app/shared/abstract/types/abstract.type';
import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller()
export class InfoDataControler {
	logger = new Logger(InfoDataControler.name);
	constructor(private readonly saveInfoService: InfoDataService) {}

	@EventPattern(CommonConfig.RMQ_EVENT_PATTERNS.SAVE_INFO)
	async onSaveInfo(@Payload() payload: AbstractType.SaveInfoPayload) {
		this.logger.log('************ onSaveInfo **************');
		return this.saveInfoService.onSaveInfo(payload);
	}

	@EventPattern(CommonConfig.RMQ_EVENT_PATTERNS.REMOVE_INFO)
	async onRemoveInfo(@Payload() payload: AbstractType.SaveInfoPayload) {
		this.logger.log('************ onRemoveInfo **************');
		return this.saveInfoService.onRemoveInfo(payload);
	}
}
