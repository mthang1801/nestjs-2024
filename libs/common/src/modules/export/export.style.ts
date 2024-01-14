import { Exceljs } from '@app/shared/exceljs/types/exceljs.type';
import { ConditionalFormattingOptions } from 'exceljs';

export class ExportStyle {
	static Default: Exceljs.ExportStyle = {
		title: {
			font: {
				bold: true,
				size: 20,
				color: {
					argb: '000',
				},
			},
			fill: {
				type: 'pattern',
				pattern: 'solid',
				fgColor: { argb: '0fbd40' },
			},
			alignment: {
				horizontal: 'center',
				vertical: 'middle',
			},
		},
		header: {
			font: {
				bold: true,
				color: {
					argb: 'ececec',
				},
			},
			fill: {
				type: 'pattern',
				pattern: 'solid',
				fgColor: { argb: '0fbd40' },
			},
			alignment: {
				wrapText: true,
				horizontal: 'center',
				vertical: 'middle',
			},
		},
	};
}
