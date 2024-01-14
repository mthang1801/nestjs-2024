import SchemaCustom from '@app/shared/abstract/schema-option';
import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Document } from 'mongoose';
import { ReportSummary, ReportSummarySchema } from './report-summary.schema';
import { startOfDay } from '@app/shared/utils/dates.utils';
import { CommonConfig } from '@app/shared';

@SchemaCustom({
	collection: CommonConfig.CORE_MODULES.REPORT.COLLECTION,
	autoIndex: true,
})
export class Report {
	@Prop({ type: Date, default: startOfDay(new Date()), unique: 1 })
	timestamp: Date;

	@Prop({ type: ReportSummarySchema, index: 1 })
	@ApiPropertyOptional({ type: ReportSummarySchema })
	@Type(() => ReportSummary)
	summary: ReportSummary;
}

export type ReportDocument = Document & Report;
export const ReportSchema = SchemaFactory.createForClass(Report);
