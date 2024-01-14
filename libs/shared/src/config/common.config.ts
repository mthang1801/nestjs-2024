import { join } from 'path';
import * as utils from '../utils/function.utils';
import * as Helper from './config.helper';
import { CommonConfigType } from './types';

export class CommonConfig {
	//#region NEST CUSTOM
	static NEST_TOKEN = {
		REDIS_CONNECTION_OPTIONS: 'REDIS_CONNECTION_OPTIONS',
		REDIS: 'REDIS',
		PERMISSION: 'PERMISSION',
		RESOURCE: 'RESOURCE',
	};

	static CORE_MODULES: Record<
		CommonConfigType.Modules,
		CommonConfigType.ModulesValues
	> = {
		USER: {
			RESOURCE: 'USER',
			CONTROLLER: 'users',
			PERMISSIONS: Helper.generateResourcePermission(
				'CREATE',
				'UPDATE',
				'VIEW_LIST',
				'VIEW_DETAIL',
			),
			COLLECTION: 'users',
		},
		AUTH: {
			RESOURCE: 'AUTH',
			CONTROLLER: 'auth',
			PERMISSIONS: Helper.generateResourcePermission(
				'CREATE',
				'UPDATE',
				'VIEW_LIST',
				'VIEW_DETAIL',
			),
		},
		ACTION_HISTORY: {
			RESOURCE: 'ACTION_HISTORY',
			CONTROLLER: 'action-histories',
			PERMISSIONS: Helper.generateResourcePermission('VIEW_LIST'),
			COLLECTION: 'action_histories',
		},
		CLIENT: {
			RESOURCE: 'CLIENT',
			CONTROLLER: 'clients',
			PERMISSIONS: Helper.generateResourcePermission(
				'CREATE',
				'UPDATE',
				'VIEW_LIST',
				'VIEW_DETAIL',
				'IMPORT',
				'EXPORT',
				'SYNC',
			),
			COLLECTION: 'clients',
		},
		FORM: {
			RESOURCE: 'FORM',
			CONTROLLER: 'forms',
			PERMISSIONS: Helper.generateResourcePermission(
				'CREATE',
				'UPDATE',
				'VIEW_LIST',
				'VIEW_DETAIL',
			),
			COLLECTION: 'forms',
		},
		FORM_ITEM: {
			RESOURCE: 'FORM_ITEM',
			CONTROLLER: 'form-items',
			PERMISSIONS: Helper.generateResourcePermission(
				'CREATE',
				'UPDATE',
				'VIEW_LIST',
				'VIEW_DETAIL',
			),
			COLLECTION: 'form_items',
		},
		FORM_ANSWER: {
			RESOURCE: 'FORM_ANSWER',
			CONTROLLER: 'form-answers',
			PERMISSIONS: Helper.generateResourcePermission(
				'CREATE',
				'VIEW_LIST',
				'VIEW_DETAIL',
				'UPDATE',
				'ASSIGN',
				'SYNC',
				'EXPORT',
			),
			COLLECTION: 'form_answers',
		},
		GROUP: {
			RESOURCE: 'GROUP',
			CONTROLLER: 'groups',
			PERMISSIONS: Helper.generateResourcePermission(
				'CREATE',
				'VIEW_LIST',
				'VIEW_DETAIL',
				'UPDATE',
			),
			COLLECTION: 'groups',
		},
		REBATE_LEVEL: {
			RESOURCE: 'REBATE_LEVEL',
			CONTROLLER: 'rebate-levels',
			PERMISSIONS: Helper.generateResourcePermission(
				'CREATE',
				'VIEW_LIST',
				'VIEW_DETAIL',
				'UPDATE',
			),
			COLLECTION: 'rebate_levels',
		},
		EXPORT: {
			RESOURCE: 'EXPORT',
			CONTROLLER: 'exports',
			PERMISSIONS: Helper.generateResourcePermission(),
			COLLECTION: 'exports',
		},
		IMPORT: {
			RESOURCE: 'IMPORT',
			CONTROLLER: 'imports',
			PERMISSIONS: Helper.generateResourcePermission(),
		},
		MASTER_DNI: {
			RESOURCE: 'MASTER_DNI',
			CONTROLLER: 'master-dni',
			PERMISSIONS: Helper.generateResourcePermission(),
		},
		MENU_FUNCTION: {
			RESOURCE: 'MENU_FUNCTION',
			CONTROLLER: 'menu-functions',
			PERMISSIONS: Helper.generateResourcePermission(),
			COLLECTION: 'menu_functions',
		},
		PARTNER_AFFILIATION: {
			RESOURCE: 'PARTNER_AFFILIATION',
			CONTROLLER: 'partner-affiliation',
			PERMISSIONS: Helper.generateResourcePermission('VIEW_LIST'),
			COLLECTION: 'partner_affiliation',
		},
		REPORT: {
			RESOURCE: 'REPORT',
			CONTROLLER: 'reports',
			PERMISSIONS: Helper.generateResourcePermission('VIEW_LIST'),
			COLLECTION: 'reports',
		},
		RESOURCE: {
			RESOURCE: 'RESOURCE',
			CONTROLLER: 'resources',
			PERMISSIONS: Helper.generateResourcePermission('VIEW_LIST'),
		},
		ROLE: {
			RESOURCE: 'ROLE',
			CONTROLLER: 'roles',
			PERMISSIONS: Helper.generateResourcePermission(
				'CREATE',
				'UPDATE',
				'VIEW_LIST',
				'VIEW_DETAIL',
				'ASSIGN',
			),
			COLLECTION: 'roles',
		},
		TRADE_ACCOUNT: {
			RESOURCE: 'TRADE_ACCOUNT',
			CONTROLLER: 'trade-accounts',
			PERMISSIONS: Helper.generateResourcePermission(),
			COLLECTION: 'trade_accounts',
		},
		TRADE_ACCOUNT_HISTORY: {
			RESOURCE: 'TRADE_ACCOUNT_HISTORY',
			CONTROLLER: 'trade-account-histories',
			PERMISSIONS: Helper.generateResourcePermission(),
			COLLECTION: 'trade_account_histories',
		},
		LOG: {
			RESOURCE: 'LOG',
			CONTROLLER: 'logs',
			PERMISSIONS: Helper.generateResourcePermission(),
			COLLECTION: 'logs',
		},
	};

