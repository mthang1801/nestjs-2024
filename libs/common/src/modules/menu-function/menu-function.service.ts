import {
	MenuFunction,
	MenuFunctionDocument,
} from '@app/common/schemas/menu-function.schema';
import {
	AbstractService,
	ApiListResponseCustom,
	ENUM_STATUS,
} from '@app/shared';
import {
	BadRequestException,
	Inject,
	Injectable,
	Logger,
	forwardRef,
} from '@nestjs/common';
import { PipelineStage } from 'mongoose';
import { ResourceService } from '../resource/resource.service';
import { CreateMenuFunctionDto } from './dto/create-menu-function.dto';
import { FilterQueryMenuFunctionDto } from './dto/filter-query-menu-function.dto';
import { UpdateMenuFunctionDto } from './dto/update-menu-function.dto copy';
import { UpdateStatusMenuFunctionDto } from './dto/update-status-menu-function.dto';
import { MenuFunctionRepository } from './menu-function.repository';
import { RolePermission } from '@app/common/schemas/role-permission.schema';
import * as migratedData from '../../data/menu-function.json';
import { IUserRequest } from '@app/shared/interfaces';
@Injectable()
export class MenuFunctionService extends AbstractService<MenuFunctionDocument> {
	logger = new Logger(MenuFunctionService.name);

	constructor(
		readonly menuFunctionRepository: MenuFunctionRepository,
		@Inject(forwardRef(() => ResourceService))
		private readonly resourceService: ResourceService,
	) {
		super(menuFunctionRepository);
	}

	async create(createMenuFunctionDto: CreateMenuFunctionDto) {
		await this.validateCreateMenuFunction(createMenuFunctionDto);

		const payloadToSave: Partial<MenuFunction> = {
			...createMenuFunctionDto,
			permissions: await this.resourceService.getPermissionsByResource(
				createMenuFunctionDto.resource,
			),
			level: 0,
		};

		if (createMenuFunctionDto.parent) {
			const parent = await this.findParentById(createMenuFunctionDto.parent);
			payloadToSave.level = parent.level + 1;
		}

		return await this._create(payloadToSave as any);
	}

	async update(id: string, updateMenuFunctionDto: UpdateMenuFunctionDto) {
		await this.validateUpdateMenuFunction(id, updateMenuFunctionDto);
		const payloadToSave: Partial<MenuFunction> = {
			...updateMenuFunctionDto,
			permissions:
				updateMenuFunctionDto?.resource &&
				(await this.resourceService.getPermissionsByResource(
					updateMenuFunctionDto.resource,
				)),
		};

		if (updateMenuFunctionDto.parent) {
			const parent = await this.findParentById(updateMenuFunctionDto.parent);
			payloadToSave.level = parent.level + 1;
		}

		return await this._findByIdAndUpdate(id, payloadToSave);
	}

	async updateStatus(id: string, { status }: UpdateStatusMenuFunctionDto) {
		return await this._findByIdAndUpdate(id, {
			$set: { status },
		});
	}

	async findById(id: string) {
		return this._findById(id);
	}

	@ApiListResponseCustom({
		summary: 'Danh sách menu',
		responseType: MenuFunction,
	})
	async findAll(query: FilterQueryMenuFunctionDto) {
		this.logger.log('************ findAll *************');
		return await this.menuFunctionRepository._aggregateFindAllRecursion(query);
	}

	stageFindParentWhenIsChild(): Array<
		| PipelineStage.AddFields
		| PipelineStage.Group
		| PipelineStage.Project
		| PipelineStage.Unwind
	> {
		return [
			{
				$group: {
					_id: '$level',
					data: { $push: '$$ROOT' },
				},
			},
		];
	}

	async validateCreateMenuFunction(
		createMenuFunctionDto: CreateMenuFunctionDto,
	) {
		const menuFunctionExists = await this._findOne({
			code: createMenuFunctionDto.code,
		});
		if (menuFunctionExists) {
			throw new BadRequestException(
				await this.i18n.translate('errors.unique_code_exists', {
					args: { code: 'Code' },
				}),
			);
		}
	}

	async findParentById(parentId: string) {
		const parent = await this._findById(parentId);
		if (!parent) {
			throw new BadRequestException(
				await this.i18n.t('errors.data_not_found.', {
					args: { data: parentId },
				}),
			);
		}
		return parent;
	}

	async validateUpdateMenuFunction(
		id: string,
		updateMenuFunctionDto: UpdateMenuFunctionDto,
	) {
		if (updateMenuFunctionDto.code) {
			const checkMenuFunctionCodeExists = await this._findOne({
				code: updateMenuFunctionDto.code,
				_id: { $ne: id },
			});
			if (checkMenuFunctionCodeExists) {
				throw new BadRequestException(
					await this.i18n.translate('errors.unique_code_exists', {
						args: { code: 'Code' },
					}),
				);
			}
		}

		if (updateMenuFunctionDto.parent) {
			const [currentMenuFunctionHasChildren, parent] = await Promise.all([
				this._findOne({ parent: id }),
				this._findById(updateMenuFunctionDto.parent),
			]);
			if (currentMenuFunctionHasChildren || parent.level > 0)
				throw new BadRequestException(
					await this.i18n.translate('errors.menu_funcion_unable_update', {
						args: { code: updateMenuFunctionDto.code },
					}),
				);
		}
	}

	async updatePermissionByResource(
		resource: string,
		permissions: RolePermission[],
	) {
		await this.primaryModel.updateMany({ resource }, { $set: { permissions } });
	}

	flattenMenu(menu: MenuFunction[], response = []): MenuFunction[] {
		this.logger.log('*********** flatten Menu ***********');
		menu.forEach((menuItem) => {
			response.push(menuItem);
			if (menuItem?.children?.length) {
				this.flattenMenu(menuItem.children, response);
			}
		});
		return response;
	}

	async migrateData(req: IUserRequest) {
		const data = migratedData;
    //TODO: Tạo resource
    await this.resourceService.create(req)
    //TODO: Update menu function
		for (const item of data) {
			const parentPromise =
				item.parent_code && this._findOne({ code: item.parent_code });
			const resourcePromise =
				item.resouce_code &&
				this.resourceService._findOne({ code: item.resouce_code });

			const [parent, resource] = await Promise.all(
				[parentPromise, resourcePromise].filter(Boolean),
			);

			delete item.parent_code;
			delete item.resouce_code;

			const payloadData = new CreateMenuFunctionDto({
				...item,
				parent: parent?._id,
				resource: resource?._id,
				status: ENUM_STATUS.ACTIVE,
			});
			await this.create(payloadData);
		}
	}
}
