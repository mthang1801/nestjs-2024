import { SetMetadata } from '@nestjs/common';
import { CommonConfig } from '../config';
import { ENUM_PERMISSION } from '../constants';

export const Permission = (permission: keyof typeof ENUM_PERMISSION) =>
	SetMetadata(CommonConfig.NEST_TOKEN.PERMISSION, permission);
