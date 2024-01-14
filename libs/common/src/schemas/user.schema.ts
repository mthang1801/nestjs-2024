import { CommonConfig } from '@app/shared';
import {
	AbstractDocument,
	AbstractSchema,
} from '@app/shared/abstract/abstract.schema';
import SchemaCustom from '@app/shared/abstract/schema-option';
import { ENUM_GENDER, ENUM_STATUS } from '@app/shared/constants/enum';
import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Type } from 'class-transformer';
import mongoose, { Types } from 'mongoose';
import { Contact, ContactSchema } from './contact.schema';
import { Role, RoleSchema } from './role.schema';
import { UserVerify, UserVerifySchema } from './user-verify.schema';
import { MongoDB } from '@app/shared/mongodb/types/mongodb.type';

@SchemaCustom({ collection: CommonConfig.CORE_MODULES.USER.COLLECTION })
export class User extends AbstractSchema {
	@Prop({
		minlength: 2,
		maxlength: 255,
	})
	@ApiProperty({ description: 'Full Name', example: 'John Cena' })
	name: string;

	@Prop({
		unique: true,
		required: true,
		match: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
	})
	@ApiProperty()
	email: string;

	@Prop({
		unique: true,
		type: String,
		match:
			/((03|05|07|08|09)+([0-9]{8}))\b|((02)+([0-9]{9}))\b|(^(19)+([0-9]{6,8}))\b|(^(18)+([0-9]){6,8})\b/,
		index: true,
	})
	@ApiProperty()
	phone: string;

	@Prop({
		type: String,
		enum: ENUM_STATUS,
		default: ENUM_STATUS.ACTIVE,
		index: 1,
	})
	@ApiPropertyOptional()
	status: string;

	@Prop({
		default:
			'https://st3.depositphotos.com/9998432/13335/v/600/depositphotos_133352156-stock-illustration-default-placeholder-profile-icon.jpg',
	})
	@ApiProperty()
	avatar: string;

	@Prop()
	@ApiProperty()
	@Exclude()
	password: string;

	@Prop()
	@ApiProperty()
	dob: Date;

	@Prop({ type: String, enum: ENUM_GENDER, default: ENUM_GENDER.FEMALE })
	@ApiPropertyOptional()
	gender: ENUM_GENDER;

	@Prop({ type: [{ type: ContactSchema }] })
	@ApiPropertyOptional()
	@Type(() => Contact)
	contact: Contact[];

	@Prop()
	@Exclude()
	@ApiPropertyOptional()
	credit_card_number: string;

	@Prop()
	@Exclude()
	@ApiPropertyOptional()
	cvc: number;

	@Prop()
	@Exclude()
	@ApiPropertyOptional()
	identifier: string;

	@Prop({
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Role',
		index: 1,
	})
	@ApiPropertyOptional({ type: Role })
	role: MongoDB.MongoId | Role;

	@Prop({ type: RoleSchema, excludeIndexes: true })
	@Type(() => Role)
	@ApiPropertyOptional({ type: Role })
	role_info: Role;

	@Prop({ type: Boolean, default: false })
	@ApiPropertyOptional({
		type: Boolean,
		description: 'Trạng thái role theo user đã thay đổi hay chưa',
	})
	role_change_status: boolean;

	@Prop()
	refresh_token: string;

	@Prop({ type: [{ type: UserVerifySchema }] })
	@Type(() => UserVerify)
	verifies: UserVerify[];
}

export type UserDocument = AbstractDocument<User>;

export const UserSchema = SchemaFactory.createForClass(User);

export const UserSchemaFactory = () => {
	const userSchema = UserSchema;
	userSchema.index({ fullname: 1 });
	userSchema.index({ updated_at: -1 });
	userSchema.index({ refresh_token: 1 });
	UserSchema.index({ 'user_info.level': 1 });
	UserSchema.index({ 'role_info.*': 1 });
	return userSchema;
};
