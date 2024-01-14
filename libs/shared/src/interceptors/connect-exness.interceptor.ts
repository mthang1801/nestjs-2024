import { MasterDniService } from '@app/common/modules/master-dni/master-dni.service';
import {
	CallHandler,
	ExecutionContext,
	Injectable,
	NestInterceptor,
} from '@nestjs/common';

@Injectable()
export class ConnectExnessInterceptor implements NestInterceptor {
	constructor(private readonly masterDniService: MasterDniService) {}
	async intercept(
		context: ExecutionContext,
		next: CallHandler<any>,
	): Promise<any> {
		const request = context.switchToHttp().getRequest();
		request['exness-token'] = await this.masterDniService.getExnessToken();
		return next.handle().pipe();
	}
}
