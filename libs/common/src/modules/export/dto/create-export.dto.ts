import { EXPORT_COLUMNS_CONFIG } from '@app/shared';
import { Exceljs } from '@app/shared/exceljs/types/exceljs.type';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateExportFileDto {
	@IsNotEmpty()
	@IsOptional()
	@ApiProperty()
	module: Exceljs.ExportTemplateKeys;

	@IsOptional()
	@ApiPropertyOptional()
	query_params: string;

	@IsOptional()
	@ApiPropertyOptional()
	extensions?: Exceljs.ExcelExtension;

	@IsOptional()
	@ApiPropertyOptional()
	total_parts: number = 1;
}
