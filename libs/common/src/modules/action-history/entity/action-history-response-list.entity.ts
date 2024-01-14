
export class ActionHistoryResponseListEntity {
	constructor({ data, meta }) {
		Object.assign(this, {
			items: data,
			metadata: meta,
		});
	}
}
