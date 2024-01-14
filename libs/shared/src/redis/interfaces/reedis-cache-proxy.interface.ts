export interface IRedisCacheProxy {
	getDataByKeys(...keys: string[]): any;
	getByKey(key: string): any;
	getKeysList(): string[];
	save(key: string, value: any): void;
	deleteOne(key): void;
	deleteMany(key): void;
	stream(): void;
	addKeys(keys: string): void;
}
