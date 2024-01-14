import {
    BadRequestException,
    Inject,
    Injectable,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { Workbook, Worksheet } from 'exceljs';
import * as fsExtra from 'fs-extra';
import { I18nService } from 'nestjs-i18n';
import { join } from 'path';
import { typeOf } from '../utils/function.utils';
import { Exceljs } from './types/exceljs.type';
import { IMPORT_COLUMNS_CONFIG } from '../config';

@Injectable()
export class ExceljsService {
	@Inject()
	i18n: I18nService;

	logger = new Logger(ExceljsService.name);
	public columnsTemplates: typeof IMPORT_COLUMNS_CONFIG =
		IMPORT_COLUMNS_CONFIG;

	private readonly templateDir = join(
		process.cwd(),
		'libs/shared/src/exceljs/templates',
	);

	public initWorkBook() {
		return new Workbook();
	}

	public async readFile(
		filePath: string | Express.Multer.File,
		extension: Exceljs.ExcelExtension = 'xlsx',
	) {
		const workbook = this.initWorkBook();
		return await workbook[extension].readFile(
			typeOf(filePath) === 'string' ? filePath : filePath['path'],
		);
	}

	async writeFile(
		workbook: Workbook,
		filename,
		extension: Exceljs.ExcelExtension = 'xlsx',
	) {
		const filePath = this.getFilePath(filename, extension);
		await workbook[extension].writeFile(filePath);
		return filePath;
	}

	protected getFilePath(filename: string, extension: string) {
		return join(this.templateDir, `${filename}.${extension}`);
	}

	public getRowHeaderIdxAndColumsKeys(
		ws: Worksheet,
		templateDescription: Exceljs.ExcelColumnDefinitionValue,
	): Exceljs.RowIdxAndColumnKeys {
		this.logger.log('*********** getRowHeaderIdxAndColumsKeys ************');
		if (!templateDescription) {
			throw new NotFoundException();
		}

		let columnKeys: Exceljs.ExcelColumn[] = [];
		const headerRowIndex = this.getHeaderRowIndex(ws, templateDescription);

		ws.getRow(headerRowIndex).eachCell((cell) => {
			const { value } = cell.model;
			const [col] = cell.$col$row.split('$').filter(Boolean);
			const columnKeyByMetadata = templateDescription.metadata.find(
				({ header }) => header === value,
			);
			if (columnKeyByMetadata) {
				columnKeys.push({
					header: String(value),
					column: col,
					key: columnKeyByMetadata.key,
				});
			}
		});

		return { headerRowIndex, columnKeys };
	}

	getHeaderRowIndex(
		ws: Worksheet,
		templateDescription: Exceljs.ExcelColumnDefinitionValue,
	) {
		for (let i = 0; i < ws.rowCount; i++) {
			const curRow = ws.getRow(i);
			const rowValues = (curRow.values as string[]).filter(Boolean);
			const isValidHeader = Object.values(templateDescription.metadata).every(
				({ header }) =>
					rowValues.some(
						(rowValueItem: any) =>
							typeOf(rowValueItem) === 'string' &&
							String(rowValueItem)?.toLowerCase() ===
								String(header).toLowerCase(),
					),
			);

			if (isValidHeader) return i;
		}

		throw new BadRequestException(this.i18n.t('errors.import_wrong_field'));
	}

	public getDataFromWorksheet(ws: Worksheet, template: Exceljs.ImportTemplate) {
		const templateDescription = this.columnsTemplates[template];
		const { headerRowIndex, columnKeys } = this.getRowHeaderIdxAndColumsKeys(
			ws,
			templateDescription,
		);

		this.validateTemplateIsMatching(columnKeys, templateDescription);

		const data = [];
		ws.eachRow((row, rowIdx) => {
			if (rowIdx > headerRowIndex) {
				const rowData = {};
				row.eachCell((cell) => {
					const [col] = cell.$col$row.split('$').filter(Boolean);
					const columnKey = columnKeys.find(
						(columnKey) => columnKey.column === String(col),
					);

					if (columnKey?.key) {
						rowData[columnKey.key] = cell?.value?.['text'] || cell?.value;
					}
				});
				data.push(rowData);
			}
		});
		return data;
	}

	validateTemplateIsMatching(
		columnKeys: Exceljs.ExcelColumn[],
		templateDescription,
	) {
		const requiredFields = [];

		templateDescription.metadata.forEach(({ header }) => {
			if (
				!columnKeys.some(({ header: columnHeader }) => columnHeader === header)
			) {
				requiredFields.push(header);
			}
		});

		const redundantFields = [];
		columnKeys.forEach(({ header: columnHeader }) => {
			if (
				!templateDescription.metadata.some(
					({ header }) => header === columnHeader,
				)
			) {
				redundantFields.push(columnHeader);
			}
		});

		if (requiredFields.length || redundantFields.length) {
			const requiredTextField = requiredFields.length
				? requiredFields.join(', ') + ' là bắt buộc.'
				: undefined;
			const redundantTextField = redundantFields.length
				? redundantFields.join(', ') + ' không nên tồn tại'
				: undefined;
			throw new BadRequestException(
				[requiredTextField, redundantTextField].filter(Boolean).join('\n'),
			);
		}
	}

	async removeFile(filePath) {
		await fsExtra.unlink(filePath);
	}
}
