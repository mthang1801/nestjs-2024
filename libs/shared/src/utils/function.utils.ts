import * as bcrypt from 'bcryptjs';
import * as fsExtra from 'fs-extra';
import * as lodash from 'lodash';
import mongoose from 'mongoose';
import { AbstractType } from '../abstract/types/abstract.type';
import { CommonConfig } from '../config/common.config';
import { Cryptography } from './cryptography.utils';
import { checkValidTimestamp } from './dates.utils';
import { DataType, FormatConcurrency, GenerateRandomCode } from './types';
import { isValidMongoId } from '../mongodb/helper/mongodb.helper';

export const ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
export const INTEGERS = '0123456789';
export const SPECIAL_CHARACTERS = `!!"#$%&'()*+,-./:;<=>?@[\]^_\`{|}~`;

export const typeOf = (value: any): DataType =>
	Object.prototype.toString.call(value).slice(8, -1).toLowerCase();

export const getPageSkipLimit = (
	params: any,
): {
	page: number;
	skip: number;
	limit: number;
} => {
	const page = Number(params.page) || 1;
	const limit = Math.min(params.limit || 20, Number.MAX_SAFE_INTEGER);
	const skip = (page - 1) * limit;
	return { page, skip, limit };
};

export const recursivelyStripNullValues = (value: unknown): unknown => {
	if (Array.isArray(value)) {
		return value.map(recursivelyStripNullValues);
	}

	if (value instanceof Date) {
		return value;
	}

	if (value !== null && typeof value === 'object') {
		return Object.fromEntries(
			Object.entries(value).map(([key, value]) => [
				key,
				recursivelyStripNullValues(value),
			]),
		);
	}

	if (value !== null) {
		return value;
	}
};

export const debounce = (milliseconds = 3000) =>
	new Promise((resolve, reject) => {
		setTimeout(() => {
			resolve(true);
		}, milliseconds);
	});

export const hashedString = async (str: string) => bcrypt.hash(str, 10);

export const compareHashedString = async (str: string, hashedStr: string) =>
	bcrypt.compare(str, hashedStr);

export const genKeys = () => {
	const cryptography = new Cryptography();

	const publicKey = Cryptography.genPrivateKey();

	const { hashedData: secretKey, secretKey: privateKey } =
		cryptography.saltHashPassword(publicKey);

	return { publicKey, secretKey, privateKey };
};

export const has = (obj, property) => {
	const has = Object.prototype.hasOwnProperty;
	return has.call(obj, property);
};

/**
 * generate random integer number
 * @param {Number} numDigits
 * @returns {Number}
 */
export const generateRandomNumber = (numDigits = 6) =>
	Math.floor(
		Number(`10e${Math.max(numDigits - 2, 0)}`) +
			Math.random() * 9 * Number(`10e${Math.max(numDigits - 2, 0)}`),
	);

export const formatNumber = (num: number, fractionDegits: number = 2) => {
	return Number(
		new Intl.NumberFormat('vi-VN', {
			minimumFractionDigits: 0,
			maximumFractionDigits: fractionDegits,
			trailingZeroDisplay: 'stripIfInteger',
		} as any).format(num),
	);
};

export const formatStyleNumber = ({
	value,
	locales = 'vn-Vi',
	fractionDegits = 2,
	style,
	currency,
	unit,
}: FormatConcurrency) => {
	const formater = new Intl.NumberFormat(locales, {
		style: unit ? 'unit' : style,
		currency,
		unit,
		minimumFractionDigits: 0,
		maximumFractionDigits: fractionDegits,
		trailingZeroDisplay: 'stripIfInteger',
	} as any);
	return formater.format(value);
};

export const isEmptyValue = (
	value: any,
	currentField: string = null,
	excludedKey: string[] = [],
) => !excludedKey.includes(currentField) && [undefined].includes(value);

