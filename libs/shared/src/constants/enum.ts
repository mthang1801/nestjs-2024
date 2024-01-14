export const ENUM_USER_VERIFY_TYPE = {
	FORGET_PASSWORD: 'FORGET_PASSWORD',
	SET_PASSWORD: 'SET_PASSWORD',
} as const;

export enum ENUM_STATUS {
	INIT = 'INIT',
	ACTIVE = 'ACTIVE',
	INACTIVE = 'INACTIVE',
}

export enum ENUM_GENDER {
	MALE = 'MALE',
	FEMALE = 'FEMALE',
	OTHER = 'OTHER',
}

export enum ENUM_LANGUAGES {
	ENGLISH = 'English',
	FRENCH = 'French',
	JAPANESE = 'Japanese',
	KOREAN = 'Korean',
	SPANISH = 'Spanish',
	VIETNAMESE = 'Vietnamese',
}

export enum ENUM_ROLES {
	SUPER_ADMIN = 'SUPER_ADMIN',
	ADMIN = 'ADMIN',
	SALE = 'SALE',
	SUPERVISER = 'SUPERVISER',
	USER = 'USER',
}

export enum ENUM_FORM_ANSWER_STATUS {
	NEW = 'NEW',
	PROCESSING = 'PROCESSING',
	COMPLETE = 'COMPLETE',
}

export enum ENUM_TOKEN_TYPE {
	ACCESS = 'ACCESS_TOKEN',
	REFRESH = 'REFRESH_TOKEN',
}

export enum ENUM_TOKEN_VALUE {
	ACCESS_TOKEN = 'AccessToken',
	REFRESH_TOKEN = 'RefreshToken',
}

export enum ENUM_SWAGGER_THEME {
	DARK = 'swagger-dark.css',
	FEELING_BLUE = 'swagger-feeling-blue.css',
	FLATTOP = 'swagger-flattop.css',
	GENERAL = 'swagger-general.css',
	MATERIAL = 'swagger-material.css',
	MUTED = 'swagger-muted.css',
	NEWSPAPER = 'swagger-newspaper.css',
	OUTLINE = 'swagger-outline.css',
}

export enum ENUM_FAV_ICON {
	DEFAULT = 'nestjs-logo.png',
	NT_OMS = 'nt-oms-logo.png',
	DNI = 'dni.jpg',
}

export enum ENUM_PRODUCT_VISIBILITY {
	'ALL' = 'ALL',
	'CATEGORY' = 'CATEGORY',
	'SEARCH' = 'SEARCH',
	'RECOMMEND' = 'RECOMMEND',
	'ADVERTISE' = 'ADVERTISE',
	'PROMOTION' = 'PROMOTION',
}

export enum ENUM_EVENT_MODULE {
	PRODUCT = 'PRODUCT',
	INVENTORY = 'INVENTORY',
}

export enum ENUM_FORMAT_TYPE {
	JSON = 'json',
	XLSX = 'xlsx',
	PDF = 'pdf',
}

export enum ENUM_DATA_TYPE {
	BUFFER = 'buffer',
	JSON = 'json',
}

export enum ENUM_HASH_CODE_ALGORITHM {
	cyrb53 = 'cyrb53',
	hashFnv32a = 'hashFnv32a',
}

export enum ENUM_WEEK_DAY {
	SUNDAY = 'SUNDAY',
	MONDAY = 'MONDAY',
	TUESDAY = 'TUESDAY',
	WEDNESDAY = 'WEDNESDAY',
	THURSDAY = 'THURSDAY',
	FRIDAY = 'FRIDAY',
	SATURDAY = 'SATURDAY',
}

export enum ENUM_UNIT_TIMESTAMP {
	MILISECCONDS = 'MILISECCONDS',
	SECONDS = 'SECONDS',
	MINUTES = 'MINUTES',
	HOURS = 'HOURS',
	DAYS = 'DAYS',
	WEEKS = 'WEEKS',
	MONTHS = 'MONTHS',
	YEARS = 'YEARS',
}

export enum ENUM_VALUE_DATA_TYPE {
	STRING = 'string',
	NUMBER = 'number',
	ARRAY = 'array',
	OBJECT = 'object',
	SYMBOL = 'symbol',
	BIGINT = 'bigint',
	UNDEFINED = 'undefined',
	NULL = 'null',
	BOOLEAN = 'boolean',
}

