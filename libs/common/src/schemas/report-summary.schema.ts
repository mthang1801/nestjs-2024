import SchemaCustom from '@app/shared/abstract/schema-option';
import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Document } from 'mongoose';

@SchemaCustom({ timestamps: false })
export class ReportSummary {
	@Prop({ type: [String], index: 1 })
	@ApiPropertyOptional()
	client_email_form_answer_list: string[];

	@Prop({ type: Number, default: 0 })
	@ApiPropertyOptional()
	client_visit_page_count: number;
}

export type ReportSummaryDocument = Document & ReportSummary;
export const ReportSummarySchema = SchemaFactory.createForClass(ReportSummary);
