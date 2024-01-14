import { User } from '@app/common/schemas';
import { CommonConfig, ENUM_EXPORT_STATUS, utils } from '@app/shared';
import { AbstractType } from '@app/shared/abstract/types/abstract.type';
import { Exceljs } from '@app/shared/exceljs/types/exceljs.type';
import {
	checkValidTimestamp,
	dateFormatDMY_hms24h,
	formatDateTime,
	today,
} from '@app/shared/utils/dates.utils';
import { convertValue, toArray } from '@app/shared/utils/function.utils';
import { Logger } from '@nestjs/common';
import {
	AddWorksheetOptions,
	ConditionalFormattingRule,
	Row,
	Workbook,
	Worksheet,
	WorksheetProperties,
} from 'exceljs';
import * as lodash from 'lodash';
import { join } from 'path';
import { Subject } from 'rxjs';
import { CreateExportFileDto } from './dto/create-export.dto';
import { ExportFilePartDto } from './dto/export-file-part.dto';
import { GetSampleFileDto } from './dto/get-sample.dto';

export class ExportBuilder {
	logger = new Logger(ExportBuilder.name);
	private worksheet: Record<string, Worksheet> = {};
	private currentSheet: string;
	private workbook: Workbook;
	private template: Exceljs.ExportTemplate;
	public titleRow: Row;
	private inputData: AbstractType.FindAllResponse<any>;
	private requestData:
		| ExportFilePartDto
		| CreateExportFileDto
		| GetSampleFileDto;
	private user: User;
	private session: string = Date.now().toString();
	private extension: Exceljs.ExcelExtension = 'xlsx';
	private storageDirectory = CommonConfig.EXPORT_DIRECTORY;
	private mapOverviewComponent: Map<any, any> = new Map();
	private defaultSheetProperties: Partial<WorksheetProperties> = {
		defaultRowHeight: 20,
		defaultColWidth: 20,
	};
	private fileName: string = '';
	private headerRow: Row;
	private isAutoFilter: boolean = false;
	private mappingCellProps: string[] = [
		'style',
		'font',
		'fill',
		'border',
		'dataValidation',
		'model',
		'numFmt',
		'protection',
		'value',
	];
	private subject: Subject<Exceljs.ExportListenerResponse>;
	private columns: Exceljs.ExcelColumn[] = [];
	private conditionFormatingRules: ConditionalFormattingRule[];
	private firstCellDataAddress: string;
	private lastCellDataAddress: string;
	private styles: Exceljs.ExportStyle = {};

	constructor(workbook?: Workbook) {
		if (workbook) {
			this.workbook = workbook;
		} else {
			this.initialWorkbook();
		}
	}

	public initialWorkbook() {
		this.workbook = new Workbook();
	}

	public getCurrentWorksheet() {
		return this.workbook.getWorksheet(this.currentSheet);
	}

	public setWorkSheet(sheetName?: string, options?: AddWorksheetOptions) {
		this.currentSheet = sheetName;
		this.worksheet[this.currentSheet] = this.workbook.addWorksheet(
			sheetName,
			options ?? { properties: this.defaultSheetProperties },
		);

		return this;
	}

	public setProperties(properties: Partial<WorksheetProperties>) {
		this.getCurrentWorksheet().properties = properties as WorksheetProperties;
		return this;
	}

	public build() {
		this.logger.log('************* Build *************');
		this.moveHeaderToLastRow();
		this.setAutoFilter();
		this.mergeCellsTitleRow();
		this.renderData();
		this.mappingStyles();
		this.addConditionalFormating();
		return this;
	}

	private moveHeaderToLastRow() {
		if (!this.headerRow) return;
		const targetRow = this.moveRow(
			this.headerRow['_number'],
			this.getLastRowIndex(),
		);
		this.headerRow = targetRow;
	}

	public setTitleAndHeaderStyles(styles: Exceljs.ExportStyle) {
		this.styles = styles;
		return this;
	}

	public setSubject(subject: Subject<Exceljs.ExportListenerResponse>) {
		this.subject = subject;
		return this;
	}

	public setAddConditionalFormating(
		conditionalFormatingRules: ConditionalFormattingRule[],
	) {
		this.conditionFormatingRules = conditionalFormatingRules;
		return this;
	}

	private addConditionalFormating() {
		if (
			this.firstCellDataAddress &&
			this.lastCellDataAddress &&
			this.conditionFormatingRules
		) {
			this.getCurrentWorksheet().addConditionalFormatting({
				ref: `${this.firstCellDataAddress}:${this.lastCellDataAddress}`,
				rules: this.conditionFormatingRules,
			});
		}
	}

