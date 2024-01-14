import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import mongoose from 'mongoose';
import { ENUM_USER_VERIFY_TYPE } from '@app/shared/constants/enum';

@Schema({ _id: false })
export class UserVerify {
	@Prop({ enum: ENUM_USER_VERIFY_TYPE })
	@ApiProperty({
		enum: ENUM_USER_VERIFY_TYPE,
		example: ENUM_USER_VERIFY_TYPE.FORGET_PASSWORD,
	})
	type: string;

	@Prop()
	@ApiProperty({ example: '123ABC' })
	code: string;

	@Prop({ type: mongoose.Schema.Types.Date })
	@ApiProperty({ example: new Date('2023-08-01T13:00:00') })
	expired_at: Date;

	@Prop({ type: mongoose.Schema.Types.Number, default: 0 })
	@ApiProperty({ example: 0 })
	wrong_count: number;

	constructor(partial: Partial<UserVerify>) {
		return Object.assign(this, partial);
	}
}

export type UserVerifyDocument = Document & UserVerify;

export const UserVerifySchema = SchemaFactory.createForClass(UserVerify);
