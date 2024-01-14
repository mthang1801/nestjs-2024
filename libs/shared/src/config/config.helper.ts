import { CommonConfigType } from '@app/shared/config/types';
import { ENUM_PERMISSION_DESCRIPTION, ENUM_STATUS } from '../constants';
import { CommonConfig } from './common.config';

export const generateResourcePermission = (
	...permissions: Array<keyof typeof CommonConfig.PERMISSION>
): Array<CommonConfigType.PermissionValue> =>
	permissions.map((permission) => ({
		permission,
		name: ENUM_PERMISSION_DESCRIPTION[permission],
		status: ENUM_STATUS.ACTIVE,
	}));

export const arrayStringToObject = <T>(arr: string[]): T =>
	arr.reduce((res, ele) => {
		res[ele] = ele;
		return res;
	}, {}) as T;

export const getGlobalRoleLevel = (roleKey: string) =>
	Object.values(CommonConfig.GLOBAL_ROLES).find(({ key }) => key === roleKey)
		?.level;

export const visibleRolesBaseCurrentRole = (currentRole: string) => {
	const currentGlobalRole = Object.values(CommonConfig.GLOBAL_ROLES).find(
		(globalRole) => globalRole.key === currentRole,
	);
	return Object.values(CommonConfig.GLOBAL_ROLES)
		.filter((item) => item.level >= currentGlobalRole.level)
		.map((item) => item.key);
};

export const getExportImportResourceByModule = (
	moduleName: keyof typeof CommonConfig.EXPORT_MODULE,
): any => {
	switch (moduleName) {
		case 'Client':
			return CommonConfig.CORE_MODULES.CLIENT.RESOURCE;
		case 'FormAnswer':
			return CommonConfig.CORE_MODULES.FORM_ANSWER.RESOURCE;
	}
};

export const getCollectionNameDescription = (collectionName: string) => {
	switch (collectionName) {
		case CommonConfig.CORE_MODULES.USER.COLLECTION:
			return 'Người dùng hệ thống';
		case CommonConfig.CORE_MODULES.ROLE.COLLECTION:
			return 'Vai trò người dùng';
		case CommonConfig.CORE_MODULES.REBATE_LEVEL.COLLECTION:
			return 'Cấu hình chiết khấu';
		case CommonConfig.CORE_MODULES.GROUP.COLLECTION:
			return 'Nhóm';
		case CommonConfig.CORE_MODULES.FORM.COLLECTION:
			return 'Biểu mẫu';
		case CommonConfig.CORE_MODULES.CLIENT.COLLECTION:
			return 'Khách hàng';
		case CommonConfig.CORE_MODULES.FORM_ANSWER.COLLECTION:
			return 'Trả lời biểu mẫu';
	}
};

export const getRelatedControllersByModules = (
	...modules: CommonConfigType.Modules[]
) =>
	modules.map((moduleName) => CommonConfig.CORE_MODULES[moduleName].CONTROLLER);
