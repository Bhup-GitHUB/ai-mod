import { ResponseFormatter } from '../utils/response';
import { ERROR_CODES, HTTP_STATUS } from '../utils/constants';

export function handleError(error: any): Response {
	console.error('Error occurred:', error);

	if (error.message?.includes('AI') || error.message?.includes('model')) {
		return ResponseFormatter.error(ERROR_CODES.AI_ERROR, 'AI service temporarily unavailable', HTTP_STATUS.INTERNAL_ERROR, {
			originalError: error.message,
		});
	}

	return ResponseFormatter.error(ERROR_CODES.INTERNAL_ERROR, 'An unexpected error occurred', HTTP_STATUS.INTERNAL_ERROR, {
		originalError: error.message,
	});
}
