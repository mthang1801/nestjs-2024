import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsMongoId, IsNotEmpty } from 'class-validator';

export class AssignRoleDto {
	@ArrayNotEmpty()
	@IsMongoId({ each: true })
	@ApiProperty({ type: [String] })
	users: string[];

	@IsNotEmpty()
  @IsMongoId()
	role: string;
}
