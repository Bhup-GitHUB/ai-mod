import { Env, SummarizationResult } from '../types';
import { AI_MODELS, API_CONFIG } from '../utils/constants';

export class SummarizationService {
	constructor(private env: Env) {}

	async summarize(text: string, maxLength?: number): Promise<SummarizationResult> {
		const summaryLength = maxLength || API_CONFIG.MAX_SUMMARY_LENGTH;

		const response = await this.env.AI.run(AI_MODELS.SUMMARIZATION, {
			input_text: text,
			max_length: summaryLength,
		});

		const summary = response.summary || response.text || (typeof response === 'string' ? response : text.slice(0, summaryLength));

		if (typeof summary !== 'string') {
			throw new Error('Invalid summarization response');
		}

		return {
			summary: summary.trim(),
			originalLength: text.length,
			summaryLength: summary.trim().length,
		};
	}

	shouldSummarize(text: string): boolean {
		return text.length > 500;
	}
}