export enum ENUM_DATE_TIME {
	YYYY_MM_DD = 'YYYY-MM-DD',
	YYYYMMDDHHMMSS = 'YYYYMMDDHHmmss',
	START_OFFSET = 'T00:00:00.000+07:00',
	END_OFFSET = 'T23:59:59.999+07:00',
	YYYY_MM_DD_TIMEZONE = 'YYYY-MM-DD HH:mm:ss+07:00',
	TIME_OFFSET = '+07:00',
}

export enum ENUM_ACTION_TYPE {
	CREATE = 'CREATE',
	UPDATE = 'UPDATE',
	DELETE = 'DELETE',
	LOGIN = 'LOGIN',
	SYNC = 'SYNC',
	CUSTOM = 'CUSTOM',
}

export enum ENUM_ACTION_LOG_DATA_SOURCE {
	SYSTEM = 'SYSTEM',
	CUSTOM = 'CUSTOM',
}

export const ENUM_NOTIFICATION_OBJECT = {
	GROUP: 'GROUP',
	PRIVATE: 'PRIVATE',
	GLOBAL: 'GLOBAL',
} as const;

export const ENUM_EVENTS = {
	CREATE: 'CREATE',
	UPDATE: 'UPDATE',
	DELETE: 'DELATE',
} as const;

export const ENUM_MESSENGER_TYPE = {
	TEXT: 'TEXT',
	IMAGE: 'IMAGE',
	DOCUMENT: 'DOCUMENT',
	VIDEO: 'VIDEO',
};

export const ENUM_MESSENGER_SCOPE = {
	PRIVATE: 'PRIVATE',
	GROUP: 'GROUP',
	GLOBAL: 'GLOBAL',
} as const;

export enum ENUM_POLICY {
	PUBLIC = 'Public',
	PRIVATE = 'Private',
}

export enum ENUM_FORM_SIZE {
	SMALL = 'SMALL',
	MIDDLE = 'MIDDLE',
	LARGE = 'LARGE',
}

export enum ENUM_EXPORT_STATUS {
	INIT = 'INIT',
	PROCESSING = 'PROCESSING',
	COMPLETE = 'COMPLETE',
}

export enum ENUM_LOG_STATUS {
	SUCCESS = 'SUCCESS',
	ERROR = 'ERROR',
}

export enum ENUM_LOG_TOPIC {
	SYNC_CLIENT = 'SYNC_CLIENT',
	HTTP_REQUEST = 'HTTP_REQUEST',
}

export enum ENUM_REPORT_TYPE {
	VISIT_PAGE = 'VISIT_PAGE',
	FORM_ANSWER = 'FORM_ANSWER',
}

export enum ENUM_PERMISSION {
	ASSIGN = 'ASSIGN',
	CREATE = 'CREATE',
	UPDATE = 'UPDATE',
	DELETE = 'DELETE',
	VIEW_LIST = 'VIEW_LIST',
	VIEW_DETAIL = 'VIEW_DETAIL',
	IMPORT = 'IMPORT',
	EXPORT = 'EXPORT',
	SYNC = 'SYNC',
}

export enum ENUM_PERMISSION_DESCRIPTION {
	MANAGE = 'Quản trị',
	CREATE = 'Tạo',
	UPDATE = 'Cập nhật',
	DELETE = 'Xoá',
	VIEW_LIST = 'Xem danh sách',
	VIEW_DETAIL = 'Xem chi tiết',
	IMPORT = 'Nhập file',
	EXPORT = 'Xuất file',
	SYNC = 'Đồng bộ',
	ASSIGN = 'Phân bổ',
}

export enum FORM_ANSWER_REQUEST_TYPE {
	GET_SITUATION = 'GET_SITUATION',
	CALCULATE_ASSIGN_EVENLY = 'CALCULATE_ASSIGN_EVENLY',
	CALCULATE_ASSIGN_MANUALLY = 'CALCULATE_ASSIGN_MANUALLY',
	SUBMIT = 'SUBMIT',
	RESET = 'RESET',
}

export enum ENUM_ACTION {
	CREATE = 'CREATE',
	UPDATE = 'UPDATE',
	DELETE = 'DELETE',
	SYNC = 'SYNC',
	CUSTOM = 'CUSTOM',
}

export enum ENUM_ACTION_HISTORY_METHOD_DESCRIPTION {
	CREATE = 'Tạo',
	UPDATE = 'Cập nhật',
	DELETE = 'Xoá',
	SYNC = 'Đồng bộ',
	CUSTOM = '',
}
