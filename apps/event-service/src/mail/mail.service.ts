import { SetPasswordDto } from '@app/common/modules/auth/dto/update-password.dto';
import { SendMailForgetPasswordDto } from '@app/shared/mail/dto/forget-password.dto';
import { LibMailService } from '@app/shared/mail/mail.service';
import { Injectable, Logger } from '@nestjs/common';
import { MailDataRequired } from '@sendgrid/mail';

@Injectable()
export class MailService {
	logger = new Logger(MailService.name);
	constructor(private readonly mailService: LibMailService) {}
	async onSetPassword({ username, password }: SetPasswordDto) {
		this.logger.log('************ onSetPassword **************');
		return this.mailService.sendMailUpdatePassword({
			email: username,
			rawPassword: password,
		});
	}

	async onResetPassword({ email, redirect_url }: SendMailForgetPasswordDto) {
    this.logger.log('************ onResetPassword **************');
		return this.mailService.sendMailForgetPassword({
			email,
			redirect_url,
		});
	}

	async onSendEmail(template: MailDataRequired) {
    this.logger.log('************ onSendEmail **************');
    console.log(template)
		return this.mailService.send(template);
	}
}
