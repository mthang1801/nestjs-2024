import { CommonConfig } from '@app/shared';
import {
	AbstractDocument,
	AbstractSchema,
} from '@app/shared/abstract/abstract.schema';
import SchemaCustom from '@app/shared/abstract/schema-option';
import { ENUM_STATUS } from '@app/shared/constants/enum';
import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { MenuFunction, MenuFunctionSchema } from './menu-function.schema';

@SchemaCustom({ collection: CommonConfig.CORE_MODULES.ROLE.COLLECTION, versionKey: 'v' })
export class Role extends AbstractSchema {
	@Prop({ maxlength: 255 })
	@ApiPropertyOptional({ example: 'John Doe' })
	name: string;

	@Prop({ type: String, unique: true, required: true })
	@ApiPropertyOptional({ example: 'John Doe' })
	code: string;

	@Prop({ maxlength: 255 })
	@ApiPropertyOptional({ example: 'John Doe' })
	description: string;

	@Prop({ type: String, enum: ENUM_STATUS, default: ENUM_STATUS.ACTIVE })
	@ApiPropertyOptional({ type: String, example: 'INACTIVE' })
	status: string;

	@Prop({ type: String })
	@ApiPropertyOptional()
	inherited_global_role: string;

	@Prop({ type: [{ type: MenuFunctionSchema }], excludeIndexes: true })
	@Type(() => MenuFunction)
	menu: MenuFunction[];

	@Prop({ type: [{ type: MenuFunctionSchema }], excludeIndexes: true })
	@Type(() => MenuFunction)
	flatten_menu: MenuFunction[];
}

export type RoleDocument = AbstractDocument<Role>;

export const RoleSchema = SchemaFactory.createForClass(Role);
