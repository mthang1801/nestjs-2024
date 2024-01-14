import { SetMetadata } from '@nestjs/common';
import { CommonConfig } from '../config';
import { CommonConfigType } from '../config/types';

export const Resource = (resourceName: CommonConfigType.NestResource) =>
	SetMetadata(CommonConfig.NEST_TOKEN.RESOURCE, resourceName);
