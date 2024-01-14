import { AuthResponseEntity } from '@app/common/modules/auth/entity/auth-response.entity';
import { ExportResponseEntity } from '@app/common/modules/export/entity/export-response.entity';
import { GlobalRoleEntity } from '@app/common/modules/role/entity/global-role.entity';
import { UserProfileEntity } from '@app/common/modules/user/entities/user-profile.entity';
import {
	ActionHistory,
	MenuFunction,
	Resource,
	Role,
	User,
} from '@app/common/schemas';

export const extraModels = [
	User,
	AuthResponseEntity,
	MenuFunction,
	Resource,
	Role,
	ActionHistory,
	ExportResponseEntity,
	GlobalRoleEntity,
	UserProfileEntity,
];
