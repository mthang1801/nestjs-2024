import { utils } from '@app/shared';
import { ENUM_STATUS } from '@app/shared/constants';
import { getMetadataAggregate, isValidMongoId } from '@app/shared/mongodb';
import { MongoDB } from '@app/shared/mongodb/types/mongodb.type';
import {
	checkValidTimestamp,
	endOfDay,
	startOfDay,
} from '@app/shared/utils/dates.utils';
import {
	convertSortStringToNumber,
	getPageSkipLimit,
	isEmptyValue,
	typeOf,
} from '@app/shared/utils/function.utils';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
import * as lodash from 'lodash';
import { Expression, FilterQuery, PipelineStage, QueryOptions } from 'mongoose';
import { AbstractType } from '../types/abstract.type';

export class AbstractFilterQueryDto {
	private default_sort_field = 'updated_at';
	private default_sort_type: AbstractType.SortType = 'DESC';
	private default_date_field: string = 'updated_at';

	constructor(properties?: Partial<AbstractFilterQueryDto>) {
		if (lodash.isEmpty(properties)) return;
		Object.entries(properties).forEach(([key, val]) => {
			this[key] = val;
		});

		if (properties?.sort_by && properties?.sort_type) {
			this.setSortFields = {
				[properties.sort_by]: convertSortStringToNumber(properties.sort_type),
			};
		}
	}
	@IsOptional()
	@Exclude()
	public searchFieldsList: string[] = ['code', 'name'];

	@IsOptional()
	@ApiPropertyOptional({ type: String })
	sort_type: AbstractType.SortType;

	@IsOptional()
	@ApiPropertyOptional({ type: String })
	sort_by: string;

	@IsOptional()
	public sortFieldsDict: Record<string, 1 | -1> = {
		[this.default_sort_field]: convertSortStringToNumber(
			this.default_sort_type,
		),
	};

	@IsOptional()
	@Exclude()
	public projectFields: Record<string, 1 | 0 | Expression.Meta> = {};

	@IsOptional()
	@Exclude()
	public addFieldList: Record<string, 1 | 0 | Expression.Meta> = {};

	@IsOptional()
	readonly name?: string;

	@IsOptional()
	readonly code?: string;

	@IsOptional()
	@ApiPropertyOptional({ type: Number, example: 1 })
	page?: number = 1;

	@IsOptional()
	@ApiPropertyOptional({ type: Number, example: 20 })
	limit?: number = 20;

	@IsOptional()
	@ApiPropertyOptional()
	skip?: number = (this.page - 1) * this.limit;

	@IsOptional()
	@Transform(({ value }) => value && startOfDay(value))
	@ApiPropertyOptional({ example: '2023-09-01' })
	from_date?: Date;

	@IsOptional()
	@Transform(({ value }) => value && endOfDay(value))
	@ApiPropertyOptional({ example: '2023-09-01' })
	to_date?: Date;

	@IsOptional()
	@ApiPropertyOptional({ enum: ENUM_STATUS, example: ENUM_STATUS.ACTIVE })
	status?: string;

	@IsOptional()
	@IsString()
	@ApiPropertyOptional({ example: 'John Doe' })
	@Transform(({ value }) => value.replace(/\\$/, ''))
	q?: string;

	@IsOptional()
	@ApiPropertyOptional({ type: String, example: '64f752075dd853fa9549edbf' })
	@Transform(({ value }) => value && utils.toObjectID(value))
	created_by_user?: string = null;

	@IsOptional()
	@ApiPropertyOptional({ type: String, example: '64f752075dd853fa9549edbf' })
	@Transform(({ value }) => value && utils.toObjectID(value))
	updated_by_user?: string = null;

	@IsOptional()
	@ApiPropertyOptional({ type: String, example: '64f752075dd853fa9549edbf' })
	@Transform(({ value }) => value && utils.toObjectID(value))
	deleted_by_user?: string = null;

	@IsOptional()
	@ApiPropertyOptional({
		type: String,
		example: {
			_id: '64f752075dd853fa9549edbf',
			name: 'John Doe',
			code: 'USR1123619',
		},
	})
	created_by_user_info?: any = null;

	@IsOptional()
	@ApiPropertyOptional({
		type: String,
		example: {
			_id: '64f752075dd853fa9549edbf',
			name: 'John Doe',
			code: 'USR1123619',
		},
	})
	updated_by_user_info?: any = null;

	@IsOptional()
	@ApiPropertyOptional({
		type: String,
		example: {
			_id: '64f752075dd853fa9549edbf',
			name: 'John Doe',
			code: 'USR1123619',
		},
	})
	deleted_by_user_info?: any = null;

