export interface IEntityFactory<TEntity> {
	create(...args: any): TEntity | Promise<TEntity>;
}