	private mergeCellsTitleRow() {
		this.logger.log('*************** mergeCellsTitleRow ***************');
		if (!this.titleRow || !this.headerRow) return;
		const startRowIndex = this.titleRow['_number'];
		const endRowIndex = startRowIndex;

		const { startColumnIndex, endColumnIndex } = this.getRangeColumnAddress(
			this.headerRow,
		);

		this.getCurrentWorksheet().mergeCells(
			startRowIndex,
			startColumnIndex,
			endRowIndex,
			endColumnIndex,
		);
	}

	private mappingStyles() {
		if (lodash.has(this.styles, 'title') && this.titleRow) {
			this.titleRow.eachCell((cell) => {
				cell.style = this.styles.title;
			});
		}

		if (lodash.has(this.styles, 'header') && this.headerRow) {
			this.headerRow.eachCell((cell) => {
				cell.style = this.styles.header;
			});
		}

		this.getCurrentWorksheet().addConditionalFormatting;
	}

	public setTemplate(template: Exceljs.ExportTemplate) {
		this.template = template;
		this.setColumns();
		this.headerRow = this?.getCurrentWorksheet()?.getRow(1);
		this.setFileType(template.fileType);
		this.setFileName(template.fileName);
		this.setExtension(template.extension);
		return this;
	}

	private setColumns() {
		if (this?.template?.metadata?.columns) {
			this.getCurrentWorksheet().columns = this.template.metadata.columns;
			this.columns = this.template.metadata.columns;
		}
		return this;
	}

	public enalbeAutoFilter(enable: boolean = true) {
		this.isAutoFilter = enable;
		return this;
	}

	private setAutoFilter() {
		this.logger.log('*************** setAutoFilter ***************');
		if (!this.isAutoFilter || !this.headerRow) return;
		const { startColumnAddress, endColumnAddress } = this.getRangeColumnAddress(
			this.headerRow,
		);
		this.getCurrentWorksheet().autoFilter = {
			from: startColumnAddress,
			to: endColumnAddress,
		};
	}

	private getRangeColumnAddress(row: Row) {
		if (!row) return null;
		const startColumnAddress = row['_cells'][0]['_address'];
		const endColumnAddress =
			row['_cells'][row['_cells'].length - 1]['_address'];
		const startColumnIndex = row['_cells'][0]['_column']['_number'];
		const endColumnIndex =
			row['_cells'][row['_cells'].length - 1]['_column']['_number'];
		return {
			startColumnAddress,
			endColumnAddress,
			startColumnIndex,
			endColumnIndex,
		};
	}

	private isValidHeader(): boolean {
		if (!this?.template?.metadata?.headerData?.length) return false;
		return true;
	}

	public setHeaderRows() {
		this.logger.log('************* setHeaderRows *************');

		if (!this.isValidHeader()) return;
		this.template.metadata.headerData.forEach((header) => {
			const addRow = this.getCurrentWorksheet().addRow(toArray(header.value));

			if (header.key === 'title') {
				this.titleRow = addRow;
				const { curRow, targetRow } = this.swapRow(
					this.titleRow,
					this.headerRow,
				);
				this.titleRow = curRow;
				this.headerRow = targetRow;
			}
		});

		return this;
	}

	addBreakLine(numBreak: number = 1) {
		this.getCurrentWorksheet().addRows(
			Array.from({ length: numBreak }).map((_) => null),
		);
		return this;
	}

	setInputData(data: any) {
		this.inputData = data;
		return this;
	}

	setUser(user: any) {
		this.user = user;
		return this;
	}

	setRequestData(
		requestData: ExportFilePartDto | CreateExportFileDto | GetSampleFileDto,
	) {
		this.requestData = requestData;
		return this;
	}

	setOverviewRows() {
		this.logger.log('*********** setOverviewRows ****************');
		this.mapOverviewUserInfomation();
		this.mapOverviewRequestTimestamp();
		this.mapOverviewQueryParams();
		this.mapOverviewTotalItemsCount();
		this.mapOverviewAddStyleRows();
		return this;
	}

	private mapOverviewAddStyleRows() {
		this.getCurrentWorksheet()
			.addRows([...this.mapOverviewComponent])
			.forEach((row) => {
				row.eachCell((cell, colNum) => {
					switch (colNum) {
						case 1:
							cell.style = { font: { bold: true } };
							break;
						case 2:
							cell.numFmt = '@';
							break;
					}
				});
			});
	}

	private mapOverviewUserInfomation() {
		if (!this.user) return;
		this.mapOverviewComponent.set(
			'Thông tin người yêu cầu',
			`[${this.user.phone ?? this.user.email}] ${this.user.name}`,
		);
	}