	@IsOptional()
	@Transform(({ value }) => value?.toLowerCase() === 'true')
	@ApiPropertyOptional({ type: Boolean, example: false })
	include_soft_delete = false;

	@IsOptional()
	@ApiPropertyOptional({
		type: Boolean,
		example: true,
		description: 'Cho phép người dùng khác được thấy',
	})
	@Transform(({ value }) => value?.toLowerCase() === 'true')
	allow_show_for_all: boolean = true;

	@IsOptional()
	private extra_properties: QueryOptions = null;

	@IsOptional()
	private fixedExcludedFieldList: string[] = [
		'default_sort_field',
		'default_sort_type',
		'default_date_field',
		'searchFieldsList',
		'sortFieldsDict',
		'projectFields',
		'fixedExcludedFieldList',
		'addFieldList',
		'allow_show_for_all',
		'include_soft_delete',
		'sort_by',
		'sort_type',
		'keyOperatorMapper',
		'filterQueryFields',
		'created_by_user_info',
		'updated_by_user_info',
		'deleted_by_user_info',
		'sort',
		'extra_properties',
		'logger',
		'setSortDefault',
	];

	@IsOptional()
	public keyOperatorMapper: Record<string, any> = {};

	get FilterQuery(): FilterQuery<any> {
		return this.mappingFilterQueryMatch();
	}

	get SearchQuery(): FilterQuery<any> {
		return this.mappingSearchQueryMatch();
	}

	get SearchFilterQuery(): Record<string, any> {
		return {
			$and: [this.FilterQuery, this.SearchQuery, this.extra_properties].filter(
				(item) => !lodash.isEmpty(item),
			),
		};
	}

	get AggregateFilterQuery(): PipelineStage.Match {
		return { $match: this.mappingFilterQueryMatch() };
	}

	AggregateFilterQueryAlias(alias: string = ''): PipelineStage.Match {
		return { $match: this.mappingFilterQueryMatch(alias) };
	}

	get AggregateSearchQuery(): PipelineStage.Match {
		return { $match: this.mappingSearchQueryMatch() };
	}

	AggregateSearchQueryAlias(alias: string = ''): PipelineStage.Match {
		return { $match: this.mappingSearchQueryMatch(alias) };
	}

	get PageSkipLimitOptions() {
		const { page, skip, limit } = getPageSkipLimit(this);
		this.page = page;
		this.skip = skip;
		this.limit = limit;
		return { page, skip, limit };
	}

