import { PartialType, PickType } from '@nestjs/swagger';
import { CreateRoleDto } from './create-role.dto';

export class UpdateRoleStatusDto extends PickType(PartialType(CreateRoleDto), [
	'status',
]) {}