	private mapOverviewRequestTimestamp() {
		this.mapOverviewComponent.set(
			'Thời gian thực hiện',
			today(dateFormatDMY_hms24h),
		);
	}

	private mapOverviewQueryParams() {
		this.logger.log('**************** mapOverviewQueryParams ***************');
		const queryParams = this?.requestData?.query_params;

		if (!queryParams) return {};

		const queryParamsList = queryParams.split('&');
		queryParamsList.forEach((queryParam) => {
			let [key, val]: any = queryParam.split('=').filter(Boolean);
			this.mapOverviewComponent.set(key, convertValue(val));
		});
	}

	private mapOverviewTotalItemsCount() {
		if (!this?.inputData?.count) return;
		this.mapOverviewComponent.set('Tổng số bản ghi', this.inputData.count);
	}

	async save() {
		this.validate();
		const filePath = this.getFilePath();
		await this.workbook[this.extension].writeFile(filePath);
		return this;
	}

	public getSession() {
		return this.session;
	}

	public setSession(session: string) {
		this.session = session;
		return this;
	}

	public setStorageDirectory(directory: string) {
		this.storageDirectory = join(process.cwd(), directory);
		return this;
	}

	public getFilePath() {
		if (!this.fileName) this.setFileName();
		return join(this.storageDirectory, `${this.fileName}.${this.extension}`);
	}

	setFileType(fileType: Exceljs.FileType) {
		if (fileType === 'static') this.session = undefined;
	}

	public setExtension(extension: Exceljs.ExcelExtension) {
		this.extension = extension;
		return this;
	}

	public setFileName(filename?: string) {
		filename = filename ?? this.requestData.module;
		this.validateFileName(filename);
		this.fileName = [filename, this.session, this?.requestData?.['part']]
			.filter(Boolean)
			.join('-');
		return this;
	}

	private validateFileName(fileName: string) {
		this.logger.log('********** validateFileName ***********');

		if (/\s/.test(fileName))
			throw new Error('Tên file không được có khoảng trắng');

		if (/[^A-Za-z 0-9-_]/.test(fileName)) {
			throw new Error('Tên file không được có ký tự đặc biệt');
		}
	}

	private validate() {
		if (!this.template) throw new Error('Template là bắt buộc');
	}

	public getLastRowIndex(): number {
		return this.getCurrentWorksheet()['_rows'].length;
	}

	public getLastRow(): Row {
		return this.getCurrentWorksheet().getRow(this.getLastRowIndex());
	}

	public swapRowIndex(curIndex, targetIndex) {
		this.logger.log('************ swapRowIndex ***************');
		let currentRow = this.getCurrentWorksheet().getRow(curIndex);
		let targetRow = this.getCurrentWorksheet().getRow(targetIndex);

		const tempRow = this.setTempRow(currentRow);

		currentRow.values = targetRow.values;
		currentRow.eachCell((cell, colNum) => {
			const targetRowCell = targetRow.getCell(colNum);
			this.mappingCellProps.forEach((prop) => {
				cell[prop] = targetRowCell[prop];
			});
		});
		currentRow.commit();

		targetRow.values = tempRow.values;
		targetRow.eachCell((cell, colNum) => {
			const tempRowCell = tempRow.getCell(colNum);
			this.mappingCellProps.forEach((prop) => {
				if (tempRowCell?.[prop]) {
					cell[prop] = tempRowCell[prop];
				}
			});
		});
		targetRow.commit();

		return { currentRow, targetRow };
	}

	public swapRow(curRow: Row, targetRow: Row) {
		this.logger.log('************ swapRow ***************');
		const curRowIndex = curRow['_number'];
		const targetRowIndex = targetRow['_number'];

		const { currentRow: swapCurRow, targetRow: swapTargetRow } =
			this.swapRowIndex(curRowIndex, targetRowIndex);
		curRow = swapTargetRow;
		targetRow = swapCurRow;
		curRow.commit();
		targetRow.commit();
		return { curRow, targetRow };
	}

	private setTempRow(currentRow: Row) {
		const response = this.generateTempWorksheetRow(currentRow);
		const tempRow = this.getTempRow(response);
		this.removeTempWorksheet(response);
		return tempRow;
	}

	private generateTempWorksheetRow(currentRow: Row) {
		const ws = this.addWorkSheet();
		const row = ws.addRow(currentRow.values);
		row.eachCell((cell, colNum) => {
			const currentRowCel = currentRow.getCell(colNum);
			this.mappingCellProps.forEach((prop) => {
				if (currentRowCel?.[prop]) {
					cell[prop] = currentRowCel[prop];
				}
			});
		});
		row.commit();
		return { ws, row };
	}

