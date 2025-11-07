export const AI_MODELS = {
	SENTIMENT: '@cf/huggingface/distilbert-sst-2-int8',
	CLASSIFICATION: '@cf/meta/llama-2-7b-chat-int8',
	SUMMARIZATION: '@cf/facebook/bart-large-cnn',
} as const;

export const API_CONFIG = {
	MAX_TEXT_LENGTH: 5000,
	MIN_TEXT_LENGTH: 10,
	DEFAULT_THRESHOLD: 0.7,
	MAX_SUMMARY_LENGTH: 150,
} as const;

export const HTTP_STATUS = {
	OK: 200,
	BAD_REQUEST: 400,
	NOT_FOUND: 404,
	INTERNAL_ERROR: 500,
	TOO_MANY_REQUESTS: 429,
} as const;

export const ERROR_CODES = {
	INVALID_REQUEST: 'INVALID_REQUEST',
	TEXT_TOO_SHORT: 'TEXT_TOO_SHORT',
	TEXT_TOO_LONG: 'TEXT_TOO_LONG',
	MISSING_TEXT: 'MISSING_TEXT',
	AI_ERROR: 'AI_ERROR',
	INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;
