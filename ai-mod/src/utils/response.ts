import { ModerationResponse, ErrorResponse } from '../types';
import { HTTP_STATUS } from './constants';

export class ResponseFormatter {
	static success(data: any, metadata: any): Response {
		const response: ModerationResponse = {
			success: true,
			data,
			metadata: {
				...metadata,
				timestamp: new Date().toISOString(),
			},
		};

		return new Response(JSON.stringify(response), {
			status: HTTP_STATUS.OK,
			headers: {
				'Content-Type': 'application/json',
				'Cache-Control': 'no-cache',
			},
		});
	}

	static error(code: string, message: string, status: number = HTTP_STATUS.BAD_REQUEST, details?: any): Response {
		const response: ErrorResponse = {
			success: false,
			error: {
				code,
				message,
				...(details && { details }),
			},
			timestamp: new Date().toISOString(),
		};

		return new Response(JSON.stringify(response), {
			status,
			headers: {
				'Content-Type': 'application/json',
			},
		});
	}

	static cors(response: Response): Response {
		const headers = new Headers(response.headers);
		headers.set('Access-Control-Allow-Origin', '*');
		headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
		headers.set('Access-Control-Allow-Headers', 'Content-Type');

		return new Response(response.body, {
			status: response.status,
			statusText: response.statusText,
			headers,
		});
	}
}
