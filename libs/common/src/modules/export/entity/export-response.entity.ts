import { Exceljs } from '@app/shared/exceljs/types/exceljs.type';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ExportResponseEntity implements Exceljs.ExportReponse {
	@ApiPropertyOptional({
		example:
			'D:\\dni-project\\dni-service\\libs\\shared\\src\\exceljs\\templates\\import-client-sample.xlsx',
	})
	file_path?: string;

	@ApiPropertyOptional({ example: 'ClientSample' })
	module?: string;

	@ApiPropertyOptional({ example: "123737812749" })
	session?: string;
}
