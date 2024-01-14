import { Injectable } from '@nestjs/common';
import { RedisCommandArgument } from '@redis/client/dist/lib/commands';
import * as lodash from 'lodash';
import { RedisNS, utils } from '..';
import { typeOf } from '../utils/function.utils';
@Injectable()
export class LibRedisUtil {
	constructor() {}

	setValue(value: RedisCommandArgument | number | any): string {
		return JSON.stringify(value);
	}

	getValue(value: string): string | number | object {
		return utils.parseData(value);
	}

	mSetValue(
		mData: Array<Record<string, any>> | Record<string, any>,
	): Array<string> {
		if (typeOf(mData) === 'array') {
			const mDataConvert = mData.map((item) => {
				const [key] = lodash.keys(item);
				const value = utils.parseData(item[key]);
				return { [key]: value };
			});

			return mDataConvert.flatMap(Object.entries).flat(1);
		}
		return Object.entries(mData).reduce((result, [key, val]: [string, any]) => {
			result.push(key);
			result.push(JSON.stringify(val));
			return result;
		}, []);
	}

	responseMGetData(keys: string[], data: any[]): Record<string, any> {
		return data.reduce(
			(result: Record<string, any>, curValue: any, curIdx: number) => {
				result[keys[curIdx]] = utils.parseData(curValue);
				return result;
			},
			{},
		);
	}

	formatHsetData(data) {
		return Object.entries(data).reduce((res, [key, val]: [string, any]) => {
			res[key] = utils.parseData(val);
			return res;
		}, {});
	}

	hSetNotExists(value: any) {
		return utils.isJsonString(value) ? value : JSON.stringify(value);
	}

	hmGetValues(fields: string[], data: string[]) {
		return data.reduce(
			(result: Record<string, any>, curValue: any, curIdx: number) => {
				result[fields[curIdx]] = utils.isJsonString(curValue)
					? JSON.parse(curValue)
					: curValue;
				return result;
			},
			{},
		);
	}

	hGetAllValues(data) {
		return Object.entries(data).reduce((res, [key, val]: [string, any]) => {
			res[key] = utils.parseData(val);
			return res;
		}, {});
	}

	hVals(valueList: string[]) {
		return valueList.map((valueItem) => utils.parseData(valueItem));
	}

	hScan(data: RedisNS.HScanReply): RedisNS.HScanResponse {
		const { cursor, tuples } = data;
		const convertTuplesToObject = tuples.reduce(
			(res, { field, value }: { field: string; value: any }) => {
				res[utils.parseData(field)] = utils.parseData(value);
				return res;
			},
			{},
		);

		return {
			cursor,
			data: convertTuplesToObject,
		};
	}

	stringifyElementList(elements: any[]): string[] {
		return elements.filter(Boolean).map((element) => JSON.stringify(element));
	}

	parseElementList(elements: string[]) {
		return elements.map((element) => utils.parseData(element));
	}
}
