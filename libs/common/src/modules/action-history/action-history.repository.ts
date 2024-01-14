import {
	ActionHistory,
	ActionHistoryDocument,
} from '@app/common/schemas/action-history.schema';
import { AbstractRepository, utils } from '@app/shared';
import { ENUM_CONNECTION_NAME } from '@app/shared/mongodb';
import * as MongoDBHelper from '@app/shared/mongodb/helper';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as lodash from 'lodash';
import { Model, PipelineStage } from 'mongoose';
import { ActionHistoryFilterQueryDto } from './dto';
import { ActionHistoryResponseDetailEntity } from './entity/action-history-response-detail.entity';
import { ActionHistoryResponseListEntity } from './entity/action-history-response-list.entity';
@Injectable()
export class ActionHistoryRepository extends AbstractRepository<ActionHistoryDocument> {
	protected logger = new Logger(ActionHistoryRepository.name);

	constructor(
		@InjectModel(ActionHistory.name, ENUM_CONNECTION_NAME.PRIMARY)
		readonly primaryModel: Model<ActionHistoryDocument>,
		@InjectModel(ActionHistory.name, ENUM_CONNECTION_NAME.SECONDARY)
		readonly secondaryModel: Model<ActionHistoryDocument>,
	) {
		super({ primaryModel, secondaryModel });
	}

	async findAllByAggregate(
		query: ActionHistoryFilterQueryDto,
	): Promise<ActionHistoryResponseDetailEntity> {
		console.log(query);
		const [{ data, meta }] = await this.secondaryModel.aggregate(
			[
				this.stageFilterQuery(query),
				this.stageSearchQuery(query),
				this.stageFacetDataAndMeta(query),
			]
				.filter(Boolean)
				.flat(1),
		);

		return new ActionHistoryResponseListEntity({
			data,
			meta,
		}) as ActionHistoryResponseDetailEntity;
	}

	stageFilterQuery(query: ActionHistoryFilterQueryDto) {
		const filterQueryResult: Partial<ActionHistoryFilterQueryDto> = {};

		if (query.created_by_user)
			filterQueryResult.created_by_user = utils.toObjectID(
				query.created_by_user,
			);

		MongoDBHelper.AggregateFilterQueryDateTime(
			filterQueryResult,
			query.from_date,
			query.to_date,
			'created_at',
		);

		return lodash.isEmpty(filterQueryResult)
			? null
			: { $match: filterQueryResult };
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
					description: {
						$regex: new RegExp(query.q, 'gi'),
					},
				},
			},
		];
	}

	stageFacetDataAndMeta(
		query: ActionHistoryFilterQueryDto,
	): PipelineStage.Facet {
		const { page, skip, limit } = utils.getPageSkipLimit(query);
		return {
			$facet: {
				data: [
					{
						$sort: {
							created_at: -1,
						},
					},
					{
						$skip: skip,
					},
					{
						$limit: limit,
					},
					{
						$project: {
							description: 1,
							created_at: 1,
							updated_at: 1,
							created_by_user: 1,
							created_by_user_info: 1,
						},
					},
				],
				meta: MongoDBHelper.getMetadataAggregate(page, limit),
			},
		};
	}
}
