import { dates, utils } from '@app/shared/utils';
import * as lodash from 'lodash';
import { PipelineStage } from 'mongoose';
import { MongoDB } from '../types/mongodb.type';

export const $missingTypes = [{}, [], null, undefined];
export const $getMetadataAggregate = (
	currentPage: number,
	limit: number,
	$totalItems: any,
) =>
	({
		perPage: Number(limit),
		currentPage: Number(currentPage),
		totalItems: $totalItems,
		totalPages: {
			$cond: [
				{ $eq: [{ $mod: [$totalItems, limit] }, 0] },
				{ $divide: [$totalItems, limit] },
				{ $ceil: { $divide: [$totalItems, limit] } },
			],
		} as any,
	} satisfies MongoDB.Metadata);

export const LookupOneToOne = ({
	from,
	localField,
	project,
	extraPipelineStage = [],
	foreignField = '_id',
	alias = undefined,
	condition = undefined,
}: MongoDB.LookupOneToOne): Array<PipelineStage.Lookup | PipelineStage.Set> => {
	localField = replaceStartWithDollarSign(localField);
	foreignField = replaceStartWithDollarSign(foreignField);
	const $alias = alias ?? localField;
	return [
		{
			$lookup: {
				from,
				let: { refId: `$${localField}` },
				pipeline: [
					{
						$match: {
							$expr: {
								$eq: ['$$refId', `$${foreignField}`],
							},
						},
					},
					...extraPipelineStage,
					project && { $project: project },
				].filter(Boolean),
				as: $alias,
			},
		},
		{
			$set: {
				[$alias]: {
					$ifNull: [{ $first: `$${$alias}` }, null],
				},
			},
		},
	];
};

const replaceStartWithDollarSign = (field: string) =>
	field.startsWith('$') ? field.slice(1) : field;

const toArray = ($fields: string) => ({
	$cond: [
		{ $isArray: [_fillDollarSign($fields)] },
		_fillDollarSign,
		[_fillDollarSign],
	],
});

export const LookupOneToMany = ({
	from,
	localField,
	project,
	extraPipelineStage = [],
	foreignField = '_id',
	$matchOperator = '$eq',
	as = undefined,
}: MongoDB.LookupOneToMany): PipelineStage[] => {
	const $localField = _fillDollarSign(localField);
	const $foreignField = _fillDollarSign(foreignField);
	const alias = as ?? localField;

	return [
		{
			$lookup: {
				from,
				let: { refId: $localField },
				pipeline: [
					{
						$match: {
							$expr: {
								[$matchOperator]: ['$$refId', $foreignField],
							},
						},
					},
					...extraPipelineStage,
					project && { $project: project },
				].filter(Boolean),
				as: alias,
			},
		},
	];
};

/**
 *
 * @param param0
 * @returns
 */
export const LookupRecursion = ({
	from,
	localField,
	foreignField,
	alias = undefined,
	currentLevel = 0,
	maxDepthLevel = 4,
	pipeline = undefined,
	searchFilterQuery = [],
	sort,
	project,
}: MongoDB.LookupRecursion): PipelineStage.Lookup => {
	console.log('********* LookupRecursion *************');
	console.log(sort);
	const $localField = _fillDollarSign(localField);
	const $foreignField = _fillDollarSign(foreignField);
	const $alias = alias ?? from;

	const matchAfterLookupAndSortRecursion = [
		{
			$match: matchAfterLookupRecursion(searchFilterQuery),
		},
		{
			$sort: sort,
		},
		project && { $project: { ...project, [$alias]: 1 } },
	].filter(Boolean);

	if (currentLevel >= maxDepthLevel) {
		if (maxDepthLevel > 0) {
			pipeline.$lookup.pipeline.push(...matchAfterLookupAndSortRecursion);
		}
		return pipeline;
	}

	//TODO: Tạo sẵn template lookup
	const pipelineTetmplate = {
		$lookup: {
			from,
			let: { refId: $localField },
			pipeline: [
				{
					$match: {
						$expr: {
							$and: [
								{
									$eq: ['$$refId', $foreignField],
								},
							],
						},
					},
				},
				project && { $project: { ...project, [$alias]: 1 } },
			].filter(Boolean),
			as: $alias,
		},
	};

	if (maxDepthLevel === 0) {
		return pipelineTetmplate;
	}

	if (pipeline) {
		pipeline.$lookup.pipeline.push(pipelineTetmplate);

		if (!lodash.isEmpty(searchFilterQuery)) {
			pipeline.$lookup.pipeline.push(...matchAfterLookupAndSortRecursion);
		}

		if (currentLevel < maxDepthLevel)
			LookupRecursion({
				from,
				localField,
				foreignField,
				currentLevel: currentLevel + 1,
				maxDepthLevel,
				pipeline:
					pipeline.$lookup.pipeline[
						pipeline.$lookup.pipeline.findIndex((item) =>
							lodash.has(item, '$lookup'),
						)
					],
				searchFilterQuery,
				alias: $alias,
				sort,
				project,
			});
	} else {
		pipeline = pipelineTetmplate;

		//NOTE: Need to tracking
		// if (maxDepthLevel === 1) {
		// 	pipeline.$lookup.pipeline.push(...matchAfterLookupAndSortRecursion);
		// }

		if (currentLevel < maxDepthLevel)
			LookupRecursion({
				from,
				localField,
				foreignField,
				currentLevel: currentLevel + 1,
				maxDepthLevel,
				pipeline,
				searchFilterQuery,
				alias: $alias,
				sort,
				project,
			});
	}

	return pipeline;
};

