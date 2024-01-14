import { CreateCamperRequestDto } from '@app/common/modules/campers/dto/requests/create-camper-request.dto';

export class CreateCamperCommand {
	constructor(public readonly createCamperRequest: CreateCamperRequestDto) {}
}
