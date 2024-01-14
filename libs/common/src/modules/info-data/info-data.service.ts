import { MenuFunctionService } from '@app/common/modules/menu-function/menu-function.service';
import { ResourceService } from '@app/common/modules/resource/resource.service';
import { RoleService } from '@app/common/modules/role/role.service';
import { UserService } from '@app/common/modules/user/user.service';
import { AbstractService } from '@app/shared';
import { AbstractType } from '@app/shared/abstract/types/abstract.type';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class InfoDataService {
	logger = new Logger(InfoDataService.name);
	constructor(
		private readonly userService: UserService,
		private readonly roleService: RoleService,
		private readonly menuFunctionService: MenuFunctionService,
		private readonly resourceService: ResourceService,
	) {}

	async onSaveInfo({ id, modelName }: AbstractType.SaveInfoPayload) {
		this.logger.log('*************** onSaveInfo **************** ');
		console.log(modelName);
		return await this.getServiceByModel(modelName)._saveInfo(id);
	}

	async onRemoveInfo({ id, modelName }: AbstractType.SaveInfoPayload) {
		return await this.getServiceByModel(modelName)._removeInfo(id);
	}

	getServiceByModel(modelName: string): AbstractService<any> {
		this.logger.log('*************** getServiceByModel **************** ');
		switch (modelName) {
			case 'User':
				return this.userService;
			case 'Role':
				return this.roleService;
			case 'MenuFunction':
				return this.menuFunctionService;
			case 'Resource':
				return this.resourceService;
		}
	}
}
