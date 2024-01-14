import { AbstractType } from '@app/shared/abstract/types/abstract.type';
import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import * as lodash from 'lodash';
import { I18nService } from 'nestjs-i18n';
import { Observable, tap } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { utils } from '..';
import { typeOf } from '../utils/function.utils';
import { ResponseData } from './types';

@Injectable()
export class TransformInterceptor<T>
	implements NestInterceptor<T, ResponseData<T>>
{
	logger = new Logger(TransformInterceptor.name);
	constructor(private readonly i18n: I18nService) {}
	intercept(
		context: ExecutionContext,
		next: CallHandler,
	): Observable<ResponseData<T>> | Observable<any> {
		const now = Date.now();
		const response = context.switchToHttp().getResponse();

		return next.handle().pipe(
			map(
				(res) => {
					const statusCode = response.statusCode ?? 200;
					return this.responseData(res, context, statusCode);
				},
				catchError((err) => {
					throw new HttpException(
						err?.response?.message || err.message,
						err.status,
					);
				}),
			),
			tap(() => this.logger.log(`After... ${Date.now() - now}ms`)),
		);
	}

	private responseData(
		res: any,
		context: ExecutionContext,
		statusCode,
	): ResponseData<T> {
		const success = statusCode < 400;

		const message = res?.message ?? this.i18n.t(`status.${String(statusCode)}`);

		const response: ResponseData<T> = {
			success,
			statusCode,
			data: this.serializeData(res),
			message,
			metadata: this.getMetadata(res, context),
		};

		return response;
	}

	getMetadata(res: any, context: ExecutionContext): AbstractType.Metadata {
		if (res?.metadata) return res.metadata;
		if ((res?.items || res?.data) && typeOf(res?.count) === 'number') {
			const totalItems = res.count;
			const req: Request = context.switchToHttp().getRequest();
			const { page, limit } = utils.getPageSkipLimit(req.query);
			return {
				totalItems: totalItems,
				currentPage: page,
				perPage: limit,
				totalPages:
					Number(totalItems) % Number(limit) === 0
						? Number(totalItems) / Number(limit)
						: Math.ceil(Number(totalItems) / Number(limit)),
			};
		}
		return undefined;
	}

	private serializeData(res) {
		if (!res) return null;
		if (res?.data) return res.data;
		if (res?.items && (typeOf(res?.count) === 'number' || res?.metadata))
			return res.items;
		if (typeOf(res) === 'object' && lodash.isEmpty(res)) return null;
		return res;
	}
}
