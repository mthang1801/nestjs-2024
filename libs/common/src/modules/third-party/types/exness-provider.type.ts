export namespace ExnessProviderNamespace {
	export type CheckClientEmail = {
		affiliation: boolean;
		accounts: string[];
	};
	export type ClientAccountData = {
		id: number;
		reward_date: Date;
		partner_account: string;
		client_account_type: string;
		country: string;
		client_uid: string;
		currency: string;
		volume_lots: number;
		volume_mln_usd: number;
		reward: string;
		reward_usd: string;
		orders_count: number;
		reward_order: string;
		partner_account_name: string;
		client_account: number;
		link_code: string;
	};
	export type ClientAccountTotals = {
		count: number;
		volume_mln_usd: number;
		volume_lots: number;
		reward: string;
		reward_usd: string;
		orders_count: number;
		currency: string[];
	};

	export type GetClientAccountResponseData = {
		data: ClientAccountData[];
		totals: ClientAccountTotals;
	};
  export type Headers = { 
    Authorization : `jwt ${string}`;
  }
}
