import { User } from '@app/common/schemas';
import { ActionHistory } from '@app/common/schemas/action-history.schema';
import { utils } from '@app/shared';
import {
	ENUM_ACTION_HISTORY_METHOD_DESCRIPTION,
	ENUM_ACTION_LOG_DATA_SOURCE,
	ENUM_ACTION_TYPE,
} from '@app/shared/constants/enum';
import { LibMongoService } from '@app/shared/mongodb/mongodb.service';
import { dateFormatDMY_hms24h, today } from '@app/shared/utils/dates.utils';
import { convertInfoData, typeOf } from '@app/shared/utils/function.utils';
import { Inject, Injectable, Logger } from '@nestjs/common';
import * as lodash from 'lodash';
import { isValidObjectId } from 'mongoose';
import { I18nService } from 'nestjs-i18n';
import { ActionHistoryRepository } from './action-history.repository';
import { ActionHistoryFilterQueryDto } from './dto/action-history-query-filter.dto';
import { SaveCustomActionHistoryDto } from './dto/save-custom-action-history.dto';
import { ActionHistoryResponseDetailEntity } from './entity/action-history-response-detail.entity';
import { getCollectionNameDescription } from '@app/shared/config/config.helper';

@Injectable()
export class ActionHistoryService {
	logger = new Logger(ActionHistoryService.name);

	@Inject()
	private i18n: I18nService;
	constructor(
		private readonly actionHistoryRepository?: ActionHistoryRepository,
		private readonly mongoService?: LibMongoService,
	) {}

	public async save(payload: ActionHistory<any, any>) {
		this.logger.log('******** Save Action History ************');

		this.logger.log(`${'*'.repeat(20)} save() ${'*'.repeat(20)}`);
		this.parseData(payload);
		if (
			[ENUM_ACTION_TYPE.UPDATE].includes(
				payload.action_type as ENUM_ACTION_TYPE,
			)
		) {
			if (!payload.new_data && payload.old_data) {
				payload.new_data = await this.mongoService.findById(
					payload.collection_name,
					payload.old_data?._id || payload.old_data?.id,
				);
			}
		}
		this.handlePayloadByActionType(payload);
		this.setActionHistoryDescription(payload);

		if (this.canCreateActionLog(payload)) {
			await this.actionHistoryRepository.primaryModel.create(payload);
		}
	}

	handlePayloadByActionType(payload: ActionHistory<any, any>) {
		switch (payload.action_type) {
			case 'CREATE':
			case 'UPDATE':
				{
					this.handleExclusiveFields(payload);
					this.handlePopulateFieldsInfo(payload);
					this.setDiffFields(payload);
				}
				break;
			case 'DELETE':
				{
					this.handlePayloadWithActionDelete(payload);
				}
				break;
		}
	}

	handlePayloadWithActionDelete(payload: ActionHistory<any, any>) {
		this.logger.log('*********** handlePayloadWithActionDelete ************');
		payload.custom_data = this.i18n.t('logs.DELETE', {
			args: {
				collection_name: payload.collection_name,
				deleted_code: payload?.old_data?.code,
				deleted_name: payload?.old_data?.name,
			},
		});
	}

	private parseData(payload: ActionHistory<any, any>) {
		payload.new_data = utils.parseData(payload.new_data);
		payload.old_data = utils.parseData(payload.old_data);

		[payload.new_data, payload.old_data].forEach((data) => {
			this.formatPopulateAndRemoveInfoField(data, payload.populates);
		});
	}

	setActionHistoryDescription(payload: ActionHistory<any, any>) {
		payload.description =
			payload.custom_data ??
			[
				ENUM_ACTION_HISTORY_METHOD_DESCRIPTION[payload.action_type],
				getCollectionNameDescription(payload.collection_name as any),
			]
				.filter(Boolean)
				.join(' ');

		payload.description = lodash.capitalize(payload.description);
	}

	formatPopulateAndRemoveInfoField(data: any, populates: string[]) {
		this.logger.log('********** formatPopulateAndRemoveInfoField ***********');

		if (!data) return;
		for (const [key, val] of Object.entries(data)) {
			if (populates.includes(key) && val) {
				console.log('formatPopulateAndRemoveInfoField::', key, val);
				if (typeOf(val) === 'array') {
					data[key] = (val as any[])
						.map((item) => item?.['_id'] || item)
						.filter(Boolean);
				} else {
					data[key] = val['_id'] || val;
				}
			}

			if (this.isInfoField(key)) {
				delete data[key];
			}
		}
	}

	isInfoField(key: string) {
		return key.split('_').at(-1) === 'info';
	}

