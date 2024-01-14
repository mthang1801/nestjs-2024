import { CommonConfig } from '@app/shared';
import SchemaCustom from '@app/shared/abstract/schema-option';
import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { ApiPropertyOptional } from '@nestjs/swagger';
import mongoose, { Document } from 'mongoose';

@SchemaCustom({ collection: CommonConfig.CORE_MODULES.LOG.COLLECTION })
export class Log {
	@Prop()
	@ApiPropertyOptional()
	topic?: string;

	@Prop({ type: mongoose.Schema.Types.Mixed })
	@ApiPropertyOptional()
	request_body?: any;

	@Prop()
	@ApiPropertyOptional()
	request_query_params?: string;

	@Prop()
	@ApiPropertyOptional()
	request_method?: string;

	@Prop()
	@ApiPropertyOptional()
	request_url?: string;

	@Prop()
	@ApiPropertyOptional()
	response_status_code?: number;

	@Prop()
	@ApiPropertyOptional()
	response_message?: string;

	@Prop({ type: mongoose.Schema.Types.Mixed })
	@ApiPropertyOptional()
	response_data?: any;

	@Prop({ type: String })
	@ApiPropertyOptional()
	status?: string;

	@Prop()
	@ApiPropertyOptional()
	duration?: number;
}

export type LogDocument = Log & Document;
export const LogSchema = SchemaFactory.createForClass(Log);
