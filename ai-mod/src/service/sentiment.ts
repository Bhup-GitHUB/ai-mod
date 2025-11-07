import { Env, SentimentResult } from '../types';
import { AI_MODELS } from '../utils/constants';

export class SentimentService {
	constructor(private env: Env) {}

	async analyze(text: string): Promise<SentimentResult> {
		const response = await this.env.AI.run(AI_MODELS.SENTIMENT, {
			text: text,
		});

		const topResult = response[0];

		const label = this.normalizeLabel(topResult.label);
		const score = topResult.score;
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
