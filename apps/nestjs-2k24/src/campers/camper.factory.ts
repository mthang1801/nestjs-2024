import { Camper } from '@app/common/modules/campers/Camper';
import { CamperEntityRepository } from '@app/common/modules/campers/db/camper-entity.repository';
import { IEntityFactory } from '@app/shared/abstract/interfaces';
import { Types } from 'mongoose';
import { CamperCreatedEvent } from '../events/camper-created.event';

export class CamperFactory implements IEntityFactory<Camper> {
	constructor(
		private readonly camperEntityRepository: CamperEntityRepository,
	) {}

	async create(
		name: string,
		age: number,
		allergies: string[],
	): Promise<Camper> {
		const camper = new Camper(
			new Types.ObjectId().toHexString(),
			name,
			age,
			allergies,
		);
		await this.camperEntityRepository.create(camper);
		camper.apply(new CamperCreatedEvent(camper.getId()));
		return camper;
	}
}
