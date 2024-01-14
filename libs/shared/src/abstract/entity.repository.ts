import { AggregateRoot } from '@nestjs/cqrs';
import { FilterQuery, Model, ProjectionType } from 'mongoose';
import { AbstractSchema } from './abstract.schema';
import { IEntitySchemaFactory } from './interfaces';
import { AbstractType } from './types/abstract.type';
import { NotFoundException } from '@nestjs/common';

export abstract class EntityRepository<
	TSchema extends AbstractSchema,
	TEntity extends AggregateRoot,
> {
	constructor(
		protected readonly entityModel: Model<TSchema>,
		protected readonly entitySecondaryModel: Model<TSchema>,
		protected readonly entitySchemaFactory: IEntitySchemaFactory<
			TSchema,
			TEntity
		>,
	) {}

	protected async findOne(
		entityFilterQuery: FilterQuery<TSchema>,
		projection?: ProjectionType<TSchema>,
		options?: AbstractType.FindOptions<TSchema>,
	): Promise<TEntity> {
		const result = await this.entityModel.findOne(
			entityFilterQuery || {},
			projection,
			options,
		);

		return result?.deleted_at && !options?.includeSoftDelete
			? null
			: this.entitySchemaFactory.createFromSchema(result);
	}

	protected async findAll(
		entityFilterQuery: FilterQuery<TSchema>,
		projection: ProjectionType<TSchema>,
		options: AbstractType.FindOptions<TSchema>,
	): Promise<TEntity[]> {
		const result = await this.entityModel.find(
			entityFilterQuery || {},
			projection,
			{ ...options, lean: true },
		);

		return result.map((entityDocuemnt) =>
			this.entitySchemaFactory.createFromSchema(entityDocuemnt),
		);
	}

	async create(entity: TEntity): Promise<void> {
		await new this.entityModel(this.entitySchemaFactory.create(entity)).save();
	}

	protected async findOneAndReplace(
		entityFilterQuery: FilterQuery<TSchema>,
		entity: TEntity,
	): Promise<void> {
		const updatedEntityDocument = await this.entityModel.findOne(
			entityFilterQuery,
			this.entitySchemaFactory.create(entity),
			{
				new: true,
				lean: true,
			},
		);

		if (!updatedEntityDocument) {
			throw new NotFoundException('Unable to find the entity to replace.');
		}
	}
}
