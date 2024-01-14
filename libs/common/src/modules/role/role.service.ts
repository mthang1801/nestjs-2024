import { MenuFunction, User } from '@app/common/schemas';
import { Role, RoleDocument } from '@app/common/schemas/role.schema';
import { AbstractService, CommonConfig, ENUM_STATUS } from '@app/shared';
import * as ConfigHelper from '@app/shared/config/config.helper';
import { MongoDB } from '@app/shared/mongodb/types/mongodb.type';
import {
	BadRequestException,
	Inject,
	Injectable,
	Logger,
	forwardRef,
} from '@nestjs/common';
import * as lodash from 'lodash';
import { MenuFunctionService } from '../menu-function/menu-function.service';
import { UserService } from '../user/user.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { RoleFilterQueryDto } from './dto/role-filter-query.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleRepository } from './role.repository';

@Injectable()
export class RoleService extends AbstractService<RoleDocument> {
	logger = new Logger(RoleService.name);
	constructor(
		readonly roleRepository: RoleRepository,
		@Inject(forwardRef(() => UserService))
		private readonly userService: UserService,
		@Inject(forwardRef(() => MenuFunctionService))
		private readonly menuFunctionService: MenuFunctionService,
	) {
		super(roleRepository);
	}

	async create(payload: CreateRoleDto) {
		this.logger.log('*********** Create *************');
		payload.flatten_menu = this.getFlattenMenu(payload.menu);
		return await this._create(payload as any, { enableSaveAction: true });
	}

	getFlattenMenu(menu: MenuFunction[]): MenuFunction[] {
		const flattenMenu = this.menuFunctionService.flattenMenu(menu);
		const pickData = flattenMenu.map((item) =>
			lodash.pick(item, [
				'_id',
				'id',
				'name',
				'code',
				'level',
				'parent',
				'position',
				'permissions',
				'resource',
				'resource_info',
				'fe_route',
				'inherited_global_roles',
			]),
		);
		return lodash.sortBy(pickData, ['level', 'position']);
	}

	getGlobalRole(user) {
		this.logger.log('********** getGlobalRole ***********');
		let currentGlobalRoleByUser = Object.values(CommonConfig.GLOBAL_ROLES).find(
			(globalRole) => globalRole.key === user?.role?.inherited_global_role,
		);

		if (!currentGlobalRoleByUser) {
			currentGlobalRoleByUser = CommonConfig.GLOBAL_ROLES.SUPER_ADMIN;
		}

		return Object.values(CommonConfig.GLOBAL_ROLES)
			.filter((globalRole) => globalRole.level >= currentGlobalRoleByUser.level)
			.map(({ key, name }) => ({ key, name }));
	}

	async findAll(query: RoleFilterQueryDto, user: User) {
		const condition = query.SearchFilterQuery;
		if (!query.inherited_global_role) {
			const globalRoleByCurrentUserRole = await this.getGlobalRole(user);
			condition.inherited_global_role = {
				$in: globalRoleByCurrentUserRole.map(({ key }) => key),
			};
		}

		const result = await this._findAndCountAll(condition, query.projectFields, {
			sort: query.sortFieldsDict,
		});

		return result;
	}

	async findById(id: string) {
		return this._findById(id);
	}

	async update(id: string, updateRoleDto: UpdateRoleDto) {
		if (updateRoleDto.menu) {
			updateRoleDto.flatten_menu = this.getFlattenMenu(updateRoleDto.menu);
		}
		await Promise.all([
			this._findByIdAndUpdate(id, updateRoleDto, { enableSaveAction: true }),
			this.userService.changeRole(id),
		]);
	}

	async validateUpdateUser(
		requestUser: MongoDB.MongoId,
		targetUser: MongoDB.MongoId,
	) {
		this.logger.log('*********** validateUpdateUser ***********');

		const [requestUserInfo, targetUserInfo] = await Promise.all([
			this.userService._findById(String(requestUser), {}, { populate: 'role' }),
			this.userService._findById(String(targetUser), {}, { populate: 'role' }),
		]);

		if (!requestUserInfo.role || !targetUserInfo.role) return;

		if (String(requestUser) === String(targetUser)) {
			throw new BadRequestException(
				this.i18n.t('errors.invalid_self_assign_role'),
			);
		}

		//Get Role Field
		const requestUserRole = requestUserInfo.role as Role;
		const requestUserRoleLevel = ConfigHelper.getGlobalRoleLevel(
			requestUserRole.inherited_global_role,
		);

		const targetUserRole = targetUserInfo.role as Role;
		const targetUserRoleLevel = ConfigHelper.getGlobalRoleLevel(
			targetUserRole.inherited_global_role,
		);

		const isInvalidLevel = requestUserRoleLevel > targetUserRoleLevel;
		const isInvalidUser =
			requestUserRoleLevel === targetUserRoleLevel &&
			String(targetUserInfo.created_by_user) !== String(requestUserInfo._id);

		if (isInvalidLevel || isInvalidUser) {
			throw new BadRequestException(this.i18n.t('errors.denied_update'));
		}
	}
}
