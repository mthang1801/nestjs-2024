import { User } from '@app/common/schemas';
import { Request } from 'express';

export interface IUserRequest extends Request {
	user: User;
	'exness-token'?: string;
}
