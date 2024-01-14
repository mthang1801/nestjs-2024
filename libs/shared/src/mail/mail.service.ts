import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectSendGrid, SendGridService } from '@ntegral/nestjs-sendgrid';
import { MailDataRequired } from '@sendgrid/mail';
import { I18nService } from 'nestjs-i18n';
import { SendMailCreateUserDto } from './dto/create-user.dto';
import { SendMailForgetPasswordDto } from './dto/forget-password.dto';

@Injectable()
export class LibMailService {
	constructor(
		@InjectSendGrid() private readonly sendGridService: SendGridService,
		private readonly i18n: I18nService,
		private readonly configService: ConfigService,
	) {}

	async sendCreatedUser({ email, rawPassword }: SendMailCreateUserDto) {
		const mail = this.mailTemplate({
			to: email,
			subject: await this.i18n.t('messages.MAIL.CREATED'),
			html: await this.i18n.t('mail.CREATED_USER', { args: { rawPassword } }),
      from: this.configService.get<string>('SEND_GRID_EMAIL'),
		});

		return await this.sendGridService.send(mail);
	}

	async sendMailUpdatePassword({ email, rawPassword }: SendMailCreateUserDto) {
		const mail = this.mailTemplate({
			to: email,
			subject: await this.i18n.t('messages.MAIL.SET_PASSWORD'),
			html: await this.i18n.t('mail.SET_PASSWORD', {
				args: { rawPassword },
			}),
      from: this.configService.get<string>('SEND_GRID_EMAIL'),
		});

		return await this.send(mail);
	}

	async sendMailForgetPassword({
		email,
		redirect_url,
	}: SendMailForgetPasswordDto) {
		const mail = this.mailTemplate({
			to: email,
			subject: await this.i18n.t('messages.MAIL.FORGET_PASSWORD'),
			html: await this.i18n.t('mail.FORGET_PASSWORD', {
				args: { redirect_url },
			}),
      from: this.configService.get<string>('SEND_GRID_EMAIL'),
		});

		return await this.send(mail);
	}

	mailTemplate(properties: Partial<MailDataRequired>): MailDataRequired {
		return {
			...properties,
			from: this.configService.get<string>('SEND_GRID_EMAIL'),
		} as MailDataRequired;
	}

	async send(template: MailDataRequired, isMultiple = false) {
		return this.sendGridService.send(
			{
				...template,
				from: this.configService.get<string>('SEND_GRID_EMAIL'),
			},
			isMultiple,
		);
	}
}
