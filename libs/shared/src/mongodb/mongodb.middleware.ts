import { SchemaFactory } from '@nestjs/mongoose';
import * as lodash from 'lodash';
import { IndexDefinition, IndexOptions, Schema } from 'mongoose';
import { CommonConfig } from '../constants';

export class MongodbMiddleware {
	private schema: Schema;
	private model;
	constructor(model) {
		this.model = model;
	}

	createSchema() {
		this.schema = SchemaFactory.createForClass(this.model);
		return this.schema;
	}

	createFactory() {
		this.onSaveInfo();
		this.onUpdate();
		return this.schema;
	}

	createIndex(fields: IndexDefinition, options?: IndexOptions) {
		this.schema.index(fields, options);
		return this;
	}

	onSaveInfo() {
		this.schema.post('save', async function (doc, next) {
			const populates = MongodbMiddleware.getPopulates(doc.schema.paths);
			const populatesInfo = await doc.populate(populates);
			const updatedInfoData = populates.reduce((result, ele) => {
				if (populatesInfo[ele]) {
					result[`${ele}_info`] = lodash.pick(
						populatesInfo[ele],
						CommonConfig.SAVE_INFO_FIELDS,
					);
				}
				return result;
			}, {});
			await this.updateOne({ $set: updatedInfoData });
		});
	}

	onUpdate() {
		this.onFindOneAndUpdate();
	}

	onFindOneAndUpdate() {
		this.schema.pre('findOneAndUpdate', async function () {
			const docToUpdate = await this.model.findOne(this.getFilter());
			Object.values(this.model.collection.conn.models).forEach((model) => {
				console.log(model.schema.paths);
			});
			// if (typeOf(this?.model?.collection?.conn?.collections) === 'object') {
			// 	Object.values(this.model.collection.conn.collections).map(
			// 		(collection) => {
			// 			console.log(collection.conn);
			// 		},
			// 	);
			// }

			// const otherSchemasRef = this.getOtherSchemasReferencing(
			// 	this.getPopulatedPaths(),
			// );
		});
	}

	static getPopulates(paths: any): string[] {
		const result = Object.values(paths).reduce(
			(populates: string[], schemaPath: any) => {
				if (this.isValidPopulate(schemaPath)) {
					populates.push(schemaPath.path);
				}
				return populates;
			},
			[],
		) as string[];
		return result;
	}

	static isValidPopulate(schemaPath: any) {
		return (
			(schemaPath.instance === 'ObjectID' && schemaPath.path !== '_id') ||
			(schemaPath.instance === 'Array' &&
				schemaPath?.$embeddedSchemaType?.instance === 'ObjectID')
		);
	}

	getOtherSchemasReferencing(populatedPaths: any) {
		console.log(populatedPaths);
	}
}