export const matchAfterLookupRecursion = (
	searchFilterQuery: Record<string, any>,
) => {
	return {
		$or: [
			{
				children: { $nin: $missingTypes },
			},
			{
				$and: Object.entries(searchFilterQuery).reduce(
					(acc: any, [key, val]: [string, any]) => {
						acc.push({ [key]: val });
						return acc;
					},
					[],
				),
			},
		],
	};
};

/**
 *
 * @param page
 * @param limit
 * @returns {MongoDB.Metadata}
 */
export const getMetadataAggregate = (page, limit): any[] => {
	return [
		{
			$count: 'count',
		},
		{
			$addFields: $getMetadataAggregate(page, limit, '$count'),
		},
		{
			$unset: ['count'],
		},
	];
};

export const mongoIdPattern = /^[a-f\d]{24}$/i;

export const isValidMongoId = (id: any) => mongoIdPattern.test(id);

export const AggregateFilterQueryDateTime = (
	filterQuery: any,
	fromDate: Date,
	toDate: Date,
	field: string,
) => {
	filterQuery[field] = undefined;
	if (fromDate) filterQuery[field] = { $gte: fromDate };

	if (toDate) filterQuery[field] = { ...filterQuery[field], $lte: toDate };

	if (!filterQuery[field]) delete filterQuery[field];

	return filterQuery;
};

export const $IfNullThen = ($field: string, defaultValue: any = 0) => ({
	$ifNull: [_fillDollarSign($field), defaultValue],
});

export const $round = ($field: string, decimal: number = 2) => ({
	$round: [_fillDollarSign($field), decimal],
});

export const $size = ($field: string) => ({
	$size: $IfNullThen(_fillDollarSign($field), []),
});

export const $divide = ($numerator: string, $denominator: string) => ({
	$divide: [
		$IfNullThen(_fillDollarSign($numerator), 0),
		$IfNullThen(_fillDollarSign($denominator), 1),
	],
});

export const $multiply = (...$factors: any[]) => ({
	$multiply: [...$factors.flat(1).map(($factor) => _fillDollarSign($factor))],
});

export const filterBetweenDate = (
	from_date = dates.startOfDay(),
	to_date = dates.endOfDay(),
) => {
	return {
		$gte: from_date,
		$lte: to_date,
	};
};

export const _fillDollarSign = ($field: string | `$${string}`): `$${string}` =>
	$field.startsWith('$') ? ($field as `$${string}`) : `$${$field}`;

export const $flattenArrayTwoDimention = ($arrayField: string) => ({
	$addFields: {
		[$arrayField]: {
			$reduce: {
				input: _fillDollarSign($arrayField),
				initialValue: [],
				in: {
					$concatArrays: ['$$value', '$$this'],
				},
			},
		},
	},
});

export const $uniqBy = ($arrayField: string, $uniqueField?: string) => ({
	$addFields: {
		[$arrayField]: {
			$reduce: {
				input: _fillDollarSign($arrayField),
				initialValue: [],
				in: {
					$concatArrays: [
						'$$value',
						{
							$cond: [
								{
									$in: [
										utils.joinString(['$$this', $uniqueField], '.'),
										utils.joinString(['$$value', $uniqueField]),
									],
								},
								[],
								['$$this'],
							],
						},
					],
				},
			},
		},
	},
});
