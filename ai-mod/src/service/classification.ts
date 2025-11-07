import { Env, ClassificationResult } from '../types';
import { AI_MODELS } from '../utils/constants';

export class ClassificationService {
	constructor(private env: Env) {}

	async classify(text: string): Promise<ClassificationResult> {
		const prompt = this.buildClassificationPrompt(text);

		const response = await this.env.AI.run(AI_MODELS.CLASSIFICATION, {
			prompt: prompt,
			max_tokens: 100,
		});

		return this.parseClassificationResponse(response.response);
	}

	private buildClassificationPrompt(text: string): string {
		return `Analyze the following text and classify it. Respond ONLY with a JSON object in this exact format:
{"category": "one of: spam, legitimate, promotional, informational, social", "confidence": 0.0-1.0, "isSpam": true/false}

Text to analyze: "${text}"

JSON Response:`;
	}

	private parseClassificationResponse(aiResponse: string): ClassificationResult {
		try {
			const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);

			if (jsonMatch) {
				const parsed = JSON.parse(jsonMatch[0]);
				return {
					category: parsed.category || 'unknown',
					confidence: parsed.confidence || 0.5,
					isSpam: parsed.isSpam || false,
				};
			}
		} catch (error) {
			console.error('Failed to parse classification response:', error);
		}

		const lowerResponse = aiResponse.toLowerCase();
		const isSpam = lowerResponse.includes('spam') || lowerResponse.includes('promotional');

		return {
			category: isSpam ? 'spam' : 'legitimate',
			confidence: 0.6,
			isSpam,
		};
	}
}
