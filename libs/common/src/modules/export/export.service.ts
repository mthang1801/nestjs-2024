import { ExportDocument, User } from '@app/common/schemas';
import {
  AbstractService,
  CommonConfig,
  EXPORT_COLUMNS_CONFIG,
  RMQService,
} from '@app/shared';
import { Exceljs } from '@app/shared/exceljs/types/exceljs.type';
import { convertValue } from '@app/shared/utils/function.utils';
import {
  BadRequestException,
  HttpException,
  Inject,
  Injectable,
  Logger,
  forwardRef,
} from '@nestjs/common';
import { unlink } from 'fs-extra';
import { ProjectionType } from 'mongoose';
import { Subject, filter, map } from 'rxjs';
import { UserService } from '../user';
import { CreateExportFileDto } from './dto/create-export.dto';
import { ExportFilePartDto } from './dto/export-file-part.dto';
import { GetSampleFileDto } from './dto/get-sample.dto';
import { ImplementExportDto } from './dto/implement-export.dto';
import { ExportBuilder } from './export.builder';
import { ExportConditionFormat } from './export.condition-format';
import { ExportRepository } from './export.repository';
import { ExportStyle } from './export.style';

@Injectable()
export class ExportService extends AbstractService<ExportDocument> {
	logger = new Logger(ExportService.name);
	private readonly subject = new Subject<Exceljs.ExportListenerResponse>();
	constructor(
		@Inject(forwardRef(() => UserService))
		private readonly userService: UserService,
		readonly exportRepository: ExportRepository,
		private readonly rmqService: RMQService,
	) {
		super(exportRepository);
	}

	async createExportSession(
		payload: CreateExportFileDto,
	): Promise<ImplementExportDto> {
		try {
			const session = Date.now().toString();

			return {
				...payload,
				session,
			};
		} catch (error) {
			throw new HttpException(error.stack, error.status);
		}
	}

	implementExport(payload: ImplementExportDto, user: User) {
		for (let part = 1; part <= payload.total_parts; part++) {
			this.rmqService.publishDataToQueue(
				CommonConfig.RMQ_QUEUES.EXPORT,
				CommonConfig.RMQ_EVENT_PATTERNS.EXPORT,
				{
					...payload,
					part,
					user,
				},
			);
		}
	}

	getExportFile(module: string, session: string, part: number) {
		return new ExportBuilder()
			.setRequestData({ module, part } as any)
			.setSession(session)
			.getFilePath();
	}

	async deleteExportFile(module: string, session: string, part: number) {
		const filePath = this.getExportFile(module, session, part);
		await unlink(filePath);
	}

	async deleteFile(filePath: string) {
		const excludeFileName = [EXPORT_COLUMNS_CONFIG.ClientSample.fileName];
		if (new RegExp(excludeFileName.join('|')).test(filePath)) return;
		await unlink(filePath);
	}

	getSampleFile(payload: GetSampleFileDto): Exceljs.ExportReponse {
		this.logger.log('************ getSampleFile *************');
		const exportSampleTemplate = this.getExportConfig(payload.module);
		const result = new ExportBuilder().setTemplate(exportSampleTemplate);

		return { module: payload.module, file_path: result.getFilePath() };
	}

	exportProcessListener(module: string, session: string, part: number) {
		this.logger.log('************ exportProcessListener *************');
		return this.subject.asObservable().pipe(
			filter(
				(response: Exceljs.ExportListenerResponse) =>
					response.module === module &&
					response.session === session &&
					Number(response.part) === Number(part),
			),
			map((response: Exceljs.ExportListenerResponse) =>
				JSON.stringify(response),
			),
		);
	}

	async onExportPart(payload: ExportFilePartDto) {
		this.logger.log('**************** onExportPart ******************');
		const data = await this.getData(payload);
		const template = this.getExportConfig(payload.module);
		await new ExportBuilder()
			.setInputData(data)
			.setUser(payload.user)
			.setRequestData(payload)
			.setSubject(this.subject)
			.setSession(payload.session)
			.setWorkSheet('First Sheet')
			.setTemplate(template)
			.enalbeAutoFilter(true)
			.setProperties({ defaultRowHeight: 20, defaultColWidth: 20 })
			.setTitleAndHeaderStyles(ExportStyle.Default)
			.setAddConditionalFormating(
				ExportConditionFormat.EachRowDataFormatingDefault,
			)
			.setHeaderRows()
			.addBreakLine()
			.setOverviewRows()
			.addBreakLine()
			.build()
			.save();
	}

	getExportConfig(
		module: keyof typeof EXPORT_COLUMNS_CONFIG,
	): Exceljs.ExportTemplate {
		return EXPORT_COLUMNS_CONFIG[module] as Exceljs.ExportTemplate;
	}

	parseQueryParams({ query_params }: CreateExportFileDto): any {
		if (!query_params) return {};
		const queryParamsList = query_params.split('&').filter(Boolean);
		return queryParamsList.reduce((filterQuery, queryParam) => {
			let [key, val]: any = queryParam.split('=').filter(Boolean);
			if (!key || !val)
				throw new BadRequestException(
					this.i18n.t('errors.export_query_params_invalid'),
				);
			const value = convertValue(val);
			filterQuery[key] = value;
			return filterQuery;
		}, {});
	}

	async getData(
		payload: ExportFilePartDto | CreateExportFileDto,
	): Promise<Exceljs.ExportResponseData> {
		const filterQuery = this.parseQueryParams(payload);
		const projection = this.getProjection(payload);

		const { items, count } = await this.getDataByModule(
			payload,
			filterQuery,
			projection,
		);

		return { items, count, filterQuery, module: payload.module };
	}

	async getDataByModule(
		payload: ExportFilePartDto | CreateExportFileDto,
		filterQuery: any,
		projection: ProjectionType<any>,
	) {
		this.logger.log('************* getDataByModule **************');
		switch (payload.module as Exceljs.ExportTemplateKeys) {
			case 'User':
				return this.userService.getExportData(filterQuery, projection);
		}
	}

	getProjection(payload: ExportFilePartDto | CreateExportFileDto) {
		return EXPORT_COLUMNS_CONFIG?.[payload?.module]?.metadata?.columns
			? Object.values(
					EXPORT_COLUMNS_CONFIG[payload.module].metadata.columns,
			  ).map(({ key }) => key)
			: {};
	}

	async create(
		payload: CreateExportFileDto,
		user: User,
	): Promise<Exceljs.ExportReponse> {
		const data = await this.getData(payload);
		const template = this.getExportConfig(payload.module);
		const result = await new ExportBuilder()
			.setInputData(data)
			.setUser(user)
			.setRequestData(payload)
			.setSubject(this.subject)
			.setWorkSheet('First Sheet')
			.setTemplate(template)
			.enalbeAutoFilter(true)
			.setProperties({ defaultRowHeight: 20, defaultColWidth: 20 })
			.setTitleAndHeaderStyles(ExportStyle.Default)
			.setAddConditionalFormating(
				ExportConditionFormat.EachRowDataFormatingDefault,
			)
			.setHeaderRows()
			.addBreakLine()
			.setOverviewRows()
			.addBreakLine()
			.build()
			.save();

		return {
			module: payload.module,
			file_path: result.getFilePath(),
			session: result.getSession(),
		};
	}
}
