import { AggregateRoot } from "@nestjs/cqrs";
import { AbstractSchema } from "../abstract.schema";

export interface IEntitySchemaFactory<
	TSchema extends AbstractSchema,
	TEntity extends AggregateRoot,
> {
	create(entity: TEntity): TSchema;
	createFromSchema(entitySchema: TSchema): TEntity;
}
