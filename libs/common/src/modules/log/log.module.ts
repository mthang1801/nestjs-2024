import { Log, LogSchema } from '@app/common/schemas/log.schema';
import { LibMongoModule } from '@app/shared/mongodb';
import { Global, Module, forwardRef } from '@nestjs/common';
import { LibCoreModule } from '../core/core.module';
import { LogRepository } from './log.repository';
import { LogService } from './log.service';

@Global()
@Module({
	imports: [
		forwardRef(() => LibCoreModule),
		LibMongoModule.forFeatureAsync({ name: Log.name, schema: LogSchema }),
	],
	providers: [LogService, LogRepository],
	exports: [LogService, LogRepository],
})
export class LibLogModule {}
