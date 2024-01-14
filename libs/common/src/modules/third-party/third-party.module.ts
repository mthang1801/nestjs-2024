import { Module } from '@nestjs/common';
import { ApiProvider } from './api.provider';
@Module({
	providers: [ApiProvider],
	exports: [ApiProvider],
})
export class LibThirdPartyModule {}
