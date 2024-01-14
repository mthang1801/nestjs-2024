import { CommonConfig, utils } from '@app/shared';
import { ExecutionContext, Inject, Injectable, Logger } from '@nestjs/common';
import {
  ThrottlerException,
  ThrottlerGuard,
  ThrottlerOptions,
} from '@nestjs/throttler';
import { Request } from 'express';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class WsThrottlerGuard extends ThrottlerGuard {
	logger = new Logger(WsThrottlerGuard.name);

	@Inject()
	private readonly i18n: I18nService;

	async handleRequest(
		context: ExecutionContext,
		limit: number,
		ttl: number,
		throttler: ThrottlerOptions,
	): Promise<boolean> {
		this.logger.log('************ WsThrottlerGuard *************');
		const request: Request = context.switchToHttp().getRequest();

		const key = utils.generateCacheKey(
			CommonConfig.REDIS_THROTTLER,
			throttler.name,
			request.path.split('/').at(-1).toUpperCase(),
			utils.encryptedText(request.ip),
		);

		const { totalHits, timeToExpire } = await this.storageService.increment(
			key,
			ttl,
		);

		if (totalHits > limit) {
			throw new ThrottlerException(
				this.i18n.t('errors.THROTTLER.FORM_ANSWER', {
					args: {
						ttl: parseInt(String(ttl / 1000)),
						time_expire: timeToExpire,
					},
				}),
			);
		}

		return true;
	}
}
