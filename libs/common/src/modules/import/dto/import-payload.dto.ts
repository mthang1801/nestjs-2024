import { User } from '@app/common/schemas';
import { CommonConfig } from '@app/shared';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class ImportPayloadDto {
	@IsNotEmpty()
	@ApiProperty({ type: String, example: 'Client' })
	module: keyof typeof CommonConfig.IMPORT_MODULE;

	@IsNotEmpty()
	@ApiProperty({ type: 'String', format: 'binary' })
	file: any;

	@IsOptional()
	created_by_user: User;
}
