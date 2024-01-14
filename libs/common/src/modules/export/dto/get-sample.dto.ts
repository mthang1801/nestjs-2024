import { EXPORT_COLUMNS_CONFIG } from '@app/shared';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class GetSampleFileDto {
	@IsNotEmpty()
	@IsOptional()
	@ApiProperty({example : EXPORT_COLUMNS_CONFIG.ClientSample.name})
	module: keyof typeof EXPORT_COLUMNS_CONFIG;

	@IsOptional()
	@ApiPropertyOptional()
	query_params: string;
}
