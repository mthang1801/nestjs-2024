import { UserVerifyTypeName } from '@app/common/modules/auth/types/auth.type';
import { MenuFunction, Role, User, UserDocument } from '@app/common/schemas';
import { UserVerify } from '@app/common/schemas/user-verify.schema';
import { AbstractService, CommonConfig, dates, utils } from '@app/shared';
import * as ConfigHelper from '@app/shared/config/config.helper';
import { ENUM_STATUS, ENUM_USER_VERIFY_TYPE } from '@app/shared/constants/enum';
import {
	BadRequestException,
	Inject,
	Injectable,
	Logger,
	forwardRef,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AssignRoleDto } from '../role/dto/assign-role.dto';
import { RoleService } from '../role/role.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserFilterQueryDto } from './dto/filter-query-user.dto';
import { UpdateUserDto } from './dto/udpate-user.dto';
import { UserRepository } from './user.repository';
import { UserProfileEntity } from './entities/user-profile.entity';
import * as lodash from 'lodash';
import * as userRole from '../../data/user-role.json';
import { ProjectionType } from 'mongoose';
@Injectable()
export class UserService extends AbstractService<UserDocument> {
	logger = new Logger(UserService.name);
	constructor(
		readonly userRepository: UserRepository,
		@Inject(CommonConfig.RMQ_QUEUES.MAIL_SERVICE)
		private readonly mailClient: ClientProxy,
		@Inject(forwardRef(() => RoleService))
		private readonly roleService: RoleService,
	) {
		super(userRepository);
	}

	async generateRawAndHashedPassword(password: string) {
		const rawPassword = password || utils.generateRandomString({ length: 16 });
		const hashedPassword = await utils.hashedString(rawPassword);

		return { rawPassword, hashedPassword };
	}

	async login(user: User) {
		if (user.role_change_status) {
			await this._findByIdAndUpdate(user._id, {
				$set: { role_change_status: false },
			});
		}
	}

	async changeRole(roleId: string) {
		await this._update(
			{ role: roleId },
			{ $set: { role_change_status: true, refresh_token: null } },
		);
	}

	async create(payload: CreateUserDto) {
		const { rawPassword, hashedPassword } =
			await this.generateRawAndHashedPassword(payload.password);

		const createdUser = await this._create(
			{
				...payload,
				code: payload.phone,
				password: hashedPassword,
			},
			{ enableSaveAction: false },
		);

		this.mailClient.emit(CommonConfig.RMQ_EVENT_PATTERNS.SEND_EMAIL, {
			to: (createdUser as UserDocument).email,
			subject: await this.i18n.t('messages.MAIL.CREATED'),
			html: await this.i18n.t('mail.CREATED_USER', {
				args: { rawPassword },
			}),
		});

		this._saveIntoActionHistory({
			action_type: 'CUSTOM',
			custom_data: this.i18n.t('logs.CREATE_ACCOUNT', {
				args: { email: payload.email },
			}),
		});

		return createdUser;
	}

	async getList(query: UserFilterQueryDto, user: User) {
		this.logger.log('********** getList ***********');
		const { SearchFilterQuery } = query;
		const conditionByRole = await this.getConditionByRole(user?.role as Role);
		const result = await this._findAndCountAll(
			{ $and: [{ ...SearchFilterQuery }, { ...conditionByRole }] },
			{},
			{ populateAll: false },
		);

		return result;
	}

	async getConditionByRole(userRole: Role) {
		const visibleRolesList = ConfigHelper.visibleRolesBaseCurrentRole(
			userRole.inherited_global_role,
		);

		const rolesList = await this.roleService._findAll({
			inherited_global_role: { $in: visibleRolesList },
		});

		return {
			$or: [
				{ role: { $in: rolesList.map((item) => item._id) } },
				{ role: null },
			],
		};
	}

	async findUserByPhoneOrEmail(username: string) {
		const user = await this._findOne({
			$or: [{ email: username }, { phone: username }],
		});

		if (!user)
			throw new BadRequestException(
				await this.i18n.t('errors.alert_password_wrong'),
			);

		return user;
	}

	async saveRefreshToken(user: User, refreshToken: string) {
		await this.primaryModel.findByIdAndUpdate(user.id, {
			refresh_token: refreshToken,
		});
	}

	async updateNewPasswordByUserId(userId: string, password: string) {
		await this._findByIdAndUpdate(userId, { password });
	}

	async findById(id: string): Promise<User> {
		return await this._findById(
			id,
			{},
			{ populate: [{ path: 'role', populate: 'flatten_menu.resource' }] },
		);
	}

	async findByRefreshToken(refreshToken: string): Promise<User> {
		return await this._findOne({
			refresh_token: refreshToken,
		});
	}