	static concurrently = 20;
	static chunk = 10000;
	static NEST_SERVICES = {
		NEST_2K24: {
			portENV: 'NESTJS_2K24_PORT',
			name: 'NESTJS_2K24',
		},
		EVENT_SERVICE: {
			portENV: 'EVENTS_PORT',
			name: 'Event Service',
		},
	};
	//#endregion

	//#region REDIS
	static REDIS_DELIMITER = ':';
	static REDIS_EXCLUDE_CACHE_PATH = [];
	static REDIS_THROTTLER = 'THROTTLER';
	static REDIS_RELATED_CONTROLLER_PATTERN = {
		[this.CORE_MODULES.USER.CONTROLLER]: Helper.getRelatedControllersByModules(
			'CLIENT',
			'FORM',
			'REPORT',
		),
		[this.CORE_MODULES.GROUP.CONTROLLER]: Helper.getRelatedControllersByModules(
			'CLIENT',
			'FORM',
			'USER',
			'REPORT',
		),
		[this.CORE_MODULES.CLIENT.CONTROLLER]:
			Helper.getRelatedControllersByModules('REPORT', 'USER', 'GROUP', 'FORM'),
		[this.CORE_MODULES.FORM_ANSWER.CONTROLLER]:
			Helper.getRelatedControllersByModules('REPORT', 'CLIENT'),
	};
	static REDIS_PREFIX_KEY_DEFAULT = 'DNI';
	static REDIS_PATTERN = {
		EXNESS: utils.generateCacheKey(this.REDIS_PREFIX_KEY_DEFAULT, 'EXNESS'),
	};
	static STATIC_ASSET = join(process.cwd(), 'public');
	static STATIC_VIEWS = join(process.cwd(), 'views');
	//#endregion

	//#region Excel IMPORT,EXPORT
	static IMPORT_MODULE = {
		Client: 'Client',
	};
	static EXPORT_MODULE = {
		Client: 'Client',
		ClientSample: 'ClientSample',
		FormAnswer: 'FormAnswer',
		User: 'User',
	};
	static EXPORT_DIRECTORY = join(
		process.cwd(),
		'libs/shared/src/exceljs/templates',
	);
	//#endregion

	//#region PERMISSION
	static PERMISSION_KEY = 'permission';
	static PERMISSION = {
		CREATE: 'CREATE',
		UPDATE: 'UPDATE',
		DELETE: 'DELETE',
		ASSIGN: 'ASSIGN',
		VIEW_LIST: 'VIEW_LIST',
		VIEW_DETAIL: 'VIEW_DETAIL',
		IMPORT: 'IMPORT',
		EXPORT: 'EXPORT',
		SYNC: 'SYNC',
	};
	static RESOURCE_KEY = 'resource';

