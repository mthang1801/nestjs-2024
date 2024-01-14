import { Prop } from '@nestjs/mongoose';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import mongoose, { Document } from 'mongoose';
import SchemaCustom from '../abstract/schema-option';
import { AbstractType } from './types/abstract.type';
import { ENUM_STATUS } from '../constants';

@SchemaCustom({
	strict: false,
	timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export abstract class AbstractSchema {
	@Prop({ type: mongoose.Schema.Types.ObjectId, auto: true })
	@ApiPropertyOptional()
	readonly _id?: AbstractType.ObjectId;

	@Expose()
	@Transform(
		({ value }) => {
			return value.obj?._id?.toString() || value?.toString();
		},
		{ toClassOnly: true },
	)
	@ApiPropertyOptional({ example: '64f6f26b23fd90e5c897439b' })
	id?: string;

	@Prop({ type: String, maxlength: 255, index: 1 })
	@ApiPropertyOptional({ example: 'john doe' })
	name?: string;

	@Prop({ type: String, maxlength: 255, unique: 1 })
	@ApiPropertyOptional({ example: 'ABC123' })
	code?: string;

	@Prop({ type: String, default: ENUM_STATUS.ACTIVE })
	@ApiPropertyOptional({ example: 'ACTIVE' })
	status?: string;

	@Prop({ default: null })
	@ApiPropertyOptional({ example: null })
	deleted_at?: Date;

	@Prop({
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		excludeIndexes: true,
	})
	@ApiPropertyOptional({ example: '64f6f26b23fd90e5c897439b' })
	created_by_user?: AbstractType.ObjectId;

	@Prop({ type: mongoose.Schema.Types.Mixed })
	created_by_user_info?: any;

	@Prop({
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		excludeIndexes: true,
	})
	@ApiPropertyOptional({ example: '64f6f26b23fd90e5c897439b' })
	updated_by_user?: AbstractType.ObjectId;

	@Prop({ type: mongoose.Schema.Types.Mixed })
	updated_by_user_info?: any;

	@Prop({
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		excludeIndexes: true,
	})
	@ApiPropertyOptional({ example: '64f6f26b23fd90e5cP897439b' })
	deleted_by_user?: AbstractType.ObjectId;

	@Prop({ type: mongoose.Schema.Types.Mixed })
	deleted_by_user_info?: any;
}

export type AbstractDocument<T extends AbstractSchema> = Document & T;
