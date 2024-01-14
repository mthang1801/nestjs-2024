import { AggregateRoot } from '@nestjs/cqrs';

export class Camper extends AggregateRoot {
	constructor(
		private readonly _id: string,
		private readonly name: string,
		private readonly age: number,
		private readonly allergies: string[],
	) {
		super();
	}

	getId() {
		return this._id;
	}

	getName() {
		return this.name;
	}

	getAge() {
		return this.age;
	}

	getAllergies() {
		return this.allergies;
	}
}