export const removeVietnameseTones = (str) => {
	str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
	str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
	str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
	str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
	str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
	str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
	str = str.replace(/đ/g, 'd');
	str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, 'A');
	str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, 'E');
	str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, 'I');
	str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, 'O');
	str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, 'U');
	str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, 'Y');
	str = str.replace(/Đ/g, 'D');
	// Some system encode vietnamese combining accent as individual utf-8 characters
	// Một vài bộ encode coi các dấu mũ, dấu chữ như một kí tự riêng biệt nên thêm hai dòng này
	str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ''); // ̀ ́ ̃ ̉ ̣  huyền, sắc, ngã, hỏi, nặng
	str = str.replace(/\u02C6|\u0306|\u031B/g, ''); // ˆ ̆ ̛  Â, Ê, Ă, Ơ, Ư
	// Remove extra spaces
	// Bỏ các khoảng trắng liền nhau
	str = str.replace(/ + /g, ' ');
	str = str.trim();
	// Remove punctuations
	// Bỏ dấu câu, kí tự đặc biệt
	str = str.replace(
		/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g,
		' ',
	);
	return str.toLowerCase();
};

export const convertSortStringToNumber = (sortType: AbstractType.SortType) =>
	sortType === 'DESC' ? -1 : 1;

export const convertValue = (value: any) => {
	if (checkValidTimestamp(value) && value instanceof Date)
		return new Date(value);
	if (['true', 'false'].includes(value)) return value === 'true';
	if (!isNaN(Number(value))) return Number(value);
	return value;
};

export const unravel = (obj, fieldName?: string) => {
	let out = [];
	let added = false;
	if (fieldName) {
		if (obj[fieldName] instanceof Array) {
			for (let j in obj[fieldName]) {
				let r = unravel(obj[fieldName][j]);
				for (let k in r) {
					let a = {};
					for (let key in obj) {
						// make copy of obj
						a[key] = obj[key];
					}
					a[fieldName] = r[k];
					added = true;
					out.push(a);
				}
			}
		}
	} else {
		for (let i in obj) {
			if (obj[i] instanceof Array) {
				for (let j in obj[i]) {
					let r = unravel(obj[i][j]);
					for (let k in r) {
						let a = {};
						for (let key in obj) {
							// make copy of obj
							a[key] = obj[key];
						}
						a[i] = r[k];
						added = true;
						out.push(a);
					}
				}
			}
		}
	}

	if (!added) {
		out.push(obj);
	}
	return out;
};

export const promiseAllList = async (list: any[]) => {
	const chunkList = lodash.chunk(list, CommonConfig.concurrently);
	for (const chunk of chunkList) {
		await Promise.allSettled(chunk);
	}
};

export const convertInfoData = (rawData: any) =>
	lodash.pick(rawData, CommonConfig.SAVE_INFO_FIELDS);

/**
 * Generate random code with suffix, prefix
 * @param {object} param
 * @returns {string}
 */
export const generateRandomCode = ({
	str,
	prefix,
	suffix,
	delimiter = '_',
}: GenerateRandomCode) => {
	return [prefix, Cryptography.hashFnv32a(str), suffix]
		.filter(Boolean)
		.join(delimiter);
};

export const generateRandomString = ({
	length = 8,
	hasNumbers = false,
	hasSymbols = false,
	excludeCharacters = '',
}) => {
	let chars = ALPHABET;
	if (hasNumbers) chars += INTEGERS;
	if (hasSymbols)
		chars += SPECIAL_CHARACTERS.split('')
			.filter((item) => !excludeCharacters.split('').includes(item))
			.join('');

	let randomString = '';
	for (let i = 0; i < length; i++) {
		randomString += chars.charAt(Math.floor(Math.random() * chars.length));
	}

	return randomString;
};

/**
 * Format number as currency
 * @param number
 * @param suffix
 * @param signal
 * @param locale
 * @returns
 */
export const formatNumberAsCurrency = (
	number: number,
	suffix = '',
	signal = ',',
	locale = 'vn-VI',
) => {
	return typeOf(number) === 'number'
		? `${Intl.NumberFormat(locale).format(number).toString()}${suffix}`
				.trim()
				.replace(/,/g, signal)
		: `${String(number)}${suffix}`;
};

