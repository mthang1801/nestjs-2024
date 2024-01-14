import {
  TokenPayload,
  TokenType,
} from '@app/common/modules/auth/types/auth.type';
import { Resource, Role, User } from '@app/common/schemas';
import { CommonConfig } from '@app/shared';
import * as configHeler from '@app/shared/config/config.helper';
import { CommonConfigType } from '@app/shared/config/types';
import {
  ENUM_PERMISSION,
  ENUM_POLICY,
  ENUM_STATUS,
  ENUM_TOKEN_TYPE,
} from '@app/shared/constants/enum';
import { IUserRequest } from '@app/shared/interfaces';
import { convertInfoData } from '@app/shared/utils/function.utils';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import * as lodash from 'lodash';
import * as multer from 'multer';
import { I18nService } from 'nestjs-i18n';
import { UserService } from '../../user';

@Injectable()
export class AuthGuard implements CanActivate {
	logger = new Logger(AuthGuard.name);
	constructor(
		private readonly reflector: Reflector,
		private readonly configSerice: ConfigService,
		private readonly jwtService: JwtService,
		@Inject(forwardRef(() => UserService))
		private readonly userService: UserService,
		private readonly it8n: I18nService,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		const token = this.extractTokenFromHeader(request);

		if (!token && !this.isPublic(context)) return false;

		if (token) {
			try {
				const payload = await this.verifyToken(token, request);
				const user = await this.userService.findById(payload.id);
				await this.validateUserStatus(user);
				await this.checkPermissionAccessResource(context, user);
				request.user = user;
				this.determineUserActionByMethod(request);
			} catch (error) {
				//NOTE: Token hết hạn sẽ trả về statusCode 401, còn lại sẽ là 403
				if (error.message === 'jwt expired') {
					throw new UnauthorizedException(
						await this.it8n.t('errors.token_expired'),
					);
				}

				if (error.status === HttpStatus.UNAUTHORIZED) {
					throw new ForbiddenException(error.message);
				}

				return false;
			}
		}

		return true;
	}

	/**
	 * Check user is active and role whether is changed by admin
	 * @param {User} user
	 */
	async validateUserStatus(user: User) {
		if (!user || user.status !== ENUM_STATUS.ACTIVE) {
			throw new ForbiddenException(this.it8n.t('errors.invalid_auth_user'));
		}

		if (user.role_change_status) {
			await this.userService._findByIdAndUpdate(user._id, {
				$set: {
					refresh_token: null,
					role_change_status: false,
				},
			});
			throw new ForbiddenException(this.it8n.t('errors.admin_change_role'));
		}
	}

	/**
	 * 	//TODO: Phân quyền access đến dữ liệu
	 */
	private async checkPermissionAccessResource(
		context: ExecutionContext,
		user: User,
	) {
		this.logger.log('************* checkPermissionAccessResource ***********');
		if (this.isPublic(context) || !user.role) return;
		const permissionReflector = this.getReflectorByToken<ENUM_PERMISSION>(
			CommonConfig.NEST_TOKEN.PERMISSION,
			context,
		);
		const resourceReflector =
			this.getReflectorByToken<CommonConfigType.NestResource>(
				CommonConfig.NEST_TOKEN.RESOURCE,
				context,
			);
		const resource = await this.getResource(context, resourceReflector);

		if (resource && permissionReflector) {
			const { flatten_menu } = user?.role as Role;
			const resourceFlattenMenu = flatten_menu.find(
				(menuItem) => (menuItem?.resource as Resource)?.code === resource,
			);

			if (!resourceFlattenMenu) {
				throw new UnauthorizedException(
					this.it8n.t('errors.denied_access_resource'),
				);
			}

			const isValidPermission = resourceFlattenMenu?.permissions?.some(
				(item) =>
					item.permission === permissionReflector &&
					item.status === ENUM_STATUS.ACTIVE,
			);

			if (!isValidPermission) {
				throw new UnauthorizedException(
					this.it8n.t('errors.denied_access_resource'),
				);
			}
		}
	}

