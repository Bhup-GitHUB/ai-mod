import { Env } from './types';
import { Router } from './router';
import { ResponseFormatter } from './utils/response';
import { ERROR_CODES, HTTP_STATUS } from './utils/constants';
import { handleCORS } from './middlewares/cors';

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const corsResponse = handleCORS(request);
		if (corsResponse) {
			return corsResponse;
		}

		const url = new URL(request.url);
		const router = new Router(env);

		let response: Response;

		try {
			if (url.pathname === '/api/moderate' && request.method === 'POST') {
				response = await router.handleModerateRequest(request);
			} else if (url.pathname === '/health' || url.pathname === '/') {
				response = await router.handleHealthCheck();
			} else {
				response = ResponseFormatter.error(ERROR_CODES.INVALID_REQUEST, `Route not found: ${url.pathname}`, HTTP_STATUS.NOT_FOUND);
			}
		} catch (error) {
			response = ResponseFormatter.error(ERROR_CODES.INTERNAL_ERROR, 'An unexpected error occurred', HTTP_STATUS.INTERNAL_ERROR);
		}

		return ResponseFormatter.cors(response);
	},
};
