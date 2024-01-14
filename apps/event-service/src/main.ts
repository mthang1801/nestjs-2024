import Application from '@app/common/application';
import { CommonConfig } from '@app/shared';
import { AppModule } from './app.module';

(async function bootstrap() {
	const { RMQ_QUEUES } = CommonConfig;
	await new Application(AppModule, CommonConfig.NEST_SERVICES.EVENT_SERVICE)
		.setDefault()
		.setRMQConsumers(
			RMQ_QUEUES.MAIL_SERVICE,
			RMQ_QUEUES.SAVE_INFO,
			RMQ_QUEUES.REMOVE_INFO,
			RMQ_QUEUES.TELEGRAM,
			RMQ_QUEUES.SAVE_LOG,
			RMQ_QUEUES.REPORT,
			RMQ_QUEUES.IMPORT,
			RMQ_QUEUES.ACTION_HISTORY,
		)
		.init();
})();
