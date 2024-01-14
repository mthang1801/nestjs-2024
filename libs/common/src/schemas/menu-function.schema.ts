import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import mongoose, { Types } from 'mongoose';
import { CommonConfig } from '@app/shared';
import {
	AbstractDocument,
	AbstractSchema,
} from '@app/shared/abstract/abstract.schema';
import SchemaCustom from '@app/shared/abstract/schema-option';
import { ENUM_STATUS } from '@app/shared/constants/enum';
import { Resource } from './resource.schema';
import { RolePermission, RolePermissionSchema } from './role-permission.schema';

@SchemaCustom({ collection: CommonConfig.CORE_MODULES.MENU_FUNCTION.COLLECTION })
export class MenuFunction extends AbstractSchema {
	@ApiPropertyOptional()
	@Prop({ index: 1 })
	name: string;

	@ApiPropertyOptional()
	@Prop({ unique: 1 })
	code?: string;

	@ApiPropertyOptional()
	@Prop()
	level?: number;

	@ApiPropertyOptional({
		description: 'Áp dụng cho level cụ thể theo role',
	})
	@Prop({ type: [String], index: 1 })
	inherited_global_roles?: string[];

	@ApiPropertyOptional()
	@Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'MenuFunction' })
	parent: MenuFunction | string | Types.ObjectId;

	@ApiPropertyOptional()
	@Prop()
	description?: string;

	@ApiPropertyOptional()
	@Prop()
	fe_route?: string;

	@ApiPropertyOptional({
		type: String,
		enum: ENUM_STATUS,
		default: ENUM_STATUS.INACTIVE,
	})
	@Prop({ type: String, enum: ENUM_STATUS, default: ENUM_STATUS.INACTIVE })
	status?: string;

	@ApiPropertyOptional({
		type: Boolean,
		default: false,
	})
	@Prop({ type: Boolean, default: true })
	display_status?: boolean;

	@Prop({ type: Number, default: 0 })
	@ApiPropertyOptional()
	position?: number;

	@ApiPropertyOptional()
	@Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Resource' })
	@Type(() => Resource)
	resource?: Resource | string;

	@ApiPropertyOptional()
	@Prop({ type: mongoose.Schema.Types.Mixed })
	resource_info?: Resource | string;

	@ApiPropertyOptional()
	@Prop({ type: [RolePermissionSchema] })
	@Type(() => RolePermission)
	permissions?: RolePermission[];
  
  children?: MenuFunction[];
}

export type MenuFunctionDocument = AbstractDocument<MenuFunction>;

export const MenuFunctionSchema = SchemaFactory.createForClass(MenuFunction);
