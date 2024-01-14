import {
	IsArray,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
} from 'class-validator';

export class CreateCamperRequestDto {
	@IsNotEmpty()
	name: string;

	@IsOptional()
	@IsNumber()
	age: number;

	@IsArray()
	@IsString({ each: true })
	allergies: string[];
}
