import { Export, ExportSchema } from '@app/common/schemas';
import { LibMongoModule } from '@app/shared';
import { LibExceljsModule } from '@app/shared/exceljs/exceljs.module';
import { Module, forwardRef } from '@nestjs/common';
import { LibClientModule } from '../client/client.module';
import { ExportRepository } from './export.repository';
import { ExportService } from './export.service';
import { LibFormAnswerModule } from '../form-answer/form-answer.module';

@Module({
	imports: [
		LibExceljsModule,
		forwardRef(() => LibClientModule),
		forwardRef(() => LibFormAnswerModule),
		LibMongoModule.forFeatureAsync({ name: Export.name, schema: ExportSchema }),
	],
	providers: [ExportService, ExportRepository],
	exports: [ExportService, ExportRepository],
})
export class LibExportModule {}
