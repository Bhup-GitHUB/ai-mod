export interface Env {
	AI: any;
	ENVIRONMENT?: string;
}

export interface ModerationRequest {
	text: string;
	features?: ModerationFeature[];
	options?: ModerationOptions;
}

export type ModerationFeature = 'sentiment' | 'classification' | 'summarization' | 'all';

export interface ModerationOptions {
	includeScores?: boolean;
	threshold?: number;
	maxLength?: number;
}

export interface SentimentResult {
	label: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
	score: number;
	confidence: number;
}

export interface ClassificationResult {
	category: string;
	confidence: number;
	isSpam: boolean;
}

export interface SummarizationResult {
	summary: string;
	originalLength: number;
	summaryLength: number;
}

export interface ModerationResponse {
	success: boolean;
	data: {
		text: string;
		sentiment?: SentimentResult;
		classification?: ClassificationResult;
		summarization?: SummarizationResult;
	};
	metadata: {
		timestamp: string;
		processingTime: number;
		features: ModerationFeature[];
	};
}

export interface ErrorResponse {
	success: false;
	error: {
		code: string;
		message: string;
		details?: any;
	};
	timestamp: string;
}
