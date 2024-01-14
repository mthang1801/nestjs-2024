import { Role } from '@app/common/schemas';
import { AbstractFilterQueryDto } from '@app/shared/abstract/dto/abstract-filter-query.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class RoleFilterQueryDto
	extends AbstractFilterQueryDto
	implements Partial<Role>
{
	@IsOptional()
	@ApiPropertyOptional()
	inherited_global_role?: string;
}
