import { ResourceDocument } from '@app/common/schemas/resource.schema';
import { RolePermission } from '@app/common/schemas/role-permission.schema';
import { AbstractService, CommonConfig } from '@app/shared';
import { CommonConfigType } from '@app/shared/config/types';
import { IUserRequest } from '@app/shared/interfaces';
import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  forwardRef,
} from '@nestjs/common';
import { MenuFunctionService } from '../menu-function/menu-function.service';
import { ResourceRepository } from './resource.repository';

@Injectable()
export class ResourceService extends AbstractService<ResourceDocument> {
	logger = new Logger(ResourceService.name);
	constructor(
		readonly resourceRepository: ResourceRepository,
		@Inject(forwardRef(() => MenuFunctionService))
		private readonly menuFunctionService: MenuFunctionService,
	) {
		super(resourceRepository);
	}

	async create(req: IUserRequest) {
    const resourcesByModuleList = Object.values(CommonConfig.CORE_MODULES).map((({RESOURCE}) => RESOURCE))
		await Promise.all(
			resourcesByModuleList.map(
				async (resource: CommonConfigType.Resources) => {
					const payload = {
						name: resource,
						code: resource,
						description: resource,
						created_by_user: req.user.id,
						permissions: CommonConfig.CORE_MODULES[resource].PERMISSIONS,
					};
					const resourceResponse = await this._findOneAndUpdate(
						{ code: resource },
						payload,
						{
							upsert: true,
						},
					);
					await this.menuFunctionService.updatePermissionByResource(
						resourceResponse._id,
						CommonConfig.CORE_MODULES[resource].PERMISSIONS,
					);
				},
			),
		);
	}

	async findAll() {
		return this._findAll();
	}

	async getPermissionsByResource(resource): Promise<RolePermission[]> {
		if (!resource) return [];
		const resourceInfo = await this._findById(resource);
		if (!resourceInfo) {
			throw new BadRequestException(this.i18n.t('errors.invalid_resource'));
		}
		return resourceInfo.permissions;
	}
}
