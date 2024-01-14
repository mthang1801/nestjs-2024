import { Resource, ResourceSchema } from '@app/common/schemas';
import { LibMongoModule } from '@app/shared';
import { Module, forwardRef } from '@nestjs/common';
import { LibCoreModule } from '../core/core.module';
import { ResourceRepository } from './resource.repository';
import { ResourceService } from './resource.service';
import { LibMenuFunctionModule } from '../menu-function/menu-function.module';

@Module({
	imports: [
		LibCoreModule,
		LibMongoModule.forFeatureAsync({
			name: Resource.name,
			schema: ResourceSchema,
		}),
		forwardRef(() => LibMenuFunctionModule),
	],
	providers: [ResourceService, ResourceRepository],
	exports: [ResourceService, ResourceRepository],
})
export class LibResourceModule {}
