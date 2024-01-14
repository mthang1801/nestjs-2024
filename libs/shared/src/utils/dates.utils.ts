import * as moment from 'moment';
import { ENUM_UNIT_TIMESTAMP, ENUM_WEEK_DAY } from '../constants';
import { UnitTimestamp, Weekday } from './types';
export const dateFormatYMD = 'YYYY-MM-DD';
export const dateFormatDMY = 'DD-MM-YYYY';
export const dateFormatYMD_hms = 'YYYY-MM-DD HH:mm:ss';
export const dateFormatYMD_hm = 'YYYY-MM-DD hh:mm';
export const dateFormatDMY_hm = 'DD-MM-YYYY hh:mm';
export const dateFormatYMD_hmsA = 'YYYY-MM-DD hh:mm:ss a';
export const dateFormatYMD_hms24h = 'YYYY-MM-DD HH:mm:ss';
export const dateFormatDMY_hms24h = 'DD-MM-YYYY HH:mm:ss';
export const dateFormat_hms24h = 'HH:mm:ss';
export const dateFormatDM_hms = 'DD/MM hh:mm:ss';
export const dateFormatDM_hm = 'DD/MM hh:mm';
export const dateISO = 'YYYY-MM-DDTHH:mm:ss.sssZ';

export const formatMySQLTimeStamp = (
	timestamp: string | Date = new Date(),
): string => moment(timestamp).format(dateFormatYMD_hms);

export const formatTime = (timestamp: string | Date = new Date()) =>
	moment(timestamp).format('HH:mm:ss');

export const formatDateTime = (
	dateTime: Date = new Date(),
	format = dateFormatDMY_hms24h,
) => moment(dateTime).format(format);

export const checkValidTimestamp = (timestamp) => moment(timestamp).isValid();

export const longDateFormatByLocale = (
	timestamp: string | number | Date = new Date(),
	locale = 'vi',
) => {
	moment.locale(locale);
	return moment(timestamp).format(dateFormatDMY_hms24h);
};

export const longDateFormatWithoutSecondByLocale = (
	timestamp: string | number | Date = new Date(),
	locale = 'vi',
) => {
	moment.locale(locale);
	return moment(timestamp).format(dateFormatDMY_hm);
};

export const dateTimeFormatByLocale = (
	timestamp: string | number | Date = new Date(),
	locale = 'vi',
	format = dateFormatDMY,
) => {
	moment.locale(locale);
	return moment(timestamp).format(format);
};

export const today = (dateFormat: string = dateFormatYMD) =>
	moment().format(dateFormat);

export const startOfDay = (date = new Date(), format: string = dateISO): Date =>
	new Date(moment(date).startOf('day').format(format));

export const endOfDay = (date = new Date(), format: string = dateISO): Date =>
	new Date(moment(date).endOf('day').format(format));

export const dateBefore = (day: number, dateFormat = dateISO) =>
	new Date(moment().subtract(day).format(dateFormat));

export const startOfMonth = (dateFormat) =>
	moment()
		.startOf('month')
		.format(dateFormat ? dateFormat : dateFormatYMD);

export const lastDaysFromNow = (day: number, format = dateFormatYMD) =>
	moment().subtract(day, 'day').format(format);

export const endOfMonth = (dateFormat) =>
	moment()
		.endOf('month')
		.format(dateFormat ? dateFormat : dateFormatYMD);

export const startOfLastMonth = (dateFormat) =>
	moment()
		.subtract(1, 'months')
		.startOf('month')
		.format(dateFormat ? dateFormat : dateFormatYMD);
export const endOfLastMonth = (dateFormat) =>
	moment()
		.subtract(1, 'months')
		.endOf('month')
		.format(dateFormat ? dateFormat : dateFormatYMD);

export const startOfWeek = (dateFormat) =>
	moment()
		.startOf('week')
		.format(dateFormat ? dateFormat : dateFormatYMD);
export const endOfWeek = (dateFormat) =>
	moment()
		.endOf('week')
		.format(dateFormat ? dateFormat : dateFormatYMD);
export const previousDaysFromNow = (
	prevDay: number,
	dateFormat: string = dateFormatYMD,
) => moment().subtract(prevDay, 'days').format(dateFormat);
export const beforeThirtyDays = (dateFormat): any =>
	moment()
		.subtract(30, 'days')
		.format(dateFormat ? dateFormat : dateFormatYMD);
export const start7Day = (dateFormat) =>
	moment()
		.subtract(7, 'days')
		.format(dateFormat ? dateFormat : dateFormatYMD);
export const start14Day = (dateFormat) =>
	moment()
		.subtract(14, 'days')
		.format(dateFormat ? dateFormat : dateFormatYMD);
export const start30Day = (dateFormat) =>
	moment()
		.subtract(30, 'days')
		.format(dateFormat ? dateFormat : dateFormatYMD);
export const yesterday = (dateFormat = dateFormatYMD) =>
	moment()
		.subtract(1, 'days')
		.format(dateFormat ? dateFormat : dateFormatYMD);
export const tomorrow = (dateFormat) =>
	moment()
		.add(1, 'days')
		.format(dateFormat ? dateFormat : dateFormatYMD);

