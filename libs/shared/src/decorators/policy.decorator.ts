import { SetMetadata } from '@nestjs/common';
import { ENUM_POLICY } from '../constants';

export const Public = () => SetMetadata(ENUM_POLICY.PUBLIC, true);
