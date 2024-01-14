import { IsNotEmpty } from 'class-validator';
import { CreateExportFileDto } from './create-export.dto';
import { ApiProperty } from '@nestjs/swagger';

export class ImplementExportDto extends CreateExportFileDto {
	@IsNotEmpty()
	@ApiProperty()
	session: string;
}
