import { LibExceljsModule } from '@app/shared/exceljs/exceljs.module';
import { Module } from '@nestjs/common';
import { LibCoreModule } from '../core/core.module';
import { ImportService } from './import.service';
import { LibClientModule } from '../client/client.module';

@Module({
	imports: [LibCoreModule, LibExceljsModule, LibClientModule],
	providers: [ImportService],
	exports: [ImportService],
})
export class LibImportModule {}
