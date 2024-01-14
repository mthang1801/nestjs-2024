import { ActionHistory } from '@app/common';
import { AbstractRepository, utils } from '@app/shared';
import { ENUM_ACTION_TYPE } from '@app/shared/constants';
import { Logger } from '@nestjs/common';
import { CommonConfig } from '../../../../shared/src/config/common.config';
import { convertInfoData } from '@app/shared/utils/function.utils';
export class ActionHistoryAdapter {
	private logger = {
		log: (message: any) => Logger.log(message, ActionHistoryAdapter.name),
	};
	public exclusiveFieldChanges = ['_id', 'created_at', 'updated_at'];
	constructor(private abstractRepository: AbstractRepository<any>) {}

	listenRequestHistory<T>({
		new_data,
		old_data,
		custom_data,
		action_type,
		input_payload,
		created_by_user,
		created_by_user_info,
	}: ActionHistory<T, any>) {
		this.logger.log('*********** listenRequestHistory *************');

		const findCreatedByUser = this.findCreatedByUserForActionHistory(
			input_payload,
			action_type,
		);
		created_by_user = findCreatedByUser?.created_by_user ?? created_by_user;
		created_by_user_info =
			findCreatedByUser?.created_by_user_info ??
			convertInfoData(created_by_user_info);

		switch (action_type) {
			case 'CREATE':
				return utils.toArray<T>(new_data).map((newDataItem) =>
					this.saveIntoActionHistory<T, any>({
						new_data: newDataItem,
						action_type,
						custom_data,
						created_by_user,
						created_by_user_info,
					}),
				);
			case 'UPDATE':
			case 'DELETE':
				return utils.toArray<T>(old_data).map((oldDataItem) =>
					this.saveIntoActionHistory<T, any>({
						old_data: oldDataItem,
						action_type,
						custom_data,
						created_by_user,
						created_by_user_info,
					}),
				);
		}
	}

	findCreatedByUserForActionHistory<T>(
		inputPayload: T | T[],
		actionType: keyof typeof ENUM_ACTION_TYPE,
	) {
		const inputPayloadList = utils.toArray(inputPayload);
		if (!inputPayloadList.length) return null;
		const payload: any = inputPayloadList.at(0);
		const result = {
			created_by_user: payload?.created_by_user,
			created_by_user_info: payload?.created_by_user_info,
		};
		switch (actionType) {
			case 'UPDATE': {
				result.created_by_user = payload?.updated_by_user;
				result.created_by_user_info = payload?.updated_by_user_info;
				break;
			}
			case 'DELETE': {
				result.created_by_user = payload?.deleted_by_user;
				result.created_by_user_info = payload?.deleted_by_user_info;
				break;
			}
		}
		return result;
	}

	saveIntoActionHistory<T, K>(properties: ActionHistory<T, K>) {
		try {
			this.logger.log('*********** saveIntoActionHistory *************');
			const {
				new_data,
				old_data,
				action_type,
				custom_data,
				created_by_user,
				created_by_user_info,
				data_source,
			} = properties;

			const payload: ActionHistory<T, K> = {
				new_data: new_data?._doc ?? new_data ?? undefined,
				old_data: old_data?._doc ?? old_data ?? undefined,
				action_type,
				custom_data,
				populates: this.abstractRepository.getPopulates(),
				data_source: data_source ?? 'SYSTEM',
				exclusive_fields: this.exclusiveFieldChanges,
				collection_name: this.abstractRepository.modelInfo.collectionName,
				created_by_user,
				created_by_user_info,
			};

			this.abstractRepository.rmqService.publishDataToQueue<
				ActionHistory<T, K>
			>(
				CommonConfig.RMQ_QUEUES.ACTION_HISTORY,
				CommonConfig.RMQ_EVENT_PATTERNS.SAVE_ACTION,
				payload,
			);
		} catch (error) {
			console.log(error.stack);
		}
	}
}
