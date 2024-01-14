import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class DownloadExportFileDto {
	@IsNotEmpty()
	@ApiProperty({
		example:
			'D:\\dni-project\\dni-service\\libs\\shared\\src\\exceljs\\templates\\Client-1697984450461.xlsx',
	})
	file_path: string;
}
