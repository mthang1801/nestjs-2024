import {
	ENUM_HASH_CODE_ALGORITHM,
	ENUM_UNIT_TIMESTAMP,
	ENUM_WEEK_DAY,
} from '../../constants/enum';

export type HashCodeAlgorithm = keyof typeof ENUM_HASH_CODE_ALGORITHM;
export type Weekday = keyof typeof ENUM_WEEK_DAY;
export type UnitTimestamp = keyof typeof ENUM_UNIT_TIMESTAMP;

export type GenerateRandomCode = {
	str: string;
	prefix?: string;
	suffix?: string;
	algorithm?: HashCodeAlgorithm;
	delimiter?: string;
};

export type DataType =
	| 'string'
	| 'number'
	| 'array'
	| 'object'
	| 'symbol'
	| 'bigint'
	| 'undefined'
	| 'null'
	| 'boolean';

/**
 * ref https://developer.apple.com/documentation/foundation/numberformatter/style
 */
export type FormatConcurrency = {
	value: any;
	locales?: string;
	fractionDegits?: number;
	style?: 'currency' | 'unit' | 'decimal' | 'percent';
	currency?: string;
	unit?: string;
};

export type ReadOnly<T> = {
	+readonly [K in keyof T]: T[K];
};

export type Setters<T> = {
	[K in keyof T & string as `set${Capitalize<K>}`]: (value: T[K]) => void;
};

export type Getters<T> = {
	[K in keyof T & string as `get${Capitalize<K>}`]: () => T[K];
};

export type Mapped<T> = {
	readonly [K in keyof T]+?: T[K];
};

export type Pick<T, P extends T> = {
	[K in keyof P]: P[K];
};

export type DeepReadonly<T> = {
	readonly [K in keyof T]: DeepReadonly<T[K]>;
};

// eslint-disable-next-line @typescript-eslint/ban-types
declare type ClassDecorator = <TFunction extends Function>(
	target: TFunction,
) => TFunction | void;