	get FacetResponseResultAndMetadata(): Array<
		PipelineStage.Facet | PipelineStage.Set
	> {
		const { page, limit, skip } = getPageSkipLimit(this);
		return [
			{
				$facet: {
					data: [
						{
							$sort: this.sortFieldsDict,
						},
						{
							$skip: skip,
						},
						{
							$limit: limit,
						},
						lodash.isEmpty(this.addFieldList)
							? null
							: {
									$addFields: this.addFieldList,
							  },
						lodash.isEmpty(this.projectFields)
							? null
							: {
									$project: this.projectFields,
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
		];
	}

	private mappingFilterQueryMatch(alias: string = '') {
		return Object.entries(this).reduce((queryFilter, [fieldName, val]) => {
			fieldName = this.mappingFieldName(fieldName);

			if (this.isValidField(fieldName, val)) {
				this.generateMongoKeyValueForFilterQuery(
					queryFilter,
					fieldName,
					val,
					alias,
				);
				return queryFilter;
			}
			return this.handleInValidField(fieldName, val, queryFilter);
		}, {});
	}

	private handleInValidField(fieldName, val, queryFilter: any) {
		if (fieldName === 'include_soft_delete') {
			if (val) delete queryFilter.deleted_at;
			else queryFilter.deleted_at = null;
		}
		return queryFilter;
	}

	private generateMongoKeyValueForFilterQuery(
		queryFilter,
		fieldName,
		val,
		alias: string = '',
	): void {
		const { prefixKey, originalKey } =
			this.analyzePrefixAndOriginalKey(fieldName);
		const filterKey = [alias, originalKey].filter(Boolean).join('.');
		const formatValue = this.formatMongoValue(fieldName, val);

		if (this.isOriginalKeyInKeyOperatorMapper(originalKey)) {
			queryFilter[filterKey] = {
				...queryFilter[filterKey],
				[this.keyOperatorMapper[originalKey]]: val,
			};
			return;
		}
		switch (prefixKey) {
			case 'from':
				queryFilter[filterKey] = {
					...queryFilter[originalKey],
					$gte: formatValue,
				};
				return;
			case 'to':
				queryFilter[filterKey] = {
					...queryFilter[originalKey],
					$lte: formatValue,
				};
				return;
			case 'in':
				queryFilter[filterKey] = { $in: formatValue };
				return;
			case 'all':
				queryFilter[filterKey] = { $all: formatValue };
				return;
			case 'elemMatch':
				const elemMatchValue = this.setValueForElemMatchOperator(formatValue);
				queryFilter[filterKey] = { $elemMatch: elemMatchValue };
				return;
			default:
				queryFilter[filterKey] = formatValue;
		}
	}

	isOriginalKeyInKeyOperatorMapper(key: string) {
		return lodash.has(this.keyOperatorMapper, key);
	}

	private analyzePrefixAndOriginalKey(fieldName: string) {
		const prefixKey: string = fieldName.split('_').at(0);

		const originalKey = fieldName
			.split('_')
			.filter(
				(item) => !['from', 'to', 'in', 'all', 'elemMatch'].includes(item),
			)
			.join('_');

		return { prefixKey, originalKey };
	}

	protected formatMongoValue(fieldName: string, value: any) {
		if ([null, undefined].includes(value)) return null;

		if (fieldName === 'deleted_at')
			return value === true ? { $exists: true } : null;

		if (checkValidTimestamp(value) && value instanceof Date)
			return new Date(value);

		if (typeOf(value) === 'boolean') return !!value;

		if (!isNaN(Number(value)) && typeOf(value) !== 'string')
			return Number(value);

		if (isValidMongoId(value)) return utils.toObjectID(value);

		return value;
	}

	protected setValueForElemMatchOperator(value: string): any {
		return value;
	}

	private mappingSearchQueryMatch(alias: string = '') {
		const searchKeyword = this.q;
		if (!searchKeyword) return {};
		const searchKey = (fieldName) =>
			[alias, fieldName].filter(Boolean).join('.');
		return {
			$or: this.searchFieldsList.map((fieldName) => ({
				[searchKey(fieldName)]: new RegExp(searchKeyword.trim(), 'i'),
			})),
		};
	}

	protected mappingFieldName(fieldName: string) {
		const filterNameResult: any = {
			...this.filterQueryFields,
			[fieldName]: fieldName,
		};

		if (this.allow_show_for_all) {
			delete filterNameResult.created_by_user;
			delete filterNameResult.updated_by_user;
			delete filterNameResult.deleted_by_user;
		}

		return filterNameResult[fieldName];
	}

	protected filterQueryFields = {
		from_date: `from_${this.default_date_field}`,
		to_date: `to_${this.default_date_field}`,
	};

	protected setFilterQueryFields(field: Record<string, any>) {
		this.filterQueryFields = {
			...this.filterQueryFields,
			...field,
		};
	}

	protected set setSearchFields(values: string[]) {
		this.searchFieldsList = values;
	}

	protected set setSortFields(values: Record<string, 1 | -1>) {
		this.sortFieldsDict = values;
	}

	protected set setExcludedFields(values: string[]) {
		this.fixedExcludedFieldList = [
			...new Set(this.fixedExcludedFieldList.concat(values)),
		];
	}

	protected set setProjectFields(values: Record<string, any>) {
		this.projectFields = values;
	}

	protected set addFields(values: Record<string, any>) {
		this.addFieldList = values;
	}

	protected isPagingField(fieldName: string) {
		return ['page', 'limit', 'skip'].includes(fieldName);
	}

	protected isExcludedFields(fieldName: string) {
		return this.fixedExcludedFieldList.includes(fieldName);
	}

	protected isSearchField(fieldName: string) {
		return ['q', ...this.searchFieldsList].includes(fieldName);
	}

	isValidField(fieldName, value) {
		return (
			fieldName &&
			!this.isPagingField(fieldName) &&
			!this.isSearchField(fieldName) &&
			!this.isExcludedFields(fieldName) &&
			!isEmptyValue(value, fieldName, ['deleted_at'])
		);
	}

	set setOperatorForProperties(
		payload: Record<string, MongoDB.AggregateOperator | any>,
	) {
		console.log('*************** setOperatorForProperties ****************');
		this.keyOperatorMapper = payload;
	}

	set DateFieldDefault(fieldName: string) {
		this.default_date_field = fieldName;
	}

	set setExtraProperties(payload: QueryOptions) {
		if (payload) {
			this.extra_properties = payload;
			this.fixedExcludedFieldList.push(...Object.keys(payload));
		}
	}

	set setSortDefault(values: Record<string, 1 | -1>) {
		console.log('*************** setSortDefault ****************');
		if (this.sort_by && this.sort_type) return;
		this.setSortFields = values;
	}

	get sort() {
		return this.sortFieldsDict;
	}

  get FindAndCountAllOptions() {
    return {
      sort : this.sort, 
      ...this.PageSkipLimitOptions
    }
  }
}
