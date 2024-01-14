import { IsEmail, IsNotEmpty } from 'class-validator';

export class SendMailForgetPasswordDto {
	@IsNotEmpty()
	@IsEmail()
	email: string;

	@IsNotEmpty()
	redirect_url?: string;
}
