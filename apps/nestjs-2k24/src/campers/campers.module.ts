import { LibCamperModule } from '@app/common/modules/campers/camper.module';
import { CamperSchemaFactory } from '@app/common/modules/campers/db/camper-schema.factory';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CamperEventHandlers } from '../events';
import { CamperController } from './camper.controller';
import { CamperFactory } from './camper.factory';
import { CamperCammandHandlers } from './commands';
@Module({
	imports: [
		CqrsModule,
    LibCamperModule
	],
	controllers: [CamperController],
	providers: [
		CamperFactory,
		CamperSchemaFactory,
		...CamperCammandHandlers,
		...CamperEventHandlers,
	],
})
export class CamperModule {}
