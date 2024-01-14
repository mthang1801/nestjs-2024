import { MulterOptions } from "@nestjs/platform-express/multer/interfaces/multer-options.interface";

export type UploadFileOptions = {
	fieldName: string;
	path?: string;
	limit?: MulterOptions['limits'];
	fileFilter?: MulterOptions['fileFilter'];
};

export type UploadFilesOptions = {
	fieldName: string;
	maxCount?: number;
	path: string;
	limit?: MulterOptions['limits'];
	fileFilter?: MulterOptions['fileFilter'];
};
