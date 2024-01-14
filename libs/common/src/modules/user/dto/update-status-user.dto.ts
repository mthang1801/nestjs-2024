import { PartialType, PickType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class UpdateStatusUserDto extends PickType(PartialType(CreateUserDto), [
	'status',
]) {}
