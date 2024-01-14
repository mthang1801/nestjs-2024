import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { RolePermission } from './role-permission.schema';
import SchemaCustom from '@app/shared/abstract/schema-option';
import {
	AbstractDocument,
	AbstractSchema,
} from '@app/shared/abstract/abstract.schema';
import { CommonConfig } from '@app/shared';

@SchemaCustom({ collection: CommonConfig.CORE_MODULES.RESOURCE.COLLECTION })
export class Resource extends AbstractSchema {
	@Prop()
	@ApiPropertyOptional({ example: 'CLIENT' })
	name: string;

	@Prop({ type: String })
	@ApiPropertyOptional({ example: 'CLIENT' })
	code: string;

	@Prop()
	@ApiPropertyOptional({ example: 'CLIENT' })
	description: string;

	@Prop()
	@ApiPropertyOptional()
	permissions: RolePermission[];
}

export type ResourceDocument = AbstractDocument<Resource>;

export const ResourceSchema = SchemaFactory.createForClass(Resource);
