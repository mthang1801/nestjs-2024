import { ExpressionRuleType } from 'exceljs';

export class ExportConditionFormat {
	static EachRowDataFormatingDefault: ExpressionRuleType[] = [
		{
			type: 'expression',
			priority: 1,
			formulae: ['MOD(ROW(),2)=0'],
			style: {
				fill: {
					type: 'pattern',
					pattern: 'solid',
					bgColor: { argb: 'dcf5e1' },
				},
				border: {
					top: { style: 'thin', color: { argb: 'e0e0e0' } },
					left: { style: 'thin', color: { argb: 'e0e0e0' } },
					bottom: { style: 'thin', color: { argb: 'e0e0e0' } },
					right: { style: 'thin', color: { argb: 'e0e0e0' } },
				},
			},
		},
		{
			type: 'expression',
			priority: 2,
			formulae: ['MOD(ROW(),1)=0'],
			style: {
				fill: {
					type: 'pattern',
					pattern: 'solid',
					bgColor: { argb: 'f5f2dc' },
				},
				border: {
					top: { style: 'thin', color: { argb: 'e0e0e0' } },
					left: { style: 'thin', color: { argb: 'e0e0e0' } },
					bottom: { style: 'thin', color: { argb: 'e0e0e0' } },
					right: { style: 'thin', color: { argb: 'e0e0e0' } },
				},
			},
		},
	];
}
