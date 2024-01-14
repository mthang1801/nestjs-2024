import { ApiPropertyOptional } from '@nestjs/swagger';

export class GlobalRoleEntity {
	@ApiPropertyOptional({ type: String, example: 'SUPER_ADMIN' })
	key: string;

	@ApiPropertyOptional({ type: String, example: 'Quản trị hệ thống' })
	name: string;
}
