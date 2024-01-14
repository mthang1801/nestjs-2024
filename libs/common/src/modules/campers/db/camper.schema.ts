import { AbstractSchema } from '@app/shared';
import SchemaCustom from '@app/shared/abstract/schema-option';
import { Prop } from '@nestjs/mongoose';

@SchemaCustom({ collection: 'campers', versionKey: false })
export class CamperSchema extends AbstractSchema {
	@Prop()
	readonly age: number;

	@Prop()
	readonly allergies: string[];
}
