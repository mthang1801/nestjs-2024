import SchemaCustom from '@app/shared/abstract/schema-option';
import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Document } from 'mongoose';
import { ENUM_STATUS } from '@app/shared/constants/enum';

@SchemaCustom({ versionKey: false, _id: false, timestamps: false })
export class RolePermission {
	@Prop()
	@ApiPropertyOptional({ example: 'VIEW_LIST' })
	permission: string;

	@Prop({ type: String, enum: ENUM_STATUS, default: ENUM_STATUS.INACTIVE })
	@ApiPropertyOptional({
		type: String,
		enum: ENUM_STATUS,
		default: ENUM_STATUS.INACTIVE,
    example : ENUM_STATUS.INACTIVE
	})
	status: string;

	@ApiPropertyOptional({ type: String, example: 'Xem danh sách' })
	name: string;
}

export type RolePermissionDocument = Document & RolePermission;

export const RolePermissionSchema =
	SchemaFactory.createForClass(RolePermission);
