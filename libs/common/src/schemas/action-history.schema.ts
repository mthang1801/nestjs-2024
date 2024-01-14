import SchemaCustom from '@app/shared/abstract/schema-option';
import {
	ENUM_ACTION_LOG_DATA_SOURCE,
	ENUM_ACTION_TYPE,
} from '@app/shared/constants/enum';
import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { ApiPropertyOptional } from '@nestjs/swagger';
import mongoose from 'mongoose';
import { User } from './user.schema';
import { CommonConfig } from '@app/shared';

@SchemaCustom({
	collection: CommonConfig.CORE_MODULES.ACTION_HISTORY.COLLECTION,
	strict: false,
	autoIndex: true,
})
export class ActionHistory<T extends any, K extends any> {
	@Prop({ type: mongoose.Schema.Types.Mixed })
	new_data?: any;

	@Prop({ type: mongoose.Schema.Types.Mixed })
	old_data?: any;

	@Prop({ type: mongoose.Schema.Types.Mixed })
	custom_data?: K;

	@Prop({ type: mongoose.Schema.Types.Mixed })
	different_data?: any;

	@Prop({ index: 'text' })
	description?: string;

	@Prop({
		type: String,
		enum: ENUM_ACTION_LOG_DATA_SOURCE,
		default: ENUM_ACTION_LOG_DATA_SOURCE.SYSTEM,
		index: 1,
	})
	@ApiPropertyOptional({ example: 'SYSTEM' })
	data_source?: keyof typeof ENUM_ACTION_LOG_DATA_SOURCE;

	@Prop({
		type: String,
		enum: ENUM_ACTION_TYPE,
		default: ENUM_ACTION_TYPE.CREATE,
		index: 1,
	})
	@ApiPropertyOptional({
		type: String,
		enum: ENUM_ACTION_TYPE,
		example: ENUM_ACTION_TYPE.CREATE,
	})
	action_type?: keyof typeof ENUM_ACTION_TYPE;

	@Prop({ type: [String] })
	populates?: string[];

	@Prop({ type: [String] })
	exclusive_fields?: string[];

	@Prop({ type: String, index: 1 })
	collection_name?: string;

	@Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', index: 1 })
	@ApiPropertyOptional({ example: '651191feace06ac06ff0bcf5' })
	created_by_user?: any;

	@Prop({ type: mongoose.Schema.Types.Mixed })
	@ApiPropertyOptional({ type: User })
	created_by_user_info?: any;

	@ApiPropertyOptional()
	input_payload?: any;

	@ApiPropertyOptional({ example: 'participation_status: INACTIVE -> ACTIVE' })
	data_change?: any;

	@ApiPropertyOptional({ example: 'Cập nhật trả lời biểu mẫu' })
	action?: string;
}

export type ActionHistoryDocument = Document & ActionHistory<any, any>;

const ActionHistorySchema = SchemaFactory.createForClass(ActionHistory);

ActionHistorySchema.index({
	collection_name: 1,
	action_type: 1,
	status: 1,
	created_at: 1,
	data_source: 1,
	created_by_user: 1,
	updated_by_user: 1,
	deleted_by_user: 1,
});

export { ActionHistorySchema };
