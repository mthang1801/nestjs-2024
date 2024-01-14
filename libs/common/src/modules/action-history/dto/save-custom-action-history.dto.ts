import { User } from '@app/common/schemas';
import { ENUM_ACTION_TYPE } from '@app/shared/constants/enum';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

export class SaveCustomActionHistoryDto {
	action_type?: ENUM_ACTION_TYPE;

	@IsNotEmpty()
	custom_data: any;

	@IsOptional()
	collection_name?: string;

	created_by_user?: any;
	created_by_user_info?: any;
}
