import { ENUM_FORM_ANSWER_STATUS, ENUM_GENDER } from '../constants';
import { Exceljs } from '../exceljs/types/exceljs.type';
import * as date from '../utils/dates.utils';

export const EXPORT_COLUMNS_CONFIG: Record<
	Exceljs.ExportTemplateKeys,
	Exceljs.ExportTemplate
> = {
	Client: {
		name: 'Client',
		sheetName: 'Client',
		fileName: 'Client',
		extension: 'xlsx',
		fileType: 'dynamic',
		metadata: {
			headerData: [{ key: 'title', value: 'BÁO CÁO KHÁCH HÀNG' }],
			queryParamsDescription: {
				affiliation: {
					description: 'Trạng thái phân bổ',
					type: 'boolean',
					if_true: 'Đã phân bổ',
					if_false: 'Chưa phân bổ',
				},
				from_last_trade_at: {
					description: 'Giao dịch lần cuối từ',
					type: 'date',
				},
				to_last_trade_at: {
					description: 'Giao dịch lần cuối đến',
					type: 'date',
				},
				from_volumn_lots: {
					description: 'Khối lượng giao dịch từ',
					type: 'number',
				},
				to_volumn_lots: {
					description: 'Khối lượng giao dịch đến',
					type: 'number',
				},
			},
			columns: [
				{ header: 'Họ và tên', key: 'name', width: 30 },
				{ header: 'Email', key: 'email', width: 30 },
				{ header: 'Tên Zalo', key: 'zalo_name', width: 20 },
				{ header: 'Telegram username', key: 'telegram_username', width: 20 },
				{ header: 'SĐT', key: 'phone', width: 20, style: { numFmt: '0' } },
				{
					header: 'Zalo Phone',
					key: 'zalo_phone',
					width: 20,
					style: { numFmt: '@' },
				},
				{
					header: 'KH dưới link',
					key: 'affiliation',
					width: 15,
					transform: [
						{ fromValue: true, toValue: 'Có' },
						{ fromValue: false, toValue: 'Không' },
					],
					alignment: {
						vertical: 'middle',
						horizontal: 'center',
					},
				},
				{
					header: 'Giới tính',
					key: 'gender',
					width: 10,
					transform: [
						{ fromValue: ENUM_GENDER.MALE, toValue: 'Nam' },
						{ fromValue: ENUM_GENDER.FEMALE, toValue: 'Nữ' },
						{ fromValue: ENUM_GENDER.OTHER, toValue: 'Khác' },
					],
					alignment: {
						vertical: 'middle',
						horizontal: 'center',
					},
				},
				{ header: 'Năm sinh', key: 'dob', width: 10 },
				{
					header: 'Nhóm ',
					key: 'groups_info_format',
					width: 20,
					alignment: {
						wrapText: true,
					},
				},
				{
					header: 'Tổng KL giao dịch',
					key: 'volumn_lots',
					width: 15,
				},
				{
					header: 'Tổng lợi nhuận',
					key: 'reward_usd',
					width: 15,
					style: { numFmt: '#,##0.00;[Red]-#,##0.00' },
				},
				{
					header: 'Lần giao dịch gần nhất',
					key: 'last_trade_at',
					width: 15,
					dateFormat: date.dateFormatYMD,
				},

				{
					header: 'Tài khoản dự thi ',
					key: 'trade_account_for_contest',
					width: 15,
				},
				{ header: 'Passview ', key: 'passview', width: 15 },
				{ header: 'Trade App ', key: 'trade_app', width: 15 },
				{ header: 'Trade Server ', key: 'trade_server', width: 15 },
				{ header: 'Group Info', key: 'groups_info', width: 0, hidden: true },
			],
			footerData: [],
		},
	},
	ClientSample: {
		name: 'Client',
		sheetName: 'CLIENT_14',
		fileName: 'import-client-sample',
		extension: 'xlsx',
		fileType: 'static',
	},
	FormAnswer: {
		name: 'FormAnswer',
		sheetName: 'FormAnswer',
		fileName: 'FormAnswer',
		extension: 'xlsx',
		fileType: 'dynamic',
		metadata: {
			headerData: [{ key: 'title', value: 'BÁO CÁO KHÁCH HÀNG ĐIỀN BIỂU MÃU' }],
			queryParamsDescription: {
				affiliation: {
					description: 'Trạng thái phân bổ',
					type: 'boolean',
					if_true: 'Đã phân bổ',
					if_false: 'Chưa phân bổ',
				},
				from_created_at: {
					description: 'Điền form từ ngày',
					type: 'date',
				},
				to_created_at: {
					description: 'Điền form đến ngày',
					type: 'date',
				},
			},
			columns: [
				{ header: 'Họ và tên', key: 'name', width: 30 },
				{ header: 'Email', key: 'email', width: 30 },
				{ header: 'Tên Zalo', key: 'zalo_name', width: 20 },
				{ header: 'Telegram username', key: 'telegram_username', width: 20 },
				{ header: 'SĐT', key: 'phone', width: 20, style: { numFmt: '0' } },
				{
					header: 'Zalo Phone',
					key: 'zalo_phone',
					width: 20,
					style: { numFmt: '@' },
				},
				{
					header: 'KH dưới link',
					key: 'affiliation',
					width: 15,
					transform: [
						{ fromValue: true, toValue: 'Có' },
						{ fromValue: false, toValue: 'Không' },
					],
					alignment: {
						vertical: 'middle',
						horizontal: 'center',
					},
				},
				{
					header: 'Giới tính',
					key: 'gender',
					width: 10,
					transform: [
						{ fromValue: ENUM_GENDER.MALE, toValue: 'Nam' },
						{ fromValue: ENUM_GENDER.FEMALE, toValue: 'Nữ' },
						{ fromValue: ENUM_GENDER.OTHER, toValue: 'Khác' },
					],
					alignment: {
						vertical: 'middle',
						horizontal: 'center',
					},
				},
				{ header: 'Năm sinh', key: 'dob', width: 10 },
				{
					header: 'Tài khoản dự thi ',
					key: 'trade_account_for_contest',
					width: 15,
				},
				{ header: 'Passview ', key: 'passview', width: 15 },
				{ header: 'Trade App ', key: 'trade_app', width: 15 },
				{ header: 'Trade Server ', key: 'trade_server', width: 15 },
				{
					header: 'Xuất báo cáo lần cuối',
					key: 'exported_at',
					width: 20,
					dateFormat: date.dateFormatDMY_hms24h,
				},
				{ header: 'Biểu mẫu', key: 'form_info', width: 30 },
				{
					header: 'Trạng thái',
					key: 'status',
					width: 30,
					transform: [
						{ fromValue: ENUM_FORM_ANSWER_STATUS.NEW, toValue: 'Mới' },
						{
							fromValue: ENUM_FORM_ANSWER_STATUS.PROCESSING,
							toValue: 'Đang xử lý',
						},
						{
							fromValue: ENUM_FORM_ANSWER_STATUS.COMPLETE,
							toValue: 'Hoàn thành',
						},
					],
				},
				{ header: 'Nhân viên hỗ trợ ', key: 'supporter_info', width: 30 },
			],
			footerData: [],
		},
	},
	User: {
		name: 'User',
		sheetName: 'User',
		fileName: 'User',
		extension: 'xlsx',
		fileType: 'dynamic',
		metadata: {
			headerData: [{ key: 'title', value: 'BÁO CÁO KHÁCH HÀNG ĐIỀN BIỂU MÃU' }],
			queryParamsDescription: {
				affiliation: {
					description: 'Người dùng hệ thống',
					type: 'boolean',
					if_true: 'Đã phân bổ',
					if_false: 'Chưa phân bổ',
				},
				from_created_at: {
					description: 'Điền form từ ngày',
					type: 'date',
				},
				to_created_at: {
					description: 'Điền form đến ngày',
					type: 'date',
				},
			},
			columns: [
				{ header: 'Họ và tên', key: 'name', width: 30 },
				{ header: 'Email', key: 'email', width: 30 },
				{ header: 'Tên Zalo', key: 'zalo_name', width: 20 },
				{ header: 'Telegram username', key: 'telegram_username', width: 20 },
				{ header: 'SĐT', key: 'phone', width: 20, style: { numFmt: '0' } },
				{
					header: 'Zalo Phone',
					key: 'zalo_phone',
					width: 20,
					style: { numFmt: '@' },
				},
				{
					header: 'KH dưới link',
					key: 'affiliation',
					width: 15,
					transform: [
						{ fromValue: true, toValue: 'Có' },
						{ fromValue: false, toValue: 'Không' },
					],
					alignment: {
						vertical: 'middle',
						horizontal: 'center',
					},
				},
				{
					header: 'Giới tính',
					key: 'gender',
					width: 10,
					transform: [
						{ fromValue: ENUM_GENDER.MALE, toValue: 'Nam' },
						{ fromValue: ENUM_GENDER.FEMALE, toValue: 'Nữ' },
						{ fromValue: ENUM_GENDER.OTHER, toValue: 'Khác' },
					],
					alignment: {
						vertical: 'middle',
						horizontal: 'center',
					},
				},
				{ header: 'Năm sinh', key: 'dob', width: 10 },
				{
					header: 'Tài khoản dự thi ',
					key: 'trade_account_for_contest',
					width: 15,
				},
				{ header: 'Passview ', key: 'passview', width: 15 },
				{ header: 'Trade App ', key: 'trade_app', width: 15 },
				{ header: 'Trade Server ', key: 'trade_server', width: 15 },
				{
					header: 'Xuất báo cáo lần cuối',
					key: 'exported_at',
					width: 20,
					dateFormat: date.dateFormatDMY_hms24h,
				},
				{ header: 'Biểu mẫu', key: 'form_info', width: 30 },
				{
					header: 'Trạng thái',
					key: 'status',
					width: 30,
					transform: [
						{ fromValue: ENUM_FORM_ANSWER_STATUS.NEW, toValue: 'Mới' },
						{
							fromValue: ENUM_FORM_ANSWER_STATUS.PROCESSING,
							toValue: 'Đang xử lý',
						},
						{
							fromValue: ENUM_FORM_ANSWER_STATUS.COMPLETE,
							toValue: 'Hoàn thành',
						},
					],
				},
				{ header: 'Nhân viên hỗ trợ ', key: 'supporter_info', width: 30 },
			],
			footerData: [],
		},
	},
};
