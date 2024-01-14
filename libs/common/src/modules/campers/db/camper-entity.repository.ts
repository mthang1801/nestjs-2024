import { BaseEntityRepository, ENUM_CONNECTION_NAME } from '@app/shared';
import { CamperSchema } from './camper.schema';
import { Camper } from '../Camper';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CamperSchemaFactory } from './camper-schema.factory';

@Injectable()
export class CamperEntityRepository extends BaseEntityRepository<
	CamperSchema,
	Camper
> {
	constructor(
		@InjectModel(CamperSchema.name, ENUM_CONNECTION_NAME.PRIMARY)
		camperModel: Model<CamperSchema>,
		@InjectModel(CamperSchema.name, ENUM_CONNECTION_NAME.SECONDARY)
		camperSecondaryModel: Model<CamperSchema>,
		camperSchemaFactory: CamperSchemaFactory,
	) {
		super(camperModel, camperSecondaryModel, camperSchemaFactory);
	}
}
