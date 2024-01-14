import { IEntitySchemaFactory } from '@app/shared/abstract/interfaces';
import { Injectable } from '@nestjs/common';
import { Camper } from '../Camper';
import { CamperSchema } from './camper.schema';
import { Types } from 'mongoose';
@Injectable()
export class CamperSchemaFactory
	implements IEntitySchemaFactory<CamperSchema, Camper>
{
	create(camper: Camper): CamperSchema {
		return {
			_id: new Types.ObjectId(camper.getId()),
			age: camper.getAge(),
			name: camper.getName(),
			allergies: camper.getAllergies(),
		};
	}
  
	createFromSchema(camperSchema: CamperSchema): Camper {
		return new Camper(
			camperSchema._id.toHexString(),
			camperSchema.name,
			camperSchema.age,
			camperSchema.allergies,
		);
	}
}
