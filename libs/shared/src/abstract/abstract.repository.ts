import { ActionHistoryAdapter } from '@app/common/modules/action-history/action-history.adapter';
import { InfoDataAdapter } from '@app/common/modules/info-data/info-data.adapter';
import { ActionHistory } from '@app/common/schemas/action-history.schema';
import { Injectable, Logger } from '@nestjs/common';
import * as lodash from 'lodash';
import {
	Aggregate,
	ClientSession,
	FilterQuery,
	Model,
	ObjectId,
	PipelineStage,
	ProjectionType,
	QueryOptions,
	SaveOptions,
	UpdateQuery,
} from 'mongoose';
import { PipelineOptions } from 'stream';
import { utils } from '..';
import { CommonConfig } from '../config';
import { ENUM_ACTION_TYPE } from '../constants/enum';
import {
	LookupRecursion,
	getMetadataAggregate,
	matchAfterLookupRecursion,
} from '../mongodb';
import { RMQService } from '../rabbitmq';
import { getPageSkipLimit, toNumber, typeOf } from '../utils/function.utils';
import { AbstractSchema } from './abstract.schema';
import { AbstractFilterQueryDto } from './dto/abstract-filter-query.dto';
import { IAbstractRepository } from './interfaces';
import { AbstractType } from './types/abstract.type';
@Injectable()
export abstract class AbstractRepository<T extends AbstractSchema>
	implements IAbstractRepository<T>
{
	protected abstract readonly logger: Logger;
	public primaryModel: Model<T> = null;
	public secondaryModel: Model<T> = null;
	public modelInfo: AbstractType.ModelInfo = null;
	public collectionName: string = null;
	private _aggregateBuilder: Aggregate<any> = null;
	public rmqService: RMQService;
	public actionHistoryAdapter: ActionHistoryAdapter;
	public infoDataAdapter: InfoDataAdapter;

	constructor({
		primaryModel,
		secondaryModel,
	}: AbstractType.InitAbstractRepository<T>) {
		this.primaryModel = primaryModel;
		this.secondaryModel = secondaryModel;
		this.modelInfo = {
			modelName: primaryModel.modelName,
			collectionName: primaryModel.collection.name,
			schema: primaryModel.schema,
		};
		this.rmqService = new RMQService();
		this.actionHistoryAdapter = new ActionHistoryAdapter(this);
		this.infoDataAdapter = new InfoDataAdapter(this);
	}

	async startSession(): Promise<ClientSession> {
		return await this.primaryModel.startSession();
	}

	async create(
		payload: Partial<T> | Partial<T>[],
		options?: SaveOptions & AbstractType.EnableSaveAction,
	): Promise<T | T[]> {
		this.logger.log('************ create ***************');
		const payloadData = this.convertRawData(payload);

		const newData: T[] = (await this.primaryModel.create<Partial<T>>(
			payloadData as T[],
			options as any,
		)) as T[];

		//TODO: Save action log
		if (options?.enableSaveAction) {
			this.actionHistoryAdapter.listenRequestHistory<T | T[]>({
				new_data: newData,
				action_type: ENUM_ACTION_TYPE.CREATE,
				input_payload: payloadData,
			});
		}

		//TODO: Create ticket to Save Info
		this.infoDataAdapter.update(newData);

		return typeOf(payload) === 'array' ? newData : newData.at(0);
	}

	async update(
		filterQuery: FilterQuery<T>,
		payload: UpdateQuery<T>,
		options?: AbstractType.UpdateOption<T> & AbstractType.UpdateOnlyOne,
	): Promise<AbstractType.UpdateResponse | T | any> {
		if (options?.updateOnlyOne) {
			return this.findOneAndUpdate(filterQuery, payload, options);
		} else {
			return this.updateMany(filterQuery, payload, options);
		}
	}

	async updateMany(
		filterQuery: FilterQuery<T>,
		payload: UpdateQuery<T>,
		options?: AbstractType.UpdateOption<T> & AbstractType.UpdateOnlyOne,
	): Promise<AbstractType.UpdateResponse | T | any> {
		const oldDataList = await this.secondaryModel
			.find(filterQuery, {}, { lean: true })
			.allowDiskUse(true);

		await this.primaryModel.updateMany(filterQuery, payload, {
			new: true,
			...options,
		});

		if (oldDataList?.length) {
			//TODO: Save info data
			oldDataList.forEach((oldData) => {
				this.infoDataAdapter.update(oldData);

				if (options?.enableSaveAction) {
					this.actionHistoryAdapter.listenRequestHistory<T>({
						old_data: oldData,
						action_type: ENUM_ACTION_TYPE.UPDATE,
						input_payload: payload,
					});
				}
			});
		}
	}

	async findOneAndUpdate(
		filterQuery?: FilterQuery<T>,
		updateData?: UpdateQuery<T>,
		options?: AbstractType.UpdateOption<T>,
	): Promise<T> {
		this.logger.log('************ findOneAndUpdate ***************');
		if (options?.enableSaveAction) {
			const oldData = await this.secondaryModel.findOne(filterQuery).lean(true);
			this.actionHistoryAdapter.listenRequestHistory<T>({
				old_data: oldData,
				action_type: ENUM_ACTION_TYPE.UPDATE,
				input_payload: updateData,
			});
		}

		const updatedData = await this.primaryModel.findOneAndUpdate(
			filterQuery,
			updateData,
			this.findOneAndUpdateOptions(options),
		);

		this.infoDataAdapter.update(updatedData);

		return updatedData;
	}

	async findByIdAndUpdate(
		id: string | ObjectId,
		updateData?: Partial<T> | UpdateQuery<T>,
		options?: AbstractType.UpdateOption<T>,
	): Promise<T> {
		this.logger.log('******** findByIdAndUpdate ***********');
		return this.findOneAndUpdate({ _id: id }, updateData, options);
	}

	async deleteMany(
		filterQuery?: FilterQuery<T>,
		options?: AbstractType.DeleteOption<T>,
	): Promise<AbstractType.UpdateResponse> {
		const oldData = await this.secondaryModel
			.find(filterQuery, {}, { populate: [], lean: true })
			.allowDiskUse(true);

		let response;
		if (
			options?.softDelete !== false &&
			this.collectionHasField('deleted_at')
		) {
			response = this.primaryModel.updateMany(filterQuery, {
				$set: { deleted_at: new Date() },
			});
		} else {
			response = this.primaryModel.deleteMany(filterQuery, options);
		}

		if (oldData) {
			if (options?.enableSaveAction) {
				this.actionHistoryAdapter.listenRequestHistory<T>({
					old_data: oldData,
					action_type: ENUM_ACTION_TYPE.DELETE,
					created_by_user: options?.deleted_by_user as any,
				});
			}
			this.infoDataAdapter.remove(oldData);
		}

		return response;
	}

	async delete(
		filterQuery?: FilterQuery<T>,
		options?: AbstractType.DeleteOption<T>,
		type: 'deleteOne' | 'findOneAndDelete' = 'deleteOne',
	) {
		const oldData = await this.secondaryModel.findOne(
			filterQuery,
			{},
			{ lean: true, populate: [] },
		);

		let response;
		if (
			options?.softDelete !== false &&
			this.collectionHasField('deleted_at')
		) {
			response = await this.primaryModel[
				type === 'deleteOne' ? 'updateOne' : 'findOneAndUpdate'
			](filterQuery, {
				$set: { deleted_at: new Date() },
			});
		} else {
			response = await this.primaryModel[
				type === 'deleteOne' ? 'deleteOne' : 'findOneAndDelete'
			](filterQuery, options);
		}

		if (oldData) {
			options?.enableSaveAction &&
				this.actionHistoryAdapter.listenRequestHistory<T>({
					old_data: oldData,
					action_type: ENUM_ACTION_TYPE.DELETE,
					created_by_user: options?.deleted_by_user as any,
					created_by_user_info: options?.deleted_by_user_info as any,
				});

			this.infoDataAdapter.remove(oldData);
		}

		return response;
	}

	async deleteOne(
		filterQuery?: FilterQuery<T>,
		options?: AbstractType.DeleteOption<T>,
	): Promise<AbstractType.UpdateResponse> {
		return this.delete(filterQuery, options, 'deleteOne');
	}

	async deleteById(
		id: ObjectId | string,
		options?: AbstractType.DeleteOption<T>,
	): Promise<AbstractType.UpdateResponse> {
		return this.deleteOne({ _id: utils.toObjectID(id) }, options);
	}

	async findOneAndDelete(
		filterQuery: FilterQuery<T>,
		options: AbstractType.DeleteOption<T>,
	): Promise<T> {
		return this.delete(filterQuery, options, 'findOneAndDelete');
	}

	async findOne(
		filterQuery?: FilterQuery<T>,
		projection?: ProjectionType<T>,
		options?: AbstractType.FindOptions<T>,
	): Promise<T> {
		const result = await this.secondaryModel.findOne(
			filterQuery || {},
			this.getProjection(projection),
			this.findOptions(options),
		);

		return result?.deleted_at && !options?.includeSoftDelete ? null : result;
	}

	async findById(
		id: string | ObjectId,
		projection?: ProjectionType<T>,
		options?: AbstractType.FindOptions<T>,
	): Promise<T> {
		const result = await this.secondaryModel.findById(
			id,
			this.getProjection(projection),
			this.findOptions(options),
		);

		return result?.deleted_at && !options?.includeSoftDelete ? null : result;
	}

	async findAll(
		filterQuery?: FilterQuery<T>,
		projection?: ProjectionType<T> | string,
		options?: AbstractType.FindOptions<T>,
	): Promise<T[]> {
		this.handleIncludeSoftDelete(filterQuery, options);
		return await this.secondaryModel
			.find(
				filterQuery,
				this.getProjection(projection),
				this.findOptions(options),
			)
			.allowDiskUse(true);
	}

	async count(
		filterQuery?: FilterQuery<T>,
		options?: AbstractType.FindOptions<T>,
	): Promise<number> {
		this.handleIncludeSoftDelete(filterQuery, options);
		return await this.secondaryModel.count(filterQuery);
	}

	private handleIncludeSoftDelete(
		filterQuery: FilterQuery<T>,
		options: AbstractType.FindOptions<T>,
	) {
		if (!filterQuery) filterQuery = {};
		if (Object.keys(filterQuery).includes('deleted_at')) return;
		if (!options?.includeSoftDelete) filterQuery.deleted_at = null;
		else delete filterQuery.deleted_at;
	}

	async findAndCountAll(
		filterQuery?: FilterQuery<T>,
		projection?: ProjectionType<T> | string,
		options?: AbstractType.FindOptions<T>,
	): Promise<AbstractType.FindAndCountAllResponse<T>> {
		const [items, count] = await Promise.all([
			this.findAll(filterQuery, projection, options),
			this.count(filterQuery, options),
		]);
		return {
			items,
			count,
		};
	}

	getPopulates(projection?: string[]): string[] {
		const result = Object.values(this.modelInfo.schema.paths).reduce(
			(populates: string[], schemaPath: any) => {
				if (this.isValidPopulate(schemaPath)) {
					if (
						(projection?.length && projection.includes(schemaPath.path)) ||
						!projection
					) {
						populates.push(schemaPath.path);
					}
				}
				return populates;
			},
			[],
		) as string[];
		return result;
	}

	saveIntoActionHistory<T, K>(properties: ActionHistory<T, K>) {
		return this.actionHistoryAdapter.saveIntoActionHistory<T, K>(properties);
	}

	isValidPopulate(schemaPath: any) {
		return (
			(schemaPath.instance === 'ObjectID' && schemaPath.path !== '_id') ||
			(schemaPath.instance === 'Array' &&
				schemaPath?.$embeddedSchemaType?.instance === 'ObjectID')
		);
	}

	async getListIndex() {
		return this.secondaryModel.listIndexes();
	}

	aggregateBuilder(): Aggregate<any> {
		return (
			this._aggregateBuilder ??
			(this._aggregateBuilder = this.secondaryModel
				.aggregate()
				.allowDiskUse(true))
		);
	}

	aggregate<T extends any>(
		pipeline: PipelineStage[],
		options?: PipelineOptions,
	): Aggregate<Array<T>> {
		this.logger.log(JSON.stringify(pipeline, null, 4), 'Aggregate Pipeline');

		return this.secondaryModel.aggregate<T>(pipeline, {
			allowDiskUse: true,
			...options,
		});
	}

	collectionHasField(fieldName: string) {
		return lodash.has(this.modelInfo.schema.paths, fieldName);
	}

	getProjection(projection: any) {
		if (lodash.isEmpty(projection)) {
			return lodash.keys(this.modelInfo.schema.paths);
		}

		switch (utils.typeOf(projection)) {
			case 'string':
				return projection.replace(/\W+/g, ' ').split(/\s+/).filter(Boolean);
			case 'object':
				return Object.entries(projection).reduce((acc: any[], [key, val]) => {
					if (toNumber(val) >= 1) acc.push(key);
					return acc;
				}, []);
			default:
				return projection;
		}
	}

	async aggregateFindAllRecursion<
		T extends AbstractFilterQueryDto,
		R extends any,
	>(
		params: T,
		project?: any,
	): Promise<AbstractType.ResponseDataAndMetadata<R>> {
		this.logger.log('*********** aggregateFindAllRecursion *************');
		const { limit, skip, page } = getPageSkipLimit(params);

		const [{ data, metadata }]: Array<AbstractType.ResponseDataAndMetadata<R>> =
			await this.aggregate(
				[
					{ $match: this.findMatchConditionBeforeRecursion(params) },
					LookupRecursion({
						from: this.modelInfo.collectionName,
						localField: '_id',
						foreignField: 'parent',
						alias: 'children',
						searchFilterQuery: params.SearchFilterQuery,
						maxDepthLevel: params['max_level'],
						sort: params.sortFieldsDict,
						project,
					}),
					//TODO: Filter chỉ lấy root, level 0
					{
						$match: {
							parent: null,
						},
					},
					//TODO: Search Filter cho root
					{
						$match: matchAfterLookupRecursion(params.SearchFilterQuery),
					},
					project && { $project: project },
					{
						$facet: {
							data: [
								{
									$sort: params.sortFieldsDict,
								},
								{
									$skip: skip,
								},
								{
									$limit: limit,
								},
								lodash.isEmpty(params.addFieldList)
									? null
									: {
											$addFields: params.addFieldList,
									  },
								lodash.isEmpty(params.projectFields)
									? null
									: {
											$project: params.projectFields,
									  },
							].filter(Boolean),
							metadata: getMetadataAggregate(page, limit),
						},
					},
					{
						$set: {
							metadata: { $first: '$metadata' },
						},
					},
				].filter(Boolean),
			);

		return { data, metadata };
	}

	findMatchConditionBeforeRecursion(params: any): Record<string, any> {
		const condition: any = {};
		if (params.max_level) {
			condition.level = { $lte: params.max_level };
		}

		return condition;
	}

	async saveInfo(id: string) {
		this.logger.log('*********** saveInfo *************');
		const data = await this.findById(id, {}, { populateAll: true });
		if (!data) return;
		await Promise.allSettled([
			this.saveCurrentModelInfoData(data),
			this.saveOtherModelInfoData(data),
		]);
	}

	async removeInfo(id: string) {
		this.logger.log('*********** removeInfo *************');
		await this.removeOtherModelInfoData(id);
	}

	async saveCurrentModelInfoData(data: T) {
		this.logger.log('************** saveCurrentModelInfoData **************');
		const populateInfoData = this.getPopulates().reduce((acc, ele) => {
			acc[`${ele}_info`] = this.getInfoData(data[ele]);
			return acc;
		}, {});
		if (lodash.isEmpty(populateInfoData)) return;
		await this.primaryModel.updateOne(
			{ _id: data._id },
			{ $set: populateInfoData },
			{ new: true, strict: false },
		);
	}

	async saveOtherModelInfoData(data: T) {
		this.logger.log('************** saveOtherModelInfoData **************');
		const { db } = this.primaryModel;

		const promiseBulkWrite = Object.values(db.models).map(async (model) => {
			const schemaPaths = model.schema.paths;
			if (schemaPaths) {
				const refFields = this.getRefFieldsFromCurrentModel(schemaPaths);

				if (!refFields.length) return;
				const condition = this.getConditionRefFields(refFields, data);
				const dataList = await model
					.find(condition, CommonConfig.SAVE_INFO_FIELDS)
					.populate(refFields)
					.allowDiskUse(true);

				const chunk = lodash.chunk(dataList, CommonConfig.chunk);
				const result = [];

				for (const chunkItem of chunk) {
					const payloadUpdateList = chunkItem.map((data) => {
						const payloadUpdate = refFields.reduce((payload, field) => {
							payload[`${field}_info`] = this.getInfoData(data[field]);
							return payload;
						}, {});
						return {
							updateOne: {
								filter: { _id: data._id },
								update: {
									$set: payloadUpdate,
								},
							},
						};
					});
					result.push(model.bulkWrite(payloadUpdateList));
				}

				return result;
			}
		});
		await utils.promiseAllList(promiseBulkWrite.flat(1).filter(Boolean));
	}

	async removeOtherModelInfoData(id: string) {
		this.logger.log('************** removeOtherModelInfoData **************');
		const { db } = this.primaryModel;
		const promiseBulkWrite = Object.values(db.models).map(async (model) => {
			const schemaPaths = model.schema.paths;
			if (schemaPaths) {
				const bulkUpdateMany = Object.values(schemaPaths).map((schemaPath) => {
					const field = schemaPath.path;
					if (this.isObjectIdSchemaTypeRefCurrentModel(schemaPath)) {
						return {
							updateMany: {
								filter: {
									[field]: id,
								},
								update: {
									$set: {
										[field]: null,
										[`${field}_info`]: null,
									},
								},
							},
						};
					}
					if (this.isEmbeddedSchemaTypeRefCurrentModel(schemaPath)) {
						return {
							updateMany: {
								filter: {
									[field]: id,
								},
								update: {
									$pull: {
										[field]: id,
										[`${field}_info`]: { _id: utils.toObjectID(id) },
									},
								},
							},
						};
					}
				});
				return model.bulkWrite(bulkUpdateMany.flat(1).filter(Boolean) as any);
			}
		});
		await utils.promiseAllList(promiseBulkWrite.flat(1).filter(Boolean));
	}

	getConditionRefFields(refFields: string[], data: T) {
		if (refFields.length === 1) {
			const firstRefField = refFields.at(0);
			return { [firstRefField]: data._id };
		}

		return {
			$or: refFields.map((field) => ({
				[field]: data._id,
			})),
		};
	}

	getInfoData(rawData: any | any[]) {
		if (typeOf(rawData) === 'array') {
			return rawData.map((item) =>
				lodash.pick(item, CommonConfig.SAVE_INFO_FIELDS),
			);
		}
		return lodash.pick(rawData, CommonConfig.SAVE_INFO_FIELDS);
	}

	getRefFieldsFromCurrentModel(schemaPaths: AbstractType.SchemaType) {
		return Object.values(schemaPaths)
			.filter((schemaPath: any) => this.isSchemaPathRefCurrentModel(schemaPath))
			.map(({ path }) => path);
	}

	isSchemaPathRefCurrentModel(schemaPath) {
		return (
			this.isEmbeddedSchemaTypeRefCurrentModel(schemaPath) ||
			this.isObjectIdSchemaTypeRefCurrentModel(schemaPath)
		);
	}

	isEmbeddedSchemaTypeRefCurrentModel(schemaPath) {
		return (
			this.isValidPopulate(schemaPath) &&
			schemaPath?.$embeddedSchemaType?.options?.ref ===
				this.primaryModel.modelName
		);
	}

	isObjectIdSchemaTypeRefCurrentModel(schemaPath) {
		return (
			this.isValidPopulate(schemaPath) &&
			schemaPath?.options?.ref === this.primaryModel.modelName
		);
	}

	findOptions(options: AbstractType.FindOptions<T>): QueryOptions<T> {
		return {
			...options,
			populate: options?.populateAll ? this.getPopulates() : options?.populate,
		};
	}

	findOneAndUpdateOptions(
		options: AbstractType.UpdateOption<T>,
	): QueryOptions<T> {
		return {
			...this.findOptions(options),
			new: options?.new !== false,
		};
	}

	generateRandomCodeByModelData(modelName: string, data: any) {
		let uniqString = '';
		let suffix = String(utils.generateRandomString({ length: 6 }));
		if (utils.typeOf(data) === 'string') {
			uniqString = data;
		} else if (data.email) {
			uniqString = data.email.split('@').at(0);
		} else if (data.phone) {
			uniqString = data.phone.trim();
		} else if (data.code) {
			return data.code.toUpperCase();
		}

		return utils
			.generateRandomCode({
				prefix: CommonConfig.generatePrefixCodeByModel(modelName),
				str: uniqString,
				suffix,
				delimiter: '',
			})
			.toUpperCase();
	}

	private convertRawData(rawData: any): any[] {
		return utils.toArray(rawData).map((item: Record<string, any>) => {
			item.code = this.generateRandomCodeByModelData(
				this.modelInfo.modelName,
				item,
			);
			return item;
		});
	}
}
