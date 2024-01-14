import {
  MenuFunction,
  MenuFunctionDocument,
} from '@app/common/schemas/menu-function.schema';
import { AbstractRepository, ENUM_CONNECTION_NAME } from '@app/shared';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class MenuFunctionRepository extends AbstractRepository<MenuFunctionDocument> {
	logger = new Logger(MenuFunctionRepository.name);
	constructor(
		@InjectModel(MenuFunction.name, ENUM_CONNECTION_NAME.PRIMARY)
		readonly primaryModel: Model<MenuFunctionDocument>,
		@InjectModel(MenuFunction.name, ENUM_CONNECTION_NAME.SECONDARY)
		readonly secondaryModel: Model<MenuFunctionDocument>,
	) {
		super({ primaryModel, secondaryModel });
	}

	async _aggregateFindAllRecursion(query) {
		const setProjectFields = {
			_id: 1,
			name: 1,
			code: 1,
			children: 1,
			level: 1,
			parent: 1,
			position: 1,
			permissions: 1,
			inherited_global_roles: 1,
			resource: 1,
			resource_info: 1,
			fe_route: 1,
			display_status: 1,
		};
		return this.aggregateFindAllRecursion(query, setProjectFields);
	}
}
