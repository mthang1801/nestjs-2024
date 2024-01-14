import { LibMailModule } from '@app/shared/mail/mail.module';
import { Module } from '@nestjs/common';
import { MailController } from './mail.controller';
import { MailService } from './mail.service';

@Module({
	imports: [LibMailModule],
  controllers: [MailController],
  providers : [MailService]
})
export class MailModule {}
