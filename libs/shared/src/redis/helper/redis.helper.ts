import { CommonConfig } from '@app/shared/config';

export const joinString = (...args: any[]) =>
	args.flat().filter(Boolean).join(CommonConfig.REDIS_DELIMITER);
