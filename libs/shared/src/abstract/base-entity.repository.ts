import { AggregateRoot } from '@nestjs/cqrs';
import { AbstractSchema } from './abstract.schema';
import { EntityRepository } from './entity.repository';

export abstract class BaseEntityRepository<
	TSchema extends AbstractSchema,
	TEntity extends AggregateRoot,
> extends EntityRepository<TSchema, TEntity> {
	async findOneById(id: string): Promise<TEntity> {
		return this.findOne({ _id: id });
	}

	async findOneAndReplaceById(id: string, entity: TEntity): Promise<void> {
		await this.findOneAndReplace({ _id: id }, entity);
	}
}
