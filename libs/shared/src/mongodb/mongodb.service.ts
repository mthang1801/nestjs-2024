import {
	HttpException,
	Injectable,
	Logger,
	OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Document, Filter, MongoClient, ObjectId } from 'mongodb';
import mongoose, { AggregateOptions, ClientSession, Mongoose } from 'mongoose';
import { Db } from 'typeorm';

@Injectable()
export class LibMongoService implements OnModuleInit {
	logger = new Logger(LibMongoService.name);
	mongoose: typeof mongoose = null;
	constructor(private readonly configService: ConfigService) {}

	async onModuleInit() {
		this.mongoose = await this.connect();
	}

	async connect(): Promise<Mongoose> {
		return await mongoose.connect(this.uri);
	}

	async createConnection() {
		return await mongoose.createConnection(this.uri, { dbName: this.dbName });
	}

	async getModels() {
		const connection = await this.createConnection();
		return connection.models;
	}

	get uri() {
		return this.configService.get<string>('MONGO_URI_PRIMARY');
	}

	get dbName() {
		return this.configService.get<string>('MONGO_DATABASE');
	}

	async startTransaction(): Promise<ClientSession> {
		const session = await mongoose.startSession();
		session.startTransaction();
		return session;
	}

	async collection(collectionName: string) {
		const db = await this.db();
		return db.collection(collectionName);
	}

	async db() {
		const client = await this.mongoClientConnect();
		return client.db(this.configService.get<string>('MONGO_DATABASE'));
	}

	async mongoClientConnect(primary = true) {
		const client = new MongoClient(
			this.configService.get<string>(
				primary ? 'MONGO_URI_PRIMARY' : 'MONGO_URI_SECONDARY',
			),
		);
		await client.connect();
		return client;
	}

	mongoClientDisconnect(client: MongoClient) {
		setTimeout(() => {
			client.close();
		}, 500);
	}

	// eslint-disable-next-line @typescript-eslint/ban-types
	async mongoClientWrapper(fn: Function, primary = true) {
		const client = await this.mongoClientConnect();
		const db = await client.db(
			this.configService.get<string>('MONGO_DATABASE'),
		);
		try {
			return await fn(db);
		} catch (error) {
			throw new HttpException(error.message, error.status);
		} finally {
			this.mongoClientDisconnect(client);
		}
	}

	async insertOne(collectionName: string, payload: any) {
		this.logger.log(`${'*'.repeat(20)} insertOne() ${'*'.repeat(20)}`);
		this.logger.debug(payload);
		return this.mongoClientWrapper((db: Db) =>
			db
				.collection(collectionName)
				.insertOne({ ...payload, created_at: new Date() }),
		);
	}

	async findOne(collectionName: string, queryFilter: Filter<Document>) {
		return this.mongoClientWrapper(async (db: Db) => {
			console.log(collectionName, queryFilter);
			const res = await db.collection(collectionName).findOne(queryFilter);
			console.log(
				'🚀 ~ file: mongodb.service.ts:83 ~ LibMongoService ~ returnthis.mongoClientWrapper ~ res:',
				res,
			);
			return res;
		});
	}
	async findById(collectionName: string, id: string) {
		return this.mongoClientWrapper(async (db: Db) => {
			const res = await db
				.collection(collectionName)
				.findOne({ _id: new ObjectId(id) });

			return res;
		});
	}

	async aggregate(
		collectionName: string,
		pipeline: Document[],
		options?: AggregateOptions,
	) {
		this.logger.log('************ Aggregate *************');
		this.logger.log(JSON.stringify(pipeline));
		return this.mongoClientWrapper(async (db: Db) => {
			return await db
				.collection(collectionName)
				.aggregate(pipeline, { allowDiskUse: true, ...(options as any) })
				.toArray();
		}, false);
	}
}
