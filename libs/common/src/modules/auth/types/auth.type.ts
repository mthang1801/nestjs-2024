import {
	ENUM_ROLES,
	ENUM_TOKEN_TYPE,
	ENUM_USER_VERIFY_TYPE,
} from '@app/shared';

export type RoleKeys = keyof typeof ENUM_ROLES;
export type RoleNames = (typeof ENUM_ROLES)[RoleKeys];

export type TokenPayload = {
	id: string;
};

export type CookieToken = {
	token: string;
	cookie: string;
};

export type TokenKey = keyof typeof ENUM_TOKEN_TYPE;
export type TokenType = (typeof ENUM_TOKEN_TYPE)[TokenKey];

export type TokenPair = {
	accessToken: string;
	refreshToken: string;
};

export type UserVerifyTypeKey = keyof typeof ENUM_USER_VERIFY_TYPE;
export type UserVerifyTypeName =
	(typeof ENUM_USER_VERIFY_TYPE)[UserVerifyTypeKey];
