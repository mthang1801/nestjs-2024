import Application from '@app/common/application';
import { CommonConfig } from '@app/shared';
import { AppModule } from './app.module';
import { VersioningType } from '@nestjs/common';

(async function bootstrap() {
	await new Application(AppModule, CommonConfig.NEST_SERVICES.MAIN_SERVICE)
		.setDefault()
		.setGlobalPrefix('api', { exclude: ['/'] })
		.setVersioning({
			type: VersioningType.URI,
			prefix: 'v',
			defaultVersion: ['1'],
		})
		.init();
})();
