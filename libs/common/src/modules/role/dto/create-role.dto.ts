import { MenuFunction, Role } from '@app/common/schemas';
import { ENUM_STATUS } from '@app/shared';
import { AbstractCreateDto } from '@app/shared/abstract/dto/abstract-create.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRoleDto extends AbstractCreateDto implements Partial<Role> {
	@IsNotEmpty()
	@ApiProperty()
	@IsString()
	name: string;

	@IsOptional()
	@ApiProperty()
	@IsString()
	description: string;

	@IsNotEmpty()
	@ApiProperty()
	@IsString()
	@Transform(({ value }) => value.toUpperCase())
	code: string;

	@IsOptional()
	@ApiProperty()
	@IsEnum(ENUM_STATUS)
	status: ENUM_STATUS = ENUM_STATUS.ACTIVE;

	@IsNotEmpty()
	@IsString()
	inherited_global_role: string;

	@IsOptional()
	menu: any;

	flatten_menu?: MenuFunction[];
}
