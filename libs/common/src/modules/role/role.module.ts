import { Role, RoleSchema } from '@app/common/schemas/role.schema';
import { LibMongoModule } from '@app/shared';
import { Module, forwardRef } from '@nestjs/common';
import { LibCoreModule } from '../core/core.module';
import { RoleRepository } from './role.repository';
import { RoleService } from './role.service';
import { LibUserModule } from '../user';
import { LibMenuFunctionModule } from '../menu-function/menu-function.module';
@Module({
	imports: [
		LibCoreModule,
		LibMongoModule.forFeatureAsync({
			name: Role.name,
			schema: RoleSchema,
		}),
		forwardRef(() => LibUserModule),
		forwardRef(() => LibMenuFunctionModule),
	],
	controllers: [],
	providers: [RoleService, RoleRepository],
	exports: [RoleService, RoleRepository],
})
export class LibRoleModule {}
