import { User } from '@app/common/schemas';
import { EXPORT_COLUMNS_CONFIG } from '@app/shared';
import { Exceljs } from '@app/shared/exceljs/types/exceljs.type';
import { IsOptional } from 'class-validator';

export class ExportFilePartDto {
	@IsOptional()
	query_params: string;

	@IsOptional()
	session: string;

	@IsOptional()
	module: Exceljs.ExportTemplateKeys;

	@IsOptional()
	part: number;

	@IsOptional()
	total_parts: number;

	@IsOptional()
	user: User;
}