export const distance = (lat1, lon1, lat2, lon2, unit) => {
	const radlat1 = (Math.PI * lat1) / 180;
	const radlat2 = (Math.PI * lat2) / 180;
	const theta = lon1 - lon2;
	const radtheta = (Math.PI * theta) / 180;
	let dist =
		Math.sin(radlat1) * Math.sin(radlat2) +
		Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
	if (dist > 1) {
		dist = 1;
	}
	dist = Math.acos(dist);
	dist = (dist * 180) / Math.PI;
	dist = dist * 60 * 1.1515;
	if (unit == 'K') {
		dist = dist * 1.609344;
	}
	if (unit == 'N') {
		dist = dist * 0.8684;
	}
	return dist;
};

export const validEmailPattern =
	/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export const validateEmail = (email: string) => validEmailPattern.test(email);

export const isJsonString = (value: any) => {
	try {
		JSON.parse(value);
	} catch (e) {
		return false;
	}
	return true;
};

export const parseData = (value: any) => {
	return isJsonString(value) ? JSON.parse(value) : value;
};

export const mergeArray = (
	initArr: any[],
	insertedArr: any[],
	index: number,
) => {
	const _initArr = [...initArr];
	return [
		...initArr.slice(0, index),
		...insertedArr,
		..._initArr.slice(index, initArr.length),
	];
};

/**
 * return : [ 'foo', 'bar', 'baz' ]
 * @param {object} obj
 * @returns {string[]}
 * @example const arrLike = { 0: 'foo', 1: 'bar', 2: 'baz', length: 3 };
 */
export const convertObjectLikeArray = (obj: any) => {
	return Array.from(obj);
};

/**
 * Masking characters
 * @param {string} str
 * @param {number} showNumberLastChars
 * @returns {strring}
 */
export const maskedCharacters = (
	str: string,
	showNumberLastChars: number = Math.ceil(str.length * 0.5),
) => {
	const lastNumberOfCharacters = str.slice(-showNumberLastChars);
	const maskedCharacter = lastNumberOfCharacters.padStart(str.length, '*');
	return maskedCharacter;
};

export const getFileSize = (path: string) => {
	const file = fsExtra.statSync(path);
	return file.size;
};

export const filterEmptyObject = (obj: object, valuesAsEmpty = [undefined]) => {
	if (typeOf(obj) !== 'object') return obj;
	return Object.entries(obj).reduce((result, [key, val]) => {
		if (valuesAsEmpty.includes(val)) {
			result[key] = val;
		}
		return result;
	}, {});
};

export const toObjectID = (id: any) => {
	try {
		return new mongoose.Types.ObjectId(id);
	} catch (error) {
		return id;
	}
};

export const toNumber = (value: any, fractionDegits = 2): number =>
	!isNaN(Number(value)) ? formatNumber(Number(value ?? 0), fractionDegits) : 0;

export const toArray = <T extends any>(data): T[] => {
	return typeOf(data) === 'array' ? data : [data];
};

export const toBoolean = (value: any) => {
	const trueCollection = [true, 'true', 1, '1', 'yes', 'y'];
	const falseCollection = [false, 'false', 0, '0', 'no', 'n'];
	const lowerValue = String(value).toLowerCase();
	if (trueCollection.includes(lowerValue)) return true;
	if (falseCollection.includes(lowerValue)) return false;
	return undefined;
};

export const isEqual = (val1, val2) => {
	try {
		return JSON.stringify(val1) === JSON.stringify(val2);
	} catch (error) {
		return val1 === val2;
	}
};

export const isFunction = (functionToCheck) =>
	functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';

export const encryptedText = (text: string) => {
	const cryptography = new Cryptography();
	return cryptography.encrypt(text);
};

export const decryptedText = (encryptedText: string) => {
	const cryptography = new Cryptography();
	return cryptography.decrypt(encryptedText);
};

export const generateCacheKey = (...args: string[]) =>
	args.flat(1).filter(Boolean).join(CommonConfig.REDIS_DELIMITER);

export const calculatePercentage = (
	numerator: number,
	denominator: number,
	digits = 2,
) =>
	Math.min(toNumber(toNumber(numerator) / toNumber(denominator), digits), 1) *
	100;

export const joinString = (args: string[], delimiter = '') =>
	args.flat(1).filter(Boolean).join(delimiter);

