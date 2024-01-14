import { ActionHistoryFilterQueryDto } from '@app/common/modules';
import { ActionHistory } from '@app/common/schemas/action-history.schema';
import {
	AbstractDocument,
	AbstractSchema,
	AggregateFilterQueryDateTime,
	CommonConfig,
	getMetadataAggregate,
	utils,
} from '@app/shared';
import { AbstractType } from '@app/shared/abstract/types/abstract.type';
import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as lodash from 'lodash';
import {
	ClientSession,
	FilterQuery,
	Model,
	ObjectId,
	PipelineStage,
	ProjectionType,
	SaveOptions,
	UpdateQuery,
} from 'mongoose';
import { I18nService } from 'nestjs-i18n';
import { PipelineOptions } from 'stream';
import { LibMongoService } from '../mongodb/mongodb.service';
import { getPageSkipLimit } from '../utils/function.utils';
import { AbstractRepository } from './abstract.repository';

@Injectable()
export abstract class AbstractService<
	T extends AbstractDocument<AbstractSchema> | any,
> {
	protected abstract logger?: Logger;
	public primaryModel: Model<T> = null;
	public readModel: Model<T> = null;
	public modelInfo: AbstractType.ModelInfo = null;

	@Inject()
	protected i18n: I18nService;

	@Inject()
	protected configService: ConfigService;

	@Inject()
	protected httpService: HttpService;

	@Inject()
	protected readonly mongoService?: LibMongoService;

	constructor(readonly repository?: AbstractRepository<T>) {
		if (repository) {
			this.primaryModel = repository.primaryModel;
			this.readModel = repository.secondaryModel;
			this.modelInfo = repository.modelInfo;
		}
	}

	public async startSession(): Promise<ClientSession> {
		return await this.repository.startSession();
	}

	public async _create(
		payload: Partial<T> | Partial<T>[],
		options?: SaveOptions & AbstractType.EnableSaveAction,
	): Promise<T | T[]> {
		return await this.repository.create(payload, options);
	}

	public async _findById(
		id: ObjectId | string,
		projection?: ProjectionType<T>,
		options?: AbstractType.FindOptions<T>,
	) {
		return await this.repository.findById(id, projection, options);
	}

	public async _findOne(
		filterQuery?: FilterQuery<T>,
		projection?: ProjectionType<T>,
		options?: AbstractType.FindOptions<T>,
	): Promise<T> {
		return this.repository.findOne(filterQuery, projection, options);
	}

	public async _findAll(
		filterQuery?: FilterQuery<T>,
		projection?: ProjectionType<T> | string,
		options?: AbstractType.FindOptions<T>,
	): Promise<T[]> {
		return await this.repository.findAll(filterQuery, projection, options);
	}

	public async _findAndCountAll(
		filterQuery?: FilterQuery<T>,
		projection?: ProjectionType<T> | string,
		options?: AbstractType.FindOptions<T>,
	): Promise<AbstractType.FindAndCountAllResponse<T>> {
		return await this.repository.findAndCountAll(
			filterQuery,
			projection,
			options,
		);
	}

	async _count(
		filterQuery?: FilterQuery<T>,
		options?: AbstractType.FindOptions<T>,
	): Promise<number> {
		return await this.repository.count(filterQuery, options);
	}

	public async _update(
		fitlerQuery: FilterQuery<T>,
		payload: Partial<T> | UpdateQuery<T>,
		options?: AbstractType.UpdateOption<T> & AbstractType.UpdateOnlyOne,
	): Promise<AbstractType.UpdateResponse | T | any> {
		return await this.repository.update(fitlerQuery, payload, options);
	}

	public async _findByIdAndUpdate(
		id: string | ObjectId,
		payload: Partial<T> | UpdateQuery<T>,
		options?: AbstractType.UpdateOption<T>,
	): Promise<T> {
		return await this.repository.findByIdAndUpdate(
			String(id),
			payload,
			options,
		);
	}

	public async _findOneAndUpdate(
		filterQuery: FilterQuery<T>,
		payload: Partial<T> | UpdateQuery<T>,
		options?: AbstractType.UpdateOption<T>,
	): Promise<T> {
		return await this.repository.findOneAndUpdate(
			filterQuery,
			payload,
			options,
		);
	}

	public async _getListIndexes() {
		return await this._getListIndexes();
	}

	public async _deleteById(
		id: ObjectId | string,
		options?: AbstractType.DeleteOption<T>,
	): Promise<AbstractType.UpdateResponse> {
		return await this.repository.deleteById(String(id), options);
	}

	public async _deleteOne(
		filterQuery?: FilterQuery<T>,
		options?: AbstractType.DeleteOption<T>,
	): Promise<AbstractType.UpdateResponse> {
		return await this.repository.deleteOne(filterQuery, options);
	}

	public async _findOneAndDelete(
		filterQuery: FilterQuery<T>,
		options?: AbstractType.DeleteOption<T>,
	): Promise<T> {
		return await this.repository.findOneAndDelete(filterQuery, options);
	}

	public async _deleteMany(
		filterQuery?: FilterQuery<T>,
		options?: AbstractType.DeleteOption<T>,
	): Promise<AbstractType.UpdateResponse> {
		return await this.repository.deleteMany(filterQuery, options);
	}

	public async _aggregate<T extends any>(
		pipeline: PipelineStage[],
		options?: PipelineOptions,
	): Promise<Array<T>> {
		return this.repository.aggregate<T>(pipeline, options);
	}

	public async _aggregateBuilder() {
		return this.repository.aggregateBuilder();
	}

	public _saveIntoActionHistory(properties: ActionHistory<any, any>) {
		return this.repository.saveIntoActionHistory({
			collection_name: this.modelInfo.collectionName,
			...properties,
			data_source: 'CUSTOM',
		});
	}

	public async _findActionLogs(query: ActionHistoryFilterQueryDto) {
		const [{ data, meta }] = await this.mongoService.aggregate(
			CommonConfig.CORE_MODULES.ACTION_HISTORY.COLLECTION,
			[
				this.stageFilterQuery(query),
				this.stageSearchQuery(query),
				this.stageFacetDataAndMeta(query),
			]
				.filter(Boolean)
				.flat(1),
		);

		return { items: data, metadata: meta };
	}

	stageFilterQuery(query: ActionHistoryFilterQueryDto) {
		const filterQuery: Partial<ActionHistoryFilterQueryDto> = {};

		filterQuery.collection_name =
			query.collection_name ?? this.modelInfo.collectionName;

		if (query.created_by_user)
			filterQuery.created_by_user = utils.toObjectID(
				String(query.created_by_user),
			);

		if (query.action_type) filterQuery.action_type = query.action_type;

		AggregateFilterQueryDateTime(
			filterQuery,
			query.from_date,
			query.to_date,
			'created_at',
		);

		if (query.data_source) filterQuery.data_source = query.data_source;

		return lodash.isEmpty(filterQuery)
			? null
			: {
					$match: filterQuery,
			  };
	}

	stageSearchQuery(
		query: ActionHistoryFilterQueryDto,
	): Array<
		| PipelineStage.Search
		| PipelineStage.AddFields
		| PipelineStage.Match
		| PipelineStage.Sort
	> {
		if (!query.q) return null;
		return [
			{
				$match: {
					raw_data: {
						$regex: new RegExp(query.q, 'gi'),
					},
				},
			},
		];
	}

	stageFacetDataAndMeta(
		query: ActionHistoryFilterQueryDto,
	): Array<PipelineStage.Facet | PipelineStage.Set> {
		const { page, skip, limit } = getPageSkipLimit(query);
		return [
			{
				$facet: {
					data: [
						{
							$sort: {
								updated_at: -1,
							},
						},
						{
							$skip: skip,
						},
						{
							$limit: limit,
						},
					],
					meta: getMetadataAggregate(page, limit),
				},
			},
			{
				$set: {
					meta: {
						$first: '$meta',
					},
				},
			},
		];
	}

	async _saveInfo(id: string) {
		return this.repository.saveInfo(id);
	}

	async _removeInfo(id: string) {
		return this.repository.removeInfo(id);
	}
}