	getVerifyCode(type: UserVerifyTypeName) {
		switch (type) {
			case ENUM_USER_VERIFY_TYPE.FORGET_PASSWORD:
				return this.generateForgetPasswordVerifyCode();
			default:
				return null;
		}
	}

	generateForgetPasswordVerifyCode() {
		return new UserVerify({
			code: utils.generateRandomString({
				length: 16,
				excludeCharacters: '&*=-',
			}),
			type: ENUM_USER_VERIFY_TYPE.FORGET_PASSWORD,
			expired_at: dates.addTime(new Date(), 10, 'minutes'),
		});
	}

	async update(id: string, updateUserDto: UpdateUserDto) {
		this.logger.log('************* update ***************');

		await this.roleService.validateUpdateUser(
			updateUserDto.updated_by_user,
			id,
		);

		if (updateUserDto.role) {
			updateUserDto.role_change_status = true;
		}

		return this._findByIdAndUpdate(id, updateUserDto, {
			enableSaveAction: true,
		});
	}

	async assignRole(assignRoleDto: AssignRoleDto) {
		await this._update(
			{ _id: { $in: assignRoleDto.users } },
			{ $set: { role: assignRoleDto.role } },
			{
				updateOnlyOne: false,
			},
		);
	}

	async getProfile(user: User): Promise<UserProfileEntity> {
		this.logger.log('************ getProfile *************');
		return { ...(user as any).toJSON(), menu: await this.getMenu(user) };
	}

	async getMenu(user: User) {
		this.logger.log('************ getMenu() ************');
		const menuList = (user?.role as Role)?.flatten_menu || [];
		const menuListSortByLevelDesc = lodash
			.orderBy(menuList, ['level', 'positition'], ['desc', 'asc'])
			.map((item: any) => item.toJSON());

		return menuListSortByLevelDesc.reduce(
			(result: MenuFunction[], element: MenuFunction) => {
				const childrenMenu = result.filter(
					(resItem) => String(resItem.parent) === String(element._id),
				);

				element.children = childrenMenu.filter((childMenu) =>
					childMenu.permissions.some(
						(permission) =>
							permission.permission === CommonConfig.PERMISSION.VIEW_LIST &&
							permission.status === ENUM_STATUS.ACTIVE,
					),
				);

				childrenMenu.forEach((childMenu) => {
					const resIndex = result.findIndex(
						(resItem: any) => String(resItem._id) === String(childMenu._id),
					);
					result.splice(resIndex, 1);
				});

				const isEmptyChildrenAtRoot =
					!element?.children?.length && element.level === 0;

				const shouldChildNotExists =
					element.level === 1 &&
					!element.permissions.some(
						(permission) =>
							permission.permission === CommonConfig.PERMISSION.VIEW_LIST &&
							permission.status === ENUM_STATUS.ACTIVE,
					);
				if (isEmptyChildrenAtRoot || shouldChildNotExists) return result;

				result.push(element);
				return result;
			},
			[],
		);
	}

	async migrateData() {
		const SuperAdminUsers = userRole.SUPER_ADMIN.map((email) => ({
			inherited_global_role: CommonConfig.GLOBAL_ROLES.SUPER_ADMIN.key,
			email,
		}));
		const AdminUsers = userRole.ADMIN.map((email) => ({
			inherited_global_role: CommonConfig.GLOBAL_ROLES.ADMIN.key,
			email,
		}));

		const saleUsers = await this._findAll({
			email: { $not: { $in: [...userRole.SUPER_ADMIN, ...userRole.ADMIN] } },
		});

		const roles = await this.roleService._findAll({}, {}, { lean: true });

		await Promise.all(
			[
				[...SuperAdminUsers, ...AdminUsers].map(async (user) => {
					const userByEmail = await this._findOne(
						{ email: user.email },
						{},
						{ lean: true },
					);
					const role = roles.find(
						({ inherited_global_role }) =>
							inherited_global_role === user.inherited_global_role,
					);

					await this._findByIdAndUpdate(userByEmail._id, {
						$set: { role: role._id },
					});
				}),
				saleUsers.map(async (user) => {
					const role = roles.find(
						({ inherited_global_role }) =>
							inherited_global_role === CommonConfig.GLOBAL_ROLES.SALE.key,
					);
					await this._findByIdAndUpdate(user._id, { $set: { role: role._id } });
				}),
			].flat(1),
		);
	}

	async getExportData(
		filterQuery: Record<string, any>,
		projection: ProjectionType<any>,
	) {
		filterQuery.projectFields = projection;
		const filterQueryDto = new UserFilterQueryDto(filterQuery);
		filterQueryDto.page = 1;
		filterQueryDto.limit = Number.MAX_SAFE_INTEGER;
		const responseData = await this._findAndCountAll(filterQueryDto);
		return responseData;
	}
}
