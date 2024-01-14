import {
  MenuFunction,
  MenuFunctionSchema,
} from '@app/common/schemas/menu-function.schema';
import { LibMongoModule } from '@app/shared';
import { Module, forwardRef } from '@nestjs/common';
import { MenuFunctionRepository } from './menu-function.repository';
import { MenuFunctionService } from './menu-function.service';
import { LibCoreModule } from '../core/core.module';
import { LibResourceModule } from '../resource/resource.module';

@Module({
	imports: [
		LibCoreModule,
		LibMongoModule.forFeatureAsync({
			name: MenuFunction.name,
			schema: MenuFunctionSchema,
		}),
    forwardRef(() => LibResourceModule)
	],
	providers: [MenuFunctionRepository, MenuFunctionService],
	exports: [MenuFunctionRepository, MenuFunctionService],
})
export class LibMenuFunctionModule {}
