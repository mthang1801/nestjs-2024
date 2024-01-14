import {
	AbstractDocument,
	AbstractSchema,
	CommonConfig,
	ENUM_EXPORT_STATUS,
} from '@app/shared';
import SchemaCustom from '@app/shared/abstract/schema-option';
import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { ApiPropertyOptional } from '@nestjs/swagger';

@SchemaCustom({ collection: CommonConfig.CORE_MODULES.EXPORT.COLLECTION })
export class Export extends AbstractSchema {
	@Prop({ type: String, index: 1 })
	@ApiPropertyOptional()
	module: string;

	@Prop()
	@ApiPropertyOptional()
	session: string;

	@Prop({ type: String, enum: ENUM_EXPORT_STATUS })
	@ApiPropertyOptional({ type: String, enum: ENUM_EXPORT_STATUS })
	status: ENUM_EXPORT_STATUS;

	@Prop()
	@ApiPropertyOptional()
	part: number;

	@Prop()
	@ApiPropertyOptional()
	count: number;

	@Prop()
	@ApiPropertyOptional()
	query_params: string;

	@Prop({ type: Date })
	@ApiPropertyOptional()
	start_export_at: Date;

	@Prop({ type: Date })
	@ApiPropertyOptional()
	end_export_at: Date;
}

export type ExportDocument = AbstractDocument<Export>;

export const ExportSchema = SchemaFactory.createForClass(Export);
