import { User } from '@app/common';
import { CreateExportFileDto } from '@app/common/modules/export/dto/create-export.dto';
import { AbstractType } from '@app/shared/abstract/types/abstract.type';
import {
  CommonConfig,
  IMPORT_COLUMNS_CONFIG
} from '@app/shared/config';
import { ENUM_EXPORT_STATUS } from '@app/shared/constants';
import { Style, Worksheet } from 'exceljs';

export namespace Exceljs {
	export type ExcelExtension = 'xlsx' | 'csv' | 'pdf';
	export type FileType = 'static' | 'dynamic'; // File dynamic sẽ kèm session, static thì không
	export type TransformData = {
		fromValue: any;
		toValue: any;
	};

	export type ExcelColumn = {
		header: string;
		key: string;
		width?: number;
		column?: string;
		style?: any;
		hidden?: boolean;
		dateFormat?: string; // định dạng cột theo date format
		transform?: TransformData[];
		alignment?: Style['alignment'];
	};
	export type RowIdxAndColumnKeys = {
		headerRowIndex: number;
		columnKeys: ExcelColumn[];
	};
	export type ImportTemplate = keyof typeof IMPORT_COLUMNS_CONFIG;
	export type ExcelColumnDefinition = Record<
		ImportTemplate,
		ExcelColumnDefinitionValue
	>;
	export type ExcelMetadata = {
		header: string;
		key: string;
		width?: number;
	};
	export type ExcelColumnDefinitionValue = {
		metadata: ExcelMetadata[];
	};
	export type DataSheet = {
		templateName: ImportTemplate;
		data: any[];
	};
	export type ExportTemplateKeys = keyof typeof CommonConfig.EXPORT_MODULE;
	export type ExportMetadata = {
		queryParamsDescription: Record<string, any>;
		headerData: { key: string; value: any | any[] }[];
		columns: ExcelColumn[];
		footerData: Array<Record<string, any>>;
	};
	export type ExportTemplate = {
		name: ExportTemplateKeys;
		sheetName?: string;
		fileName: any;
		extension: ExcelExtension;
		metadata?: ExportMetadata;
		fileType: FileType;
	};
	export type ExportResponseData = {
		items: any[];
		count: number;
		filterQuery: Record<string, any>;
		module: string;
	};

	export type RequestUserInfomartion = {
		payload?: CreateExportFileDto;
		data?: AbstractType.FindAndCountAllResponse<any>;
		user?: User;
		ws?: Worksheet;
		template?: ExportTemplate;
	};
	export type ExportOverview = {
		payload?: CreateExportFileDto;
		data?: AbstractType.FindAndCountAllResponse<any>;
		user?: User;
	};
	export type ExportStyle = {
		title?: Partial<Style>;
		header?: Partial<Style>;
		addConditionalFormatting?: Partial<Style>;
	};
	export type ExportReponse = {
		module?: string;
		session?: string;
		file_path?: string;
	};
	export type ExportListenerResponse = {
		current_item: number;
		total_items: number;
		session: string;
		module: string;
		file_path: string;
		status: keyof typeof ENUM_EXPORT_STATUS;
		part: number;
	};
}
