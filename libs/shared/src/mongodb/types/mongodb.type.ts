import { PipelineStage, Types } from 'mongoose';

export namespace MongoDB {
	export type AggregateOperator =
		| '$eq'
		| '$in'
		| '$lt'
		| '$lte'
		| '$gt'
		| '$gte';
	export type Config = {
		host: string;
		port: string | number;
		username?: string;
		password?: string;
		database: string;
	};
	export type MongoId = Types.ObjectId | string;
	export type LookupOneToOne = {
		from: string;
		let?: Record<string, string> | any;
		localField: string;
		project?: any;
		foreignField?: string;
		extraPipelineStage?: Exclude<
			PipelineStage,
			PipelineStage.Merge | PipelineStage.Out
		>[];
		condition?: PipelineStage.Match | any;
		alias?: string;
	};
	export type LookupOneToMany = {
		from: string;
		let?: Record<string, string> | any;
		localField: string;
		project?: any;
		foreignField?: string;
		extraPipelineStage?: Exclude<
			PipelineStage,
			PipelineStage.Merge | PipelineStage.Out
		>[];
		$matchOperator?: AggregateOperator;
		as?: string;
		condition?: PipelineStage.Match | any;
	};
	export type LookupRecursion = {
		from?: string;
		localField?: string;
		foreignField?: string;
		alias?: string;
		searchFilterQuery?: Record<string, any>;
		pipeline?: any;
		currentLevel?: number;
		maxDepthLevel?: number;
		sort?: any;
		unset?: string[];
		project?: any;
	};
	export type RecursionPipelineTempalte = {
		from: string;
		localField: string;
		foreignField: string;
		alias: string;
		unset?: string[];
		project?: string[];
	};
	export type Metadata = {
		perPage: number;
		currentPage: number;
		totalItems: number;
		totalPages: number;
	};
}
