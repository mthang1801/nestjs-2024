import Application from '@app/common/application';
import { CommonConfig } from '@app/shared';
import { AppModule } from './app.module';

(async function bootstrap() {
	await new Application(AppModule, CommonConfig.NEST_SERVICES.NEST_2K24)
		.setDefault()
		.init();
})();