	private getTempRow({ ws, row }: { ws: Worksheet; row: Row }) {
		return this.workbook.getWorksheet(ws.name).getRow(row['_number']);
	}

	private removeTempWorksheet({ ws }: { ws: Worksheet }) {
		this.workbook.removeWorksheet(ws.name);
	}

	private addWorkSheet(sheetName?: string, options?: AddWorksheetOptions) {
		return this.workbook.addWorksheet(sheetName, options);
	}

	private moveRow(curRowIndex, targetRowIndex) {
		const currentRow = this.getCurrentWorksheet().getRow(curRowIndex);
		const tempCurrentRow = this.setTempRow(currentRow);
		this.getCurrentWorksheet().spliceRows(curRowIndex, 1);

		const targetRow = this.getCurrentWorksheet().getRow(targetRowIndex);
		targetRow.values = tempCurrentRow.values;
		targetRow.eachCell((cell, colNum) => {
			const tempRowCel = tempCurrentRow.getCell(colNum);
			this.mappingCellProps.forEach((prop) => {
				if (tempRowCel?.[prop]) {
					cell[prop] = tempRowCel[prop];
				}
			});
		});
		targetRow.commit();
		return targetRow;
	}

	private renderData() {
		this.logger.log('************** insertData **************');
		const keys = this.getKeys();
		const stylesKey = Object.entries(keys).reduce((acc, [key, val]: any) => {
			acc[key] = val.style;
			return acc;
		}, {});

		this.render(stylesKey);
	}

	getExportStatus(currentItem, totalItems) {
		if (currentItem === 0) return ENUM_EXPORT_STATUS.INIT;
		if (currentItem < totalItems) return ENUM_EXPORT_STATUS.PROCESSING;
		return ENUM_EXPORT_STATUS.COMPLETE;
	}

	public getKeys() {
		return this.getCurrentWorksheet()['_keys'] ?? {};
	}

	private getColumnTemplateDefinitionInfo(colNum) {
		return this.columns[colNum - 1];
	}

	private transformData(
		originalValue: any,
		transformList: Exceljs.TransformData[],
	) {
		if (transformList?.length) {
			for (const { fromValue, toValue } of transformList) {
				if (utils.isEqual(fromValue, originalValue)) {
					return toValue;
				}
			}
		}

		return originalValue;
	}

	render(stylesKey?: Record<string, any>) {
		if (!this?.inputData?.items?.length) return;
		this.inputData.items.forEach((dataItem, itemIdx) => {
			const row = this.getCurrentWorksheet().addRow(dataItem);

			row.eachCell((cell, colNum) => {
				if (lodash.has(stylesKey, cell['_column']['_key'])) {
					cell.style = stylesKey[cell['_column']['_key']];
				}
				const currentItemIndex =
					row['_number'] - this?.headerRow?.['_number'] ?? 0;

				if (utils.typeOf(cell?.['model']?.['rawValue']) === 'array') {
					if (cell['model']['rawValue'].length) {
						row.height =
							this.defaultSheetProperties.defaultRowHeight +
							10 * (cell['model']['rawValue'].length - 1);

						row.alignment = {
							vertical: 'middle',
						};
					}
					cell.alignment = { wrapText: true };
					cell.value = cell['model']['rawValue'].join('\n');
				}

				const columnTemplateDefinition =
					this.getColumnTemplateDefinitionInfo(colNum);

				//TODO: cell Transform Data
				cell.value = this.transformData(
					cell.value,
					columnTemplateDefinition.transform,
				);

				//TODO: Format Datetime for Cell
				if (checkValidTimestamp(cell.value) && cell.value instanceof Date) {
					const dateFormat = columnTemplateDefinition?.dateFormat;
					cell.value = formatDateTime(cell.value, dateFormat);
				}

				//TODO: Cell Alignment
				cell.alignment = columnTemplateDefinition.alignment;

				this.subject.next({
					current_item: currentItemIndex as number,
					total_items: this.inputData.count as number,
					session: this.session,
					module: this.requestData.module,
					status: this.getExportStatus(currentItemIndex, this.inputData.count),
					file_path: this.getFilePath(),
					part: this.requestData['part'],
				});

				//TODO: Get First Cell Data Address
				if (itemIdx === 0 && colNum === 1) {
					this.firstCellDataAddress = cell['_address'];
				}

				//TODO: Get Last Cell Data Addres
				if (
					itemIdx === this.inputData.items.length - 1 &&
					colNum === row.cellCount
				) {
					this.lastCellDataAddress = cell['_address'];
				}
			});

			row.commit();
		});
	}
}
