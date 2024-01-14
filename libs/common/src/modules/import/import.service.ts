import {
    CommonConfig,
    ENUM_GENDER,
    IMPORT_COLUMNS_CONFIG,
    RMQService,
    utils,
} from '@app/shared';
import { ExceljsService } from '@app/shared/exceljs/exceljs.service';
import { Exceljs } from '@app/shared/exceljs/types/exceljs.type';
import { HttpException, Injectable } from '@nestjs/common';
import { Workbook } from 'exceljs';
import * as fsExtra from 'fs-extra';
import * as lodash from 'lodash';
import { I18nService } from 'nestjs-i18n';
import { ClientService } from '../client/client.service';
import { ImportPayloadDto } from './dto/import-payload.dto';

@Injectable()
export class ImportService {
	constructor(
		private readonly exceljsService: ExceljsService,
		private readonly clientService: ClientService,
		private readonly i18n: I18nService,
		private readonly rmqService: RMQService,
	) {}

	async importFile(payload: ImportPayloadDto, file: Express.Multer.File) {
		try {
			const wb = await this.exceljsService.readFile(file);
			const dataSheet: Exceljs.DataSheet[] = this.getDataSheet(
				wb as Workbook,
				payload.module,
			);
			return await this.handleDataSheet(dataSheet, payload);
		} catch (error) {
			throw new HttpException(error.message, error.status);
		} finally {
			await fsExtra.unlink(file.path);
		}
	}

	async handleDataSheet(
		dataSheetList: Exceljs.DataSheet[],
		payload: ImportPayloadDto,
	) {
		return await Promise.all(
			dataSheetList.map(async (dataSheetItem) => {
				switch (dataSheetItem.templateName) {
					case 'sampleCode1':
					case 'sampleCode2':
						return;
					case 'client':
						return await this.importClient(dataSheetItem.data, payload);
				}
			}),
		);
	}

	async importClient(listData: any[], payload: ImportPayloadDto) {
		try {
			const convertedData = [];
			listData.forEach((dataItem) => {
				dataItem.email = dataItem?.email?.toLowerCase();
				dataItem.affiliation = utils.toBoolean(dataItem.affiliation);
				dataItem.gender = dataItem.gender ?? ENUM_GENDER.MALE;
				dataItem.created_by_user = payload.created_by_user;
				convertedData.push(dataItem);
			});
			const dataByEmail = await this.clientService.validateImportData(
				convertedData,
			);

			const clientChunkList = lodash.chunk(dataByEmail, 250);

			clientChunkList.forEach((clientChunk) => {
				this.rmqService.publishDataToQueue(
					CommonConfig.RMQ_QUEUES.IMPORT,
					CommonConfig.RMQ_EVENT_PATTERNS.IMPORT_CLIENT,
					{ data: clientChunk },
				);
			});
		} catch (error) {
      console.log(error.stack)
    }
	}

	getDataSheet(wb: Workbook, module: keyof typeof CommonConfig.IMPORT_MODULE) {
		const templates = this.findTemplatesByModule(module);
		const dataSheet: Exceljs.DataSheet[] = [];
		if (templates?.length) {
			templates.forEach((template) => {
				const ws = wb.getWorksheet(template.sheetName);
				if (ws) {
					const data = this.exceljsService.getDataFromWorksheet(
						ws,
						template.name as Exceljs.ImportTemplate,
					);
					dataSheet.push({
						templateName: template.name as Exceljs.ImportTemplate,
						data,
					});
				}
			});
		}
		return dataSheet;
	}

	findTemplatesByModule(moduleName: keyof typeof CommonConfig.IMPORT_MODULE) {
		switch (moduleName) {
			case 'Client':
				return [IMPORT_COLUMNS_CONFIG.client];
			default:
				return [
					IMPORT_COLUMNS_CONFIG.sampleCode1,
					IMPORT_COLUMNS_CONFIG.sampleCode2,
				];
		}
	}
}
