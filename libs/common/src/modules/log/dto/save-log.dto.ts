import { Log } from '@app/common/schemas';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class SaveLogDto implements Log {
	@IsOptional()
	@ApiPropertyOptional()
	topic?: string;

	@IsOptional()
	@ApiPropertyOptional()
	request_body?: any;

	@IsOptional()
	@ApiPropertyOptional()
	request_query_params?: string;

	@IsOptional()
	@ApiPropertyOptional()
	request_method?: string;

	@IsOptional()
	@ApiPropertyOptional()
	request_url?: string;

	@IsOptional()
	@ApiPropertyOptional()
	response_status_code?: number;

	@IsOptional()
	@ApiPropertyOptional()
	response_message?: string;

	@IsOptional()
	@ApiPropertyOptional()
	response_data?: any;

	@IsOptional()
	@ApiPropertyOptional()
	status?: string;

	@IsOptional()
	@ApiPropertyOptional()
	duration?: number;
}
