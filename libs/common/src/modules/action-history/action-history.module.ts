import { ActionHistory, ActionHistorySchema } from '@app/common/schemas/action-history.schema';
import { LibMongoModule } from '@app/shared/mongodb';
import { Global, Module, forwardRef } from '@nestjs/common';
import { LibCoreModule } from '../core/core.module';
import { ActionHistoryRepository } from './action-history.repository';
import { ActionHistoryService } from './action-history.service';

@Global()
@Module({
	imports: [
		forwardRef(() => LibCoreModule),
		LibMongoModule.forFeatureAsync({
			name: ActionHistory.name,
			schema: ActionHistorySchema,
		}),
	],
	controllers: [],
	providers: [ActionHistoryService, ActionHistoryRepository],
	exports: [ActionHistoryService, ActionHistoryRepository],
})
export class LibActionHistoryModule {}
