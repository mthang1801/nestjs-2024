import * as chalk from 'chalk';
import { Request, Response } from 'express';
import { isEmpty } from 'lodash';
import * as morgan from 'morgan';
import { formatDateTime } from '../utils/dates.utils';

function getStatusColor(res: Response) {
	const statusCode = (
		typeof res.headersSent !== 'boolean' ? Boolean(res.header) : res.headersSent
	)
		? res.statusCode
		: undefined;

	if (statusCode >= 500) return 'gray';
	if (statusCode >= 400) return 'red';
	if (statusCode >= 300) return 'cyan';
	if (statusCode >= 200) return 'green';
	return 'white';
}
export const MorganLogger = (): void => {
	return morgan(function (tokens, req: Request, res: Response) {
		const statusColor = getStatusColor(res);
		return [
			'\n',
			[
        chalk.green.bold(`[${formatDateTime()}]`),
				chalk[statusColor].bold(tokens.method(req, res)),
				chalk.cyan.bold(`route: ${tokens.url(req, res)}`),
				chalk[statusColor].bold(`statusCode : ${tokens.status(req, res)}`),
				chalk.yellow(tokens.res(req, res, 'content-length')),
				`${tokens['response-time'](req, res)}ms`,
			].join(' | '),
			req.query &&
				!isEmpty(req.query) &&
				chalk.yellow(`query: ${JSON.stringify(req.query)}`),
			req.body &&
				!isEmpty(req.body) &&
				chalk.magenta(`body: ${JSON.stringify(req.body)}`),
			'=================================== END ===================================',
			'\n',
		]
			.filter(Boolean)
			.join('\n');
	});
};
