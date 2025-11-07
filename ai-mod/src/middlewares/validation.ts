import { ModerationRequest } from '../types';
import { API_CONFIG, ERROR_CODES } from '../utils/constants';
import { ResponseFormatter } from '../utils/response';

export async function validateRequest(request: Request): Promise<Response | ModerationRequest> {
	if (request.method !== 'POST') {
		return ResponseFormatter.error(ERROR_CODES.INVALID_REQUEST, 'Only POST requests are allowed', 400);
	}

	let body: any;
	try {
		body = await request.json();
	} catch (error) {
		return ResponseFormatter.error(ERROR_CODES.INVALID_REQUEST, 'Invalid JSON in request body', 400);
	}

	if (!body.text || typeof body.text !== 'string') {
		return ResponseFormatter.error(ERROR_CODES.MISSING_TEXT, 'Text field is required and must be a string', 400);
	}

	if (body.text.length < API_CONFIG.MIN_TEXT_LENGTH) {
		return ResponseFormatter.error(ERROR_CODES.TEXT_TOO_SHORT, `Text must be at least ${API_CONFIG.MIN_TEXT_LENGTH} characters`, 400);
	}

	if (body.text.length > API_CONFIG.MAX_TEXT_LENGTH) {
		return ResponseFormatter.error(ERROR_CODES.TEXT_TOO_LONG, `Text must not exceed ${API_CONFIG.MAX_TEXT_LENGTH} characters`, 400);
	}

	return body as ModerationRequest;
}
