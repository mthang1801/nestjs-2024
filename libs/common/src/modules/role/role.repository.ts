import { Role, RoleDocument } from '@app/common/schemas/role.schema';
import { AbstractRepository, ENUM_CONNECTION_NAME } from '@app/shared';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class RoleRepository extends AbstractRepository<RoleDocument> {
	logger = new Logger(RoleRepository.name);
	constructor(
		@InjectModel(Role.name, ENUM_CONNECTION_NAME.PRIMARY)
		readonly primaryModel: Model<RoleDocument>,
		@InjectModel(Role.name, ENUM_CONNECTION_NAME.SECONDARY)
		readonly secondaryModel: Model<RoleDocument>,
	) {
		super({ primaryModel, secondaryModel });
	}
}
