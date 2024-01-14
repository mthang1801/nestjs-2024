import { User } from '@app/common';
import { CommonConfig } from '@app/shared/config';
import { ENUM_ACTION_TYPE } from '@app/shared/constants/enum';
import { NextFunction, Request, Response } from 'express';
import {
	Model,
	SchemaType as MongooseSchemaType,
	PipelineStage,
	QueryOptions,
	Types,
} from 'mongoose';

export namespace AbstractType {
	export type AggregationLookup = {
		from: string;
		as?: string;
		localField?: string;
		foreignField?: string;
		let?: Record<string, any>;
		pipeline?: Exclude<
			PipelineStage,
			PipelineStage.Merge | PipelineStage.Out
		>[];
		projection?: any;
	};
	export type Metadata = {
		perPage: number;
		currentPage: number;
		totalItems: number;
		totalPages: number;
	};
	export type FindAllResponse<T> = {
		items?: T[];
		count: number;
	};
	export type SaveInfoPayload = {
		id: string;
		modelName: string;
	};
	export type SaveOtherSchemaInfoPayload<T extends any> = {
		payload: T;
		modelName: string;
	};
	export type SaveOtherSchemaInfoUpdateManyPayload<T extends any> = {
		filterQuery: T;
		modelName: string;
	};
	export type ResponseDataAndMetadata<T extends any> = {
		data?: T[];
		metadata?: Metadata;
	};
	export type ModelInfo = {
		modelName: string;
		collectionName: string;
		schema?: any;
	};
	export type UpdateResponse = {
		acknowledged?: boolean;
		modifiedCount?: number;
		upsertedId?: any;
		upsertedCount?: number;
		matchedCount?: number;
	};
	export type FindAndCountAllResponse<T> = {
		items: T[];
		count: number;
	};
	export type ExpressContext = Request & Response & NextFunction;
	export type InitAbstractRepository<T> = {
		primaryModel: Model<T>;
		secondaryModel: Model<T>;
	};
	export type ActionType = keyof typeof ENUM_ACTION_TYPE;
	export type HanddleLoggingAction<T extends any | any[]> = {
		newData?: T;
		oldData?: T;
		extraData?: any;
		actionType: ActionType;
	};
	export type EnableSaveAction = {
		enableSaveAction?: boolean;
	};
	type DeleteType = {
		softDelete?: boolean;
	};
	export type UpdateOnlyOne = {
		updateOnlyOne?: boolean;
	};
	export type FindIncludeSoftDelete = {
		includeSoftDelete?: boolean;
	};
	export type DeleteBy = {
		deleted_by_user?: string | User;
	};
	export type EnablePopulateAll = {
		populateAll?: boolean;
	};
	export type FindOptions<T> = QueryOptions<T> &
		FindIncludeSoftDelete &
		EnablePopulateAll;
	export type UpdateOption<T> = QueryOptions<T> & EnableSaveAction;
	export type DeleteOption<T> = QueryOptions<T> &
		EnableSaveAction &
		DeleteType &
		DeleteBy;
	export type ObjectId = string | Types.ObjectId | any;
	export type SchemaType = { [key: string]: MongooseSchemaType };
	export type SortType = 'ASC' | 'DESC';
}
