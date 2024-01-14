import {
  ENUM_PERMISSION_DESCRIPTION,
  ENUM_STATUS,
} from '@app/shared/constants';
import { CommonConfig } from '../common.config';

export namespace CommonConfigType {
	export type SyncSpeedMode = 'FAST' | 'MEDIUM' | 'SLOW';
	export type ApplyTime = 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';
	export type PermissionValue = {
		permission: keyof typeof CommonConfig.PERMISSION;
		name: ENUM_PERMISSION_DESCRIPTION;
		status: ENUM_STATUS;
	};
	export type NestServiceProperties = keyof typeof CommonConfig.NEST_SERVICES;
	export type NestService =
		(typeof CommonConfig.NEST_SERVICES)[NestServiceProperties];
	export type NestResource = keyof typeof CommonConfig.CORE_MODULES;
	export type Modules =
		| 'USER'
		| 'AUTH'
		| 'ACTION_HISTORY'
		| 'CLIENT'
		| 'FORM'
		| 'FORM_ITEM'
		| 'FORM_ANSWER'
		| 'GROUP'
		| 'REBATE_LEVEL'
		| 'EXPORT'
		| 'IMPORT'
		| 'MASTER_DNI'
		| 'MENU_FUNCTION'
		| 'PARTNER_AFFILIATION'
		| 'REPORT'
		| 'RESOURCE'
		| 'ROLE'
		| 'TRADE_ACCOUNT'
		| 'TRADE_ACCOUNT_HISTORY'
		| 'LOG';
	export type Resources = Modules;
	export type ModulesValues = {
		CONTROLLER: string;
		PERMISSIONS?: PermissionValue[];
		RESOURCE: Resources;
		COLLECTION?: string;
	};
}
