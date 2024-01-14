import { CreateCamperRequestDto } from '@app/common/modules/campers/dto/requests/create-camper-request.dto';
import { Body, Controller, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CreateCamperCommand } from './commands/create-camper.command';

@Controller('campers')
export class CamperController {
	constructor(private readonly commandBus: CommandBus) {}

	@Post()
	async create(@Body() createCamperRequestDto: CreateCamperRequestDto) {
		await this.commandBus.execute<CreateCamperCommand, void>(
			new CreateCamperCommand(createCamperRequestDto),
		);
	}
}
