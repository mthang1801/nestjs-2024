import {
	TokenPair,
	TokenPayload,
	TokenType,
} from '@app/common/modules/auth/types/auth.type';
import { User } from '@app/common/schemas';
import { AbstractService, CommonConfig, utils } from '@app/shared';
import {
	ENUM_STATUS,
	ENUM_TOKEN_TYPE,
	ENUM_USER_VERIFY_TYPE,
} from '@app/shared/constants/enum';
import {
	BadRequestException,
	ForbiddenException,
	Inject,
	Injectable,
	Logger,
	forwardRef,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import { UserService } from '../user/user.service';
import { ForgetPasswordDto } from './dto/forget-password.dto';
import { RestorePasswordDto } from './dto/restore-password.dto';
import { SetPasswordDto } from './dto/update-password.dto';
@Injectable()
export class AuthService extends AbstractService<any> {
	logger = new Logger(AuthService.name);
	constructor(
		@Inject(forwardRef(() => UserService))
		private readonly userService: UserService,
		private readonly jwtService: JwtService,
		@Inject(CommonConfig.RMQ_QUEUES.MAIL_SERVICE)
		private readonly mailClient: ClientProxy,
	) {
		super();
	}

	async validateUser(username: string, password: string) {
		const user = await this.userService.findUserByPhoneOrEmail(username);

		if (user.status !== ENUM_STATUS.ACTIVE)
			throw new ForbiddenException(
				await this.i18n.t('errors.alert_user_inactive'),
			);

		const passwordIsMatching = await utils.compareHashedString(
			password,
			user.password,
		);
		if (!passwordIsMatching)
			throw new BadRequestException(
				await this.i18n.t('errors.alert_password_wrong'),
			);

		return user;
	}

	async generateTokenByTokenType(
		user: User,
		tokenType: TokenType = ENUM_TOKEN_TYPE.ACCESS,
	): Promise<any> {
		const payload: TokenPayload = { id: user.id.toString() };
		const secret = this.configService.get<string>(`JWT_${tokenType}_SECRET`);

		const expirationTime = this.configService.get<number>(
			`JWT_${tokenType}_EXPIRATION_TIME`,
		);
		const token = await this.jwtService.signAsync(payload, {
			secret,
			expiresIn: `${expirationTime}s`,
		});

		return token;
	}

	async generateTokenPair(user: User): Promise<TokenPair> {
		const [accessToken, refreshToken] = await Promise.all(
			[ENUM_TOKEN_TYPE.ACCESS, ENUM_TOKEN_TYPE.REFRESH].map(async (tokenType) =>
				this.generateTokenByTokenType(user, tokenType),
			),
		);

		await this.userService.saveRefreshToken(user, refreshToken);
		return { accessToken, refreshToken };
	}

	async setPassword(payload: SetPasswordDto) {
		const user = await this.userService.findUserByPhoneOrEmail(
			payload.username,
		);
		const { rawPassword, hashedPassword } =
			await this.userService.generateRawAndHashedPassword(payload.password);

		this.userService.updateNewPasswordByUserId(user.id, hashedPassword);

		this.mailClient.emit(CommonConfig.RMQ_EVENT_PATTERNS.SET_PASSWORD, {
			username: user.email,
			password: rawPassword,
		});
	}

	async forgetPassword(payload: ForgetPasswordDto): Promise<void> {
		const currentUser = await this.userService.findUserByPhoneOrEmail(
			payload.username,
		);
		const getVerifyCode = this.userService.getVerifyCode(
			ENUM_USER_VERIFY_TYPE.FORGET_PASSWORD,
		);
		currentUser.verifies = [
			...currentUser.verifies.filter(
				(verify) => verify.type !== ENUM_USER_VERIFY_TYPE.FORGET_PASSWORD,
			),
			getVerifyCode,
		];

		await currentUser.save();

		this.mailClient.emit(CommonConfig.RMQ_EVENT_PATTERNS.RESET_PASSWORD, {
			email: currentUser.email,
			redirect_url: `${this.configService.get<string>(
				'DNI_WEBSITE_URL',
			)}/login?username=${currentUser.email}&verify_code=${getVerifyCode.code}`,
		});
	}

	async restorePassword(payload: RestorePasswordDto) {
		const currentUser = await this.userService.findUserByPhoneOrEmail(
			payload.username,
		);

		const verify = currentUser.verifies.find(
			(verify) => verify.type === ENUM_USER_VERIFY_TYPE.FORGET_PASSWORD,
		);

		if (!verify)
			throw new BadRequestException(
				await this.i18n.t('errors.STATUS_CODE.400'),
			);

		if (new Date(verify.expired_at).getTime() < Date.now())
			throw new BadRequestException(
				await this.i18n.t('errors.verify_expired_time'),
			);

		currentUser.verifies = [
			...currentUser.verifies.filter(
				(verify) => verify.type !== ENUM_USER_VERIFY_TYPE.FORGET_PASSWORD,
			),
		];

		currentUser.password = await utils.hashedString(payload.new_password);

		await currentUser.save();
	}

	async responseLoginAccess(user: User) {
		const { accessToken, refreshToken } = await this.generateTokenPair(user);
		return {
			accessToken,
			refreshToken,
			tokenType: 'Bearer',
			expiredIn: Number(
				this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME'),
			),
		};
	}
}
