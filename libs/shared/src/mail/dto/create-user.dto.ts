import { IsNotEmpty, IsOptional } from 'class-validator';

export class SendMailCreateUserDto {
	@IsOptional()
	fullName?: string;

	@IsNotEmpty()
	email: string;

	@IsNotEmpty()
	rawPassword: string;
}