	static GLOBAL_ROLES = {
		SUPER_ADMIN: {
			key: 'SUPER_ADMIN',
			name: 'Quản trị hệ thống',
			level: 0,
		},
		ADMIN: {
			key: 'ADMIN',
			name: 'Quản trị viên',
			level: 1,
		},
		SALE: {
			key: 'SALE',
			name: 'Nhân viên',
			level: 2,
		},
	};

	//#endregion

	//#region MODEL
	static SAVE_INFO_FIELDS = [
		'_id',
		'id',
		'email',
		'phone',
		'name',
		'code',
		'status',
		'permissions',
		'level',
		'inherited_global_role',
	];

	//#endregion

	//#region SYNC DATA
	static SYNC_CLIENT_FIELDS =
		'name email affiliation code phone gender zalo_phone telegram_username';
	static generatePrefixCodeByModel(modelName: string) {
		return `${modelName.slice(0, 2)}${modelName.at(-1)}`.toUpperCase();
	}

	static syncSpeedModeStrategy(mode: CommonConfigType.SyncSpeedMode) {
		return {
			SLOW: 10000,
			MEDIUM: 5000,
			FAST: 3000,
		}[mode];
	}

	static syncClientScheduler(applyTime: CommonConfigType.ApplyTime) {
		return {
			DAY: {
				last_trade_at_from: 0,
				last_trade_at_to: 30,
			},
			WEEK: {
				last_trade_at_from: 31,
				last_trade_at_to: 90,
			},
			MONTH: {
				last_trade_at_from: 91,
			},
		}[applyTime];
	}
	//#endregion

	//#region RabbitMQ
	static RMQ_QUEUES = {
		HEALTH_CHECK: 'HEALTH_CHECK',
		SAVE_ACTION: 'SAVE_ACTION',
		MAIL_SERVICE: 'MAIL_SERVICE',
		ACTION_HISTORY: 'ACTION_HISTORY',
		SAVE_INFO: 'SAVE_INFO',
		REMOVE_INFO: 'REMOVE_INFO',
		SAVE_LOG: 'SAVE_LOG',
		TELEGRAM: 'TELEGRAM',
		EXPORT: 'EXPORT',
		REPORT: 'REPORT',
		IMPORT: 'IMPORT',
	};
	static RMQ_ACK_QUEUES = [
		this.RMQ_QUEUES.EXPORT,
		this.RMQ_QUEUES.SAVE_LOG,
		this.RMQ_QUEUES.ACTION_HISTORY,
		this.RMQ_QUEUES.REPORT,
		this.RMQ_QUEUES.IMPORT,
	];
	static RMQ_EVENT_PATTERNS = {
		SAVE_ACTION: 'SAVE_ACTION',
		SET_PASSWORD: 'SET_PASSWORD',
		RESET_PASSWORD: 'RESET_PASSWORD',
		SEND_EMAIL: 'SEND_EMAIL',
		SAVE_INFO: 'SAVE_INFO',
		REMOVE_INFO: 'REMOVE_INFO',
		SAVE_OTHER_SCHEMA_INFO: 'SAVE_OTHER_SCHEMA_INFO',
		SAVE_OTHER_SCHEMA_INFO_UPDATE_MANY: 'SAVE_OTHER_SCHEMA_INFO_UPDATE_MANY',
		SYNC_CLIENT_ACCOUNT: 'SYNC_CLIENT_ACCOUNT',
		SAVE_LOG: 'SAVE_LOG',
		TELEGRAM_MESSAGE: 'TELEGRAM_MESSAGE',
		EXPORT: 'EXPORT',
		IMPORT_CLIENT: 'IMPORT_CLIENT',
		REPORT_FORM_ANSWER: 'REPORT_FORM_ANSWER',
	};
	static RMQ_MESSAGE_PATTERNS = {
		SYNC_CLIENT_ACCOUNT: 'SYNC_CLIENT_ACCOUNT',
	};
	static RMQ_PREFETCH_COUNT = {
		[this.RMQ_QUEUES.IMPORT]: 1,
		DEFAULT: 10,
	};
	static RMQGetPrefetchCount(queue) {
		return this.RMQ_PREFETCH_COUNT[queue] ?? this.RMQ_PREFETCH_COUNT.DEFAULT;
	}
	//#endregion
}
