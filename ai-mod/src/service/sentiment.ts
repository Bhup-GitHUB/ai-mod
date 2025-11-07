import { Env, SentimentResult } from '../types';
import { AI_MODELS } from '../utils/constants';

export class SentimentService {
	constructor(private env: Env) {}

	async analyze(text: string): Promise<SentimentResult> {
		const response = await this.env.AI.run(AI_MODELS.SENTIMENT, {
			text: text,
		});

		// Handle array response - find the result with highest score
		let results: any[];
		if (Array.isArray(response)) {
			results = response;
		} else if (response && typeof response === 'object') {
			// If it's an object, check if it has an array property
			if (Array.isArray((response as any).results)) {
				results = (response as any).results;
			} else {
				results = [response];
			}
		} else {
			throw new Error('Invalid sentiment analysis response format');
		}

		// Find the result with the highest score
		if (results.length === 0) {
			throw new Error('Empty sentiment analysis response');
		}

		// Sort by score descending and take the first one
		const sortedResults = results
			.filter((r) => r && typeof r === 'object' && r.hasOwnProperty('score'))
			.sort((a, b) => (b.score || 0) - (a.score || 0));

		const topResult = sortedResults[0] || results[0];

		if (!topResult || typeof topResult !== 'object') {
			throw new Error('Invalid sentiment analysis response');
		}

		const label = this.normalizeLabel(topResult.label || 'NEUTRAL');
		const score = topResult.score || 0.5;
		const confidence = Math.round(score * 100);

		return {
			label,
			score: parseFloat(score.toFixed(4)),
			confidence,
		};
	}

	private normalizeLabel(label: string): 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' {
		const normalizedLabel = label.toUpperCase();

		if (normalizedLabel.includes('POSITIVE')) return 'POSITIVE';
		if (normalizedLabel.includes('NEGATIVE')) return 'NEGATIVE';
		return 'NEUTRAL';
	}
}
