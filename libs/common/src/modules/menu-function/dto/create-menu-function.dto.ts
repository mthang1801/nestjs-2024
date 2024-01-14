import { ENUM_STATUS } from '@app/shared';
import { AbstractCreateDto } from '@app/shared/abstract/dto/abstract-create.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsArray,
	IsBoolean,
	IsMongoId,
	IsNotEmpty,
	IsOptional,
	IsString,
	MaxLength,
	MinLength,
} from 'class-validator';

export class CreateMenuFunctionDto extends AbstractCreateDto {
	@ApiProperty()
	@IsNotEmpty()
	@IsString()
	@MinLength(3)
	@MaxLength(255)
	name: string;

	@ApiProperty()
	@IsNotEmpty()
	code: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsMongoId()
	parent: string;

	@ApiPropertyOptional()
	@IsOptional()
	description: string;

	@ApiPropertyOptional()
	@IsOptional()
	fe_route: string;

	@ApiPropertyOptional({
		type: Boolean,
		default: false,
	})
	@IsBoolean()
	display_status: boolean;

	@ApiPropertyOptional()
	@IsOptional()
	status: ENUM_STATUS = ENUM_STATUS.ACTIVE; 

	@ApiPropertyOptional()
	@IsOptional()
	resource: any;

	@ApiPropertyOptional()
	@IsOptional()
	position?: number;

	@ApiPropertyOptional()
	@IsArray()
	@IsNotEmpty()
	inherited_global_roles: string[];

	constructor(payload: CreateMenuFunctionDto) {
		super();
		Object.assign(this, payload);
	}
}
