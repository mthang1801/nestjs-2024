import {
  ENUM_ACTION_LOG_DATA_SOURCE,
  ENUM_ACTION_TYPE,
} from '@app/shared/constants/enum';
import { endOfDay, startOfDay } from '@app/shared/utils/dates.utils';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional } from 'class-validator';

export class ActionHistoryFilterQueryDto {
	@IsOptional()
	@ApiPropertyOptional()
	collection_name?: string;

	@IsOptional()
	@ApiPropertyOptional()
	@IsEnum(ENUM_ACTION_TYPE)
	action_type?: ENUM_ACTION_TYPE;

	@IsOptional()
	@ApiPropertyOptional()
	@IsEnum(ENUM_ACTION_LOG_DATA_SOURCE)
	data_source?: ENUM_ACTION_LOG_DATA_SOURCE;

	@IsOptional()
	@ApiPropertyOptional()
	created_by_user?: string;

	@IsOptional()
	@Transform(({ value }) => Number(value))
	page: number;

	@IsOptional()
	@Transform(({ value }) => Number(value))
	limit: number;

	@IsOptional()
	@Transform(({ value }) => value.trim())
	q: string;

	@IsOptional()
	@Transform(({ value }) => startOfDay(value))
	from_date: Date;

	@IsOptional()
	@Transform(({ value }) => endOfDay(value))
	to_date: Date;
}
