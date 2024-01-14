import { User, UserDocument } from '@app/common/schemas';
import {
	AbstractRepository,
	CommonConfig,
	ENUM_CONNECTION_NAME,
	ENUM_FORM_ANSWER_STATUS,
	LookupOneToMany,
	LookupOneToOne,
	utils,
} from '@app/shared';
import { endOfDay, startOfDay } from '@app/shared/utils/dates.utils';
import { toObjectID } from '@app/shared/utils/function.utils';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class UserRepository extends AbstractRepository<UserDocument> {
	logger = new Logger(UserRepository.name);
	constructor(
		@InjectModel(User.name, ENUM_CONNECTION_NAME.PRIMARY)
		readonly primaryModel: Model<UserDocument>,
		@InjectModel(User.name, ENUM_CONNECTION_NAME.SECONDARY)
		readonly secondaryModel: Model<UserDocument>,
	) {
		super({
			primaryModel,
			secondaryModel,
		});
	}
}