	private handleExclusiveFields(payload: ActionHistory<any, any>) {
		this.logger.log(`******* handleExclusiveFields() *******`);

		payload?.exclusive_fields?.length &&
			payload.exclusive_fields.forEach((field) => {
				payload.new_data && delete payload.new_data[field];
				payload.old_data && delete payload.old_data[field];
			});

		[payload.new_data, payload.old_data].forEach((data) =>
			this.handleExclusiveInfoFields(data),
		);
	}

	handleExclusiveInfoFields(data: any) {
		if (!data) return;
		for (const [key, val] of Object.entries(data)) {
			if (this.isInfoField(key)) {
				delete data[key];
			}
		}
	}

	private handlePopulateFieldsInfo(payload: ActionHistory<any, any>) {
		this.logger.log(`******* handlePopulateFieldsInfo() *******`);
		['new_data', 'old_data'].forEach((typeData) => {
			if (payload[typeData])
				payload[typeData] = this.formatPopulateFields(
					payload[typeData],
					payload.populates,
				);
		});
	}

	private formatPopulateFields(data, populates) {
		this.logger.log(
			`${'*'.repeat(20)} formatPopulateFields() ${'*'.repeat(20)}`,
		);
		return Object.entries(data).reduce((res, [key, val]: [string, any]) => {
			if (
				typeOf(populates) === 'array' &&
				populates?.includes(key) &&
				!lodash.isEmpty(val)
			) {
				res[key] =
					typeOf(val) === 'array'
						? val.map((item) => item)
						: utils.toObjectID(val);
			} else {
				res[key] = val;
			}
			return res;
		}, {});
	}

	private setDiffFields(payload: ActionHistory<any, any>): void {
		this.logger.log(`******* setDiffFields() ********`); //TODO: Thực hiện khi có action là DELETE

		if (payload.old_data && payload.action_type === 'DELETE') {
			this.logger.log(
				'*********** Handle Old data and  Action Delete ************',
			);
			payload.different_data = Object.entries(payload.old_data).reduce(
				(result, [key, oldValue]) => {
					result[key] = {
						old_data: oldValue,
						new_data: null,
					};
					return result;
				},
				{},
			);
			return;
		}

		//TODO: Thực hiện khi có action là CREATE hoặc UPDATE
		this.logger.log('Thực hiện khi có action là CREATE hoặc UPDATE');
		if (!payload.new_data) return;
		this.logger.log('*********** Handle Create Or Update Data ************');

		payload.different_data = Object.entries(payload.new_data).reduce(
			(result, [key, newValue]) => {
				const oldData = payload?.old_data;
				const oldValue = oldData ? oldData[key] : undefined;

				if (
					this.isOldAndNewValueEqual(oldValue, newValue) ||
					this.isInfoField(key)
				) {
					return result;
				}

				result[key] = {
					old_data: oldValue,
					new_data: newValue,
				};
				return result;
			},
			{},
		);
	}

	private isOldAndNewValueEqual(oldValue, newValue) {
		if (['object', 'array'].includes(typeOf(oldValue))) {
			return utils.objectEquals(oldValue, newValue);
		}

		if (isValidObjectId(oldValue) && isValidObjectId(newValue))
			return String(oldValue) === String(newValue);

		if (JSON.stringify(oldValue) === JSON.stringify(newValue)) return true;

		return false;
	}

	private canCreateActionLog(payload: ActionHistory<any, any>): boolean {
		this.logger.log('**************** canCreateActionLog ****************');
		if (payload.custom_data) return true;

		switch (payload.action_type) {
			case 'UPDATE':
			case 'DELETE':
				return !lodash.isEmpty(payload.different_data);
			default:
				return true;
		}
	}

	public async saveCustomLog(properties: SaveCustomActionHistoryDto) {
		const payload = {
			...properties,
			action_type: properties.action_type,
			custom_data: properties.custom_data,
			data_source: ENUM_ACTION_LOG_DATA_SOURCE.CUSTOM,
			collection_name: properties.collection_name || 'auth',
		};

		this.setActionHistoryDescription(payload);
		return this.actionHistoryRepository.primaryModel.create(payload);
	}

	public async findAll(query: ActionHistoryFilterQueryDto) {
		return this.actionHistoryRepository.findAllByAggregate(query);
	}

	async saveLoginAction(user: User, ip: string) {
		return this.saveCustomLog({
			custom_data: this.i18n.t('logs.LOGIN', {
				args: {
					login_at: today(dateFormatDMY_hms24h),
					ip,
				},
			}),
			created_by_user: user.id,
			created_by_user_info: convertInfoData(user),
		});
	}

	async findById(id: string) {
		const response = await this.actionHistoryRepository.secondaryModel
			.findById(id)
			.lean(true);
		return new ActionHistoryResponseDetailEntity({ data: response });
	}
}
