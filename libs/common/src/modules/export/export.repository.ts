import {
  Export,
  ExportDocument
} from '@app/common/schemas';
import { AbstractRepository, ENUM_CONNECTION_NAME } from '@app/shared';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class ExportRepository extends AbstractRepository<ExportDocument> {
	logger = new Logger(ExportRepository.name);
	constructor(
		@InjectModel(Export.name, ENUM_CONNECTION_NAME.PRIMARY)
		readonly primaryModel: Model<ExportDocument>,
		@InjectModel(Export.name, ENUM_CONNECTION_NAME.SECONDARY)
		readonly secondaryModel: Model<ExportDocument>,
	) {
		super({ primaryModel, secondaryModel });
	}
}
