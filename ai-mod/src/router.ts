import { handleError } from './middlewares/errorHandler';
import { validateRequest } from './middlewares/validation';
import { ClassificationService } from './service/classification';
import { SentimentService } from './service/sentiment';
import { SummarizationService } from './service/summarization';
import { Env, ModerationRequest, ModerationFeature } from './types';
import { ResponseFormatter } from './utils/response';

export class Router {
	private sentimentService: SentimentService;
	private classificationService: ClassificationService;
	private summarizationService: SummarizationService;

	constructor(private env: Env) {
		this.sentimentService = new SentimentService(env);
		this.classificationService = new ClassificationService(env);
		this.summarizationService = new SummarizationService(env);
	}

	async handleModerateRequest(request: Request): Promise<Response> {
		const startTime = Date.now();

		try {
			const validationResult = await validateRequest(request);

			if (validationResult instanceof Response) {
				return validationResult;
			}

			const moderationRequest = validationResult as ModerationRequest;
			const features = this.determineFeatures(moderationRequest);

			const results = await this.executeModeration(moderationRequest.text, features, moderationRequest.options);

			const processingTime = Date.now() - startTime;

			return ResponseFormatter.success(
				{
					text: moderationRequest.text,
					...results,
				},
				{
					processingTime,
					features,
				}
			);
		} catch (error) {
			return handleError(error);
		}
	}

	private determineFeatures(request: ModerationRequest): ModerationFeature[] {
		if (!request.features || request.features.length === 0 || request.features.includes('all')) {
			return ['sentiment', 'classification', 'summarization'];
		}
		return request.features;
	}

	private async executeModeration(text: string, features: ModerationFeature[], options?: any): Promise<any> {
		const promises: Promise<any>[] = [];
		const results: any = {};

		if (features.includes('sentiment')) {
			promises.push(
				this.sentimentService.analyze(text).then((result) => {
					results.sentiment = result;
				})
			);
		}

		if (features.includes('classification')) {
			promises.push(
				this.classificationService.classify(text).then((result) => {
					results.classification = result;
				})
			);
		}

		if (features.includes('summarization')) {
			if (this.summarizationService.shouldSummarize(text)) {
				promises.push(
					this.summarizationService.summarize(text, options?.maxLength).then((result) => {
						results.summarization = result;
					})
				);
			}
		}

		await Promise.all(promises);

		return results;
	}

	async handleHealthCheck(): Promise<Response> {
		return new Response(
			JSON.stringify({
				status: 'healthy',
				timestamp: new Date().toISOString(),
				version: '1.0.0',
			}),
			{
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			}
		);
	}
}
