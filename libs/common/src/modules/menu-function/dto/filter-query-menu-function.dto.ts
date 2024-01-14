import { AbstractFilterQueryDto } from '@app/shared/abstract/dto/abstract-filter-query.dto';
import { AbstractType } from '@app/shared/abstract/types/abstract.type';
import { convertSortStringToNumber } from '@app/shared/utils/function.utils';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class FilterQueryMenuFunctionDto extends AbstractFilterQueryDto {
	@IsOptional()
	@Transform(({ value }) => Number(value))
	max_level: number;

	@IsOptional()
	@Transform(({ value }) => value === 'true')
	display_status: string;

	from: string;

	@IsOptional()
	@IsString()
	inherited_global_roles: string;

	@IsOptional()
	@ApiPropertyOptional()
	sort_by = 'position';

	@IsOptional()
	@ApiPropertyOptional()
	sort_type: AbstractType.SortType = 'ASC';

	constructor() {
		super();
		this.setExcludedFields = ['max_level'];
		this.setSortFields = {
			[this.sort_by]: convertSortStringToNumber(this.sort_type),
		};
	}
}