export const dateFromNow = (numberOfDays: number, dateFormat) =>
	moment()
		.add(numberOfDays, 'days')
		.format(dateFormat ? dateFormat : dateFormatYMD);

export const nowDate = (dateFormat) =>
	moment().format(dateFormat ? dateFormat : dateFormatYMD);
export const fromDate = (dateFormat: any) =>
	moment(
		beforeThirtyDays as moment.MomentInput,
		dateFormat ? dateFormat : dateFormatYMD,
	);
export const toDate = (dateFormat) =>
	moment(
		nowDate as moment.MomentInput,
		dateFormat ? dateFormat : dateFormatYMD,
	);

const padTo2Digits = (num) => {
	return num.toString().padStart(2, '0');
};

export const formatDate = (date) => {
	return (
		[
			date.getFullYear(),
			padTo2Digits(date.getMonth() + 1),
			padTo2Digits(date.getDate()),
		].join('-') +
		' ' +
		[
			padTo2Digits(date.getHours()),
			padTo2Digits(date.getMinutes()),
			padTo2Digits(date.getSeconds()),
		].join(':')
	);
};

export const ISO8601Formats = (timestamp: Date) =>
	moment(new Date(timestamp)).format(dateFormatYMD_hms24h);

export const formatDateYMD = (timestamp: Date) =>
	moment(new Date(timestamp)).format(dateFormatYMD);

export const formatDateYMDHM = (timestamp: Date) =>
	moment(new Date(timestamp)).format(dateFormatYMD_hm);

export const compareTwoDate = (date1: Date, date2: Date) =>
	new Date(date1).getTime() > new Date(date2).getTime() ? 1 : -1;

export const CURRENT = (timeType: 'DAY' | 'MONTH' | 'YEAR' | 'FULLTIME') => {
	switch (timeType) {
		case 'DAY':
			return new Date().getDate();
		case 'MONTH':
			return new Date().getMonth() + 1;
		case 'YEAR':
			return new Date().getFullYear();
		case 'FULLTIME':
			return new Date();
	}
};

export const toYear = (date: Date) => new Date(date).getFullYear();
export const toMonth = (date: Date) => new Date(date).getMonth() + 1;
export const toDayOfMonth = (date: Date) => new Date(date).getDate();

/**
 * Get duration between 2 different time
 * @param {Date} start
 * @param {Date} end
 * @param {string} unitTimestamp
 * @returns {number}
 */
export const getDifferentTimestamp = (
	start: Date,
	end: Date,
	unitTimestamp: UnitTimestamp = 'MILISECCONDS',
) => {
	const startTime = moment(start);
	const endTime = moment(end);
	const duration = moment.duration(endTime.diff(startTime));

	const durationStrategy = {
		[ENUM_UNIT_TIMESTAMP.MILISECCONDS]: duration.asMilliseconds(),
		[ENUM_UNIT_TIMESTAMP.SECONDS]: duration.asSeconds(),
		[ENUM_UNIT_TIMESTAMP.MINUTES]: duration.asMinutes(),
		[ENUM_UNIT_TIMESTAMP.HOURS]: duration.asHours(),
		[ENUM_UNIT_TIMESTAMP.DAYS]: duration.asDays(),
		[ENUM_UNIT_TIMESTAMP.WEEKS]: duration.asWeeks(),
		[ENUM_UNIT_TIMESTAMP.MONTHS]: duration.asMonths(),
		[ENUM_UNIT_TIMESTAMP.YEARS]: duration.asYears(),
	};

	return Math.abs(durationStrategy[unitTimestamp]);
};

/**
 * Get week day
 * @param {Date} date
 * @param {string} startWeekDay
 * @returns {number}
 */
export const getWeekOfMonth = (
	date: Date = new Date(),
	startWeekDay: Weekday = 'MONDAY',
) => {
	const firstDate = new Date(date.getFullYear(), date.getMonth(), 1);
	const firstDay = firstDate.getDay();

	let weekNumber = Math.ceil((date.getDate() + firstDay) / 7);
	if (startWeekDay === ENUM_WEEK_DAY.MONDAY) {
		if (date.getDay() === 0 && date.getDate() > 1) {
			weekNumber -= 1;
		}
		if (firstDate.getDate() === 1 && firstDay === 0 && date.getDate() > 1) {
			weekNumber += 1;
		}
	}
	return weekNumber;
};

/**
 *  get  Day of week
 * @param {Date} date
 * @returns {ENUM_WEEK_DAY}
 */
export const getDayOfWeek = (date: Date = new Date()) => {
	return Object.values(ENUM_WEEK_DAY)[date.getDay()];
};

/**
 * @return {Date[]} List with date objects for each day of the month
 * @param month
 * @param year
 */
export const getDaysInMonth = (month: number, year: number) => {
	const date = new Date(year, month - 1, 1);
	const days = [];
	while (date.getMonth() === month - 1) {
		days.push(new Date(date));
		date.setDate(date.getDate() + 1);
	}
	return days;
};

/**
 * Get week of year
 * @param {Date} date
 * @returns {number}
 */
export const getWeekInYear = (date: Date = new Date()) => {
	return moment(date).week();
};

export const addTime = (
	fromDate: Date,
	amount: number | any,
	unitTimestamp: Lowercase<UnitTimestamp>,
): Date => moment(fromDate).add(amount, unitTimestamp).toDate();