	/**
	 * Get orinal resource from reflector (apply external context such as export, import)
	 * @param context
	 * @param resourceReflector
	 * @returns
	 */
	private async getResource(
		context: ExecutionContext,
		resourceReflector: CommonConfigType.Resources,
	) {
		if (resourceReflector === CommonConfig.CORE_MODULES.EXPORT.RESOURCE) {
			resourceReflector = this.getExportRemoteResource(context);
		}

		if (resourceReflector === CommonConfig.CORE_MODULES.IMPORT.RESOURCE) {
			resourceReflector = await this.getImportRemoteResource(context);
		}

		return resourceReflector;
	}

	private getExportRemoteResource(context: ExecutionContext) {
		const request = context.switchToHttp().getRequest();
		return configHeler.getExportImportResourceByModule(request.body?.module);
	}

	private async getImportRemoteResource(
		context: ExecutionContext,
	): Promise<any> {
		this.logger.log('********* getImportRemoteResource ***********');
		const request = context.switchToHttp().getRequest();
		const requestDummy = lodash.cloneDeep(request);
		const multerRequest: Request = await new Promise((resolve, reject) => {
			multer().any()(requestDummy, null as any, function (err) {
				if (err) reject(err);
				resolve(requestDummy);
			});
		});
		return configHeler.getExportImportResourceByModule(
			multerRequest?.body?.module,
		);
	}

	private getReflectorByToken<T>(token: string, context: ExecutionContext) {
		return this.reflector.getAllAndOverride<T>(token, [
			context.getHandler(),
			context.getClass(),
		]);
	}

	private isPublic(context: ExecutionContext) {
		return this.getReflectorByToken<boolean>(ENUM_POLICY.PUBLIC, context);
	}

	private extractTokenFromHeader(request: Request): string | undefined {
		const [type, token] = request.headers.authorization?.split(' ') ?? [];
		return type === 'Bearer' ? token : undefined;
	}

	async verifyToken(token: string, request: Request): Promise<TokenPayload> {
		const { tokenType, secretToken } = await this.getSecretTokenByRoutePath(
			request.path,
			token,
		);

		if (tokenType === 'REFRESH_TOKEN') {
			await this.validateRefreshToken(token);
		}

		try {
			return await this.jwtService.verifyAsync(token, {
				secret: secretToken,
				ignoreExpiration: false,
			});
		} catch (error) {
			//NOTE: Refresh Token luôn luôn trả về 403 mặc dù hết hạn
			if (tokenType === 'REFRESH_TOKEN') throw new ForbiddenException();
			throw new HttpException(error.message, error.status);
		}
	}

	getSecretTokenByRoutePath(path: string, token) {
		const refreshTokenRoutePath = ['/api/v1/auth/refresh-token'];
		const getSecretTokenByType = (tokenType: TokenType) => {
			return {
				tokenType,
				secretToken: this.configSerice.get<string>(`JWT_${tokenType}_SECRET`),
			};
		};

		return refreshTokenRoutePath.some((refreshpath) =>
			new RegExp(refreshpath).test(path),
		)
			? getSecretTokenByType(ENUM_TOKEN_TYPE.REFRESH)
			: getSecretTokenByType(ENUM_TOKEN_TYPE.ACCESS);
	}

	async validateRefreshToken(refreshToken: string) {
		const userByRefreshToken = await this.userService.findByRefreshToken(
			refreshToken,
		);
		if (!userByRefreshToken) throw new NotFoundException();

		if (userByRefreshToken.status !== ENUM_STATUS.ACTIVE)
			throw new UnauthorizedException(
				await this.it8n.t('errors.alert_user_inactive'),
			);
	}

	determineUserActionByMethod = ({
		method,
		body,
		user,
		query,
	}: IUserRequest) => {
		const userInfo = convertInfoData(user);
		switch (method) {
			case 'POST':
				{
					body.created_by_user = user?.id;
					body.created_by_user_info = userInfo;
					body.updated_by_user = user?.id;
					body.updated_by_user_info = userInfo;
				}
				break;
			case 'DELETE':
				{
					body.deleted_by_user = user?.id;
					body.deleted_by_user_info = userInfo;
					query.deleted_by_user = user?.id;
				}
				break;
			case 'PATCH':
			case 'PUT':
				{
					body.updated_by_user = user?.id;
					body.updated_by_user_info = userInfo;
				}
				break;
			case 'GET': {
				query.created_by_user = user?.id;
			}
		}
	};
}
