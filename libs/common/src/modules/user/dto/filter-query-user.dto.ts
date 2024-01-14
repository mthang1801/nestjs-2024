import { ENUM_GENDER } from '@app/shared';
import { AbstractFilterQueryDto } from '@app/shared/abstract/dto/abstract-filter-query.dto';
import { ApiPropertyOptional, ApiResponseProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

export class UserFilterQueryDto extends AbstractFilterQueryDto {
	//NOTE: Định nghĩa fields nào cần filter
	@IsOptional()
	@ApiPropertyOptional()
	@IsEnum(ENUM_GENDER)
	gender: ENUM_GENDER;

	@IsOptional()
	@ApiPropertyOptional()
	role: string;

	@IsOptional()
	@ApiPropertyOptional()
	status: string;

	constructor(properties: Partial<UserFilterQueryDto>) {
		super(properties);
		//NOTE: Định nghĩa fields nào cần tìm kiếm
		this.setSearchFields = ['name', 'email', 'phone'];
	}
}
