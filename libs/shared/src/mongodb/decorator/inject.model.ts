import { applyDecorators } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ENUM_CONNECTION_NAME } from '../constants/connection-name';

export const MongooseInjectModel = (
	modelName: string,
	connectionName: ENUM_CONNECTION_NAME = ENUM_CONNECTION_NAME.PRIMARY,
): any => applyDecorators(InjectModel(modelName, connectionName));
