import { Resource, ResourceDocument } from '@app/common/schemas';
import { AbstractRepository, ENUM_CONNECTION_NAME } from '@app/shared';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class ResourceRepository extends AbstractRepository<ResourceDocument> {
	logger = new Logger(ResourceRepository.name);
	constructor(
		@InjectModel(Resource.name, ENUM_CONNECTION_NAME.PRIMARY)
		readonly primaryModel: Model<ResourceDocument>,
		@InjectModel(Resource.name, ENUM_CONNECTION_NAME.SECONDARY)
		readonly secondaryModel: Model<ResourceDocument>,
	) {
		super({
			primaryModel,
			secondaryModel,
		});
	}
}
