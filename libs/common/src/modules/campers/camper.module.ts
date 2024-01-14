import { LibMongoModule } from '@app/shared';
import { Module } from '@nestjs/common';
import { SchemaFactory } from '@nestjs/mongoose';
import { CamperEntityRepository } from './db/camper-entity.repository';
import { CamperSchema } from './db/camper.schema';
import { Mongoose } from 'mongoose';
import { CamperSchemaFactory } from './db/camper-schema.factory';

@Module({
	imports: [
		LibMongoModule.forFeatureAsync({
			name: CamperSchema.name,
			schema: SchemaFactory.createForClass(CamperSchema),
		}),
	],
	providers: [CamperEntityRepository, CamperSchemaFactory],
})
export class LibCamperModule {}
