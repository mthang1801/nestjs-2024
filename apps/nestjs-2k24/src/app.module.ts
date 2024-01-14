import { LibCoreModule } from '@app/common';
import { Module } from '@nestjs/common';
import { CamperModule } from './campers/campers.module';

@Module({
	imports: [LibCoreModule, CamperModule],
})
export class AppModule {}
