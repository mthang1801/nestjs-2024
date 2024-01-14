import { Module } from '@nestjs/common';
import { LibCoreModule } from '../core/core.module';
import { LibMenuFunctionModule } from '../menu-function/menu-function.module';
import { LibResourceModule } from '../resource/resource.module';
import { LibRoleModule } from '../role/role.module';
import { LibUserModule } from '../user';
import { InfoDataService } from './info-data.service';

@Module({
	imports: [
		LibCoreModule,
		LibUserModule,
		LibRoleModule,
		LibResourceModule,
		LibMenuFunctionModule,
	],
	controllers: [],
	providers: [InfoDataService],
	exports: [InfoDataService],
})
export class LibInfoDataModule {}
