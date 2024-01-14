import { AbstractCreateDto } from '@app/shared/abstract/dto/abstract-create.dto';
import { ENUM_GENDER, ENUM_STATUS } from '@app/shared/constants/enum';
import { MongoDB } from '@app/shared/mongodb/types/mongodb.type';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
	IsDate,
	IsEmail,
	IsEnum,
	IsMongoId,
	IsNotEmpty,
	IsOptional,
	IsPhoneNumber,
	IsString,
	MaxLength,
	ValidateNested,
} from 'class-validator';
import { ContactDTO } from './contact.dto';

export class CreateUserDto extends AbstractCreateDto {
	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	@MaxLength(255)
	name: string;

	@ApiProperty()
	@IsNotEmpty()
	@IsEmail()
	email: string;

	@ApiProperty()
	@IsNotEmpty()
	@IsPhoneNumber('VN', { each: true })
	phone: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	avatar: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsDate()
	dob: Date;

	@ApiPropertyOptional()
	@IsOptional()
	@IsEnum(ENUM_GENDER)
	gender: ENUM_GENDER;

	@ApiPropertyOptional({ type: String, enum: ENUM_STATUS })
	@IsOptional()
	@IsEnum(ENUM_STATUS)
	status: ENUM_STATUS = ENUM_STATUS.ACTIVE;

	@ApiPropertyOptional()
	@IsOptional()
	@ValidateNested({ each: true })
	@Type(() => ContactDTO)
	contact: ContactDTO[];

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	@MaxLength(32)
	password: string;

	@ApiPropertyOptional()
	@IsNotEmpty()
	@IsMongoId()
	role: MongoDB.MongoId;

	role_change_status?: boolean;
}
