import { ENUM_FAV_ICON, ENUM_SWAGGER_THEME } from "@app/shared/constants";

export type ApiResponseDataType = 'object' | 'array' | 'any';

export type TApiResponse<TModel> = {
	responseType?: TModel;
	summary: string;
	httpCode?: number;
	body?: any;
	headers?: Record<string, any>[];
};

export type SwaggerSetupOptions = {
	theme?: keyof typeof ENUM_SWAGGER_THEME;
	title?: string;
	icon?: keyof typeof ENUM_FAV_ICON;
	apiEndpoint?: string;
	description?: string;
	version?: string;
};