export function objectEquals(x: any, y: any): boolean {
	if (x === null || x === undefined || y === null || y === undefined) {
		return x === y;
	}

	if (isValidMongoId(x) || isValidMongoId(y)) {
		return String(x) === String(y);
	}

	// after this just checking type of one would be enough
	if (x.constructor !== y.constructor) {
		return false;
	}
	// if they are functions, they should exactly refer to same one (because of closures)
	if (x instanceof Function) {
		return x === y;
	}
	// if they are regexps, they should exactly refer to same one (it is hard to better equality check on current ES)
	if (x instanceof RegExp) {
		return x === y;
	}
	if (x === y || x.valueOf() === y.valueOf()) {
		return true;
	}
	if (Array.isArray(x) && x.length !== y.length) {
		return false;
	}

	// if they are dates, they must had equal valueOf
	if (x instanceof Date) {
		return false;
	}

	// if they are strictly equal, they both need to be object at least
	if (!(x instanceof Object)) {
		return false;
	}
	if (!(y instanceof Object)) {
		return false;
	}

	// recursive object equality check
	let p = Object.keys(x);
	return (
		Object.keys(y).every(function (i) {
			return p.indexOf(i) !== -1;
		}) &&
		p.every(function (i) {
			return objectEquals(x[i], y[i]);
		})
	);
}

export function deepCompare(x: any, y: any): boolean {
	let i, l, leftChain, rightChain;

	function compare2Objects(x, y) {
		let p;

		// remember that NaN === NaN returns false
		// and isNaN(undefined) returns true
		if (
			isNaN(x) &&
			isNaN(y) &&
			typeof x === 'number' &&
			typeof y === 'number'
		) {
			return true;
		}

		if (isValidMongoId(x) || isValidMongoId(y)) {
			return String(x) === String(y);
		}

		// Compare primitives and functions.
		// Check if both arguments link to the same object.
		// Especially useful on the step where we compare prototypes
		if (x === y) {
			return true;
		}

		// Works in case when functions are created in constructor.
		// Comparing dates is a common scenario. Another built-ins?
		// We can even handle functions passed across iframes
		if (
			(typeof x === 'function' && typeof y === 'function') ||
			(x instanceof Date && y instanceof Date) ||
			(x instanceof RegExp && y instanceof RegExp) ||
			(x instanceof String && y instanceof String) ||
			(x instanceof Number && y instanceof Number)
		) {
			return x.toString() === y.toString();
		}

		// At last checking prototypes as good as we can
		if (!(x instanceof Object && y instanceof Object)) {
			return false;
		}

		if (x.isPrototypeOf(y) || y.isPrototypeOf(x)) {
			return false;
		}

		if (x.constructor !== y.constructor) {
			return false;
		}

		if (x.prototype !== y.prototype) {
			return false;
		}

		// Check for infinitive linking loops
		if (leftChain.indexOf(x) > -1 || rightChain.indexOf(y) > -1) {
			return false;
		}

		// Quick checking of one object being a subset of another.
		// todo: cache the structure of arguments[0] for performance
		for (p in y) {
			if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
				return false;
			} else if (typeof y[p] !== typeof x[p]) {
				return false;
			}
		}

		for (p in x) {
			if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
				return false;
			} else if (typeof y[p] !== typeof x[p]) {
				return false;
			}

			switch (typeof x[p]) {
				case 'object':
				case 'function':
					leftChain.push(x);
					rightChain.push(y);

					if (!compare2Objects(x[p], y[p])) {
						return false;
					}

					leftChain.pop();
					rightChain.pop();
					break;

				default:
					if (x[p] !== y[p]) {
						return false;
					}
					break;
			}
		}

		return true;
	}

	if (arguments.length < 1) {
		return true; //Die silently? Don't know how to handle such case, please help...
		// throw "Need two or more arguments to compare";
	}

	for (i = 1, l = arguments.length; i < l; i++) {
		leftChain = []; //Todo: this can be cached
		rightChain = [];

		if (!compare2Objects(arguments[0], arguments[i])) {
			return false;
		}
	}

	return true;
}
