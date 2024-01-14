import { HttpService } from '@nestjs/axios';
import { BadRequestException, HttpException, Logger } from '@nestjs/common';
import { AxiosError } from 'axios';
import { catchError, lastValueFrom } from 'rxjs';

export class ApiProvider {
	private httpService: HttpService;
	private domain: string;

	constructor(httpService: HttpService, domain: string) {
		this.httpService = httpService;
		this.domain = domain;
	}

	public getUrl(endpoint: string) {
		return [this.domain, endpoint]
			.filter(Boolean)
			.join('/')
			.replace(/\/\//g, '/');
	}

	public async get(
		endpoint?: string,
		headers?: Record<string, string>,
		params?: Record<string, string>,
	) {
		try {
			const response = await lastValueFrom(
				this.httpService
					.get(this.getUrl(endpoint), {
						params,
						headers,
					})
					.pipe(
						catchError((error: AxiosError) => {
							throw new BadRequestException(error.response.data);
						}),
					),
			);
			return response.data;
		} catch (error) {
			throw new HttpException(error.message, error.status);
		}
	}

	public async post<T extends Record<string, any>>(
		endpoint?: string,
		headers?: Record<string, string>,
		body?: T,
	) {
		try {
			const response = await lastValueFrom(
				this.httpService.post(this.getUrl(endpoint), body, { headers }).pipe(
					catchError((error: AxiosError) => {
						throw new BadRequestException(error.response.data);
					}),
				),
			);
			return response.data;
		} catch (error) {
			throw new HttpException(error.message, error.status);
		}
	}

	public async patch<T extends Record<string, any>>(
		endpoint?: string,
		headers?: Record<string, string>,
		body?: T,
	) {
		try {
			const response = await lastValueFrom(
				this.httpService.patch(this.getUrl(endpoint), body, { headers }).pipe(
					catchError((error: AxiosError) => {
						throw new BadRequestException(error.response.data);
					}),
				),
			);
			return response.data;
		} catch (error) {
			throw new HttpException(error.message, error.status);
		}
	}
}
