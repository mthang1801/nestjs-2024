import { PartialType, PickType } from '@nestjs/swagger';
import { CreateMenuFunctionDto } from './create-menu-function.dto';

export class UpdateStatusMenuFunctionDto extends PickType(
	PartialType(CreateMenuFunctionDto),
	['status'],
) {}
