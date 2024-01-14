import { LibInfoDataModule } from '@app/common/modules/info-data/info-data.module';
import { Module } from '@nestjs/common';
import { InfoDataControler } from './info-data.controller';

@Module({
	imports: [LibInfoDataModule],
	controllers: [InfoDataControler],
})
export class InfoDataModule {}
