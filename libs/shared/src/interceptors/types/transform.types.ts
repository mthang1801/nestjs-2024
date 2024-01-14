import { AbstractType } from '@app/shared/abstract/types/abstract.type';

export type ResponseData<T> = {
	success: boolean;
	statusCode: number;
	data: T | T[];
	metadata?: AbstractType.Metadata;
	message: string | string[];
};
