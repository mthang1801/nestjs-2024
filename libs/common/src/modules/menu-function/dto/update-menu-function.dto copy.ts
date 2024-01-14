import { PartialType } from '@nestjs/swagger';
import { CreateMenuFunctionDto } from './create-menu-function.dto';

export class UpdateMenuFunctionDto extends PartialType(CreateMenuFunctionDto) {}
