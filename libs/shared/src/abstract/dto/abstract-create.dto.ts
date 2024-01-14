import { ENUM_STATUS } from '@app/shared/constants';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

export class AbstractCreateDto {
	@IsOptional()
	@ApiPropertyOptional()
	name?: string;

	@IsOptional()
	@ApiPropertyOptional()
	code?: string;

	@ApiPropertyOptional({
		type: String,
		enum: ENUM_STATUS,
		example: ENUM_STATUS.ACTIVE,
	})
	@IsOptional()
	status: ENUM_STATUS | any;

	@IsOptional()
	created_by_user?: string;

	@IsOptional()
	updated_by_user?: string;

	@IsOptional()
	deleted_by_user?: string;

	@IsOptional()
	created_by_user_info?: any;

	@IsOptional()
	updated_by_user_info?: any;

	@IsOptional()
	deleted_by_user_info?: any;
}
