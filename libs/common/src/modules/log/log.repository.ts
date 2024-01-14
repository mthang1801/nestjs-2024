import { Log, LogDocument } from '@app/common/schemas/log.schema';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ENUM_CONNECTION_NAME } from '@app/shared/mongodb';

@Injectable()
export class LogRepository {
	logger = new Logger(LogRepository.name);
	constructor(
		@InjectModel(Log.name, ENUM_CONNECTION_NAME.PRIMARY)
		readonly primaryModel: Model<LogDocument>,
		@InjectModel(Log.name, ENUM_CONNECTION_NAME.SECONDARY)
		readonly secondaryModel: Model<LogDocument>,
	) {}
}
