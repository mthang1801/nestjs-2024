import { RedisCommandArgument } from '@redis/client/dist/lib/commands';

export namespace RedisNS {
	export type UseCacheOptions = {
		ttl?: number; //by second
		prefixKey?: string;
	};
	export type MakeCacheKey = {
		path: string;
		query?: any;
		params?: any;
	};
	export type ExpireTime = 'SECOND' | 'MILLISECONDS';
	export type ExpireMode = 'NX' | 'XX' | 'GT' | 'LT';
	export type ScanResponse = {
		cursor: number;
		keys: string[];
	};

	export type HScanTuple = {
		field: RedisCommandArgument;
		value: RedisCommandArgument;
	};

	export type HScanReply = {
		cursor: number;
		tuples: Array<HScanTuple>;
	};

	export type HScanResponse = {
		cursor: number;
		data: Record<string, any>;
	};
}
