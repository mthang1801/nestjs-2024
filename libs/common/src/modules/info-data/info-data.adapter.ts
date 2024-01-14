import {
  AbstractRepository,
  AbstractSchema,
  CommonConfig,
  utils,
} from '@app/shared';
import { AbstractType } from '@app/shared/abstract/types/abstract.type';
import { Logger } from '@nestjs/common';

export class InfoDataAdapter {
	private logger = {
		log: (message: any) => Logger.log(message, InfoDataAdapter.name),
	};

	constructor(private abstractRepository: AbstractRepository<any>) {}

	update<T extends AbstractSchema>(data: T | T[]) {
		this.logger.log('=========== updateData =============');
		utils.toArray(data).forEach((dataItem: T) => {
			this.publishMessageSaveInfo(String(dataItem._id));
		});
	}

	remove<T extends AbstractSchema>(data: T | T[]) {
		this.logger.log('=========== remove =============');
		utils.toArray(data).forEach((dataItem: T) => {
			this.publishMessageRemoveInfo(String(dataItem._id));
		});
	}

	publishMessageSaveInfo(id: string) {
		const payload = {
			id,
			modelName: this.abstractRepository.modelInfo.modelName,
		};
		this.abstractRepository.rmqService.publishDataToQueue<AbstractType.SaveInfoPayload>(
			CommonConfig.RMQ_QUEUES.SAVE_INFO,
			CommonConfig.RMQ_EVENT_PATTERNS.SAVE_INFO,
			payload,
		);
	}

	publishMessageRemoveInfo(id: string) {
		const payload = {
			id,
			modelName: this.abstractRepository.modelInfo.modelName,
		};
		this.abstractRepository.rmqService.publishDataToQueue<AbstractType.SaveInfoPayload>(
			CommonConfig.RMQ_QUEUES.REMOVE_INFO,
			CommonConfig.RMQ_EVENT_PATTERNS.REMOVE_INFO,
			payload,
		);
	}
}
