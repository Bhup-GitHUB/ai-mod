import { env, SELF } from 'cloudflare:test';
import { describe, it, expect } from 'vitest';

describe('Content Moderator API', () => {
	it('responds to health check', async () => {
		const response = await SELF.fetch('https://example.com/health');

		expect(response.status).toBe(200);
		const data = (await response.json()) as any;
		expect(data.status).toBe('healthy');
		expect(data.version).toBe('1.0.0');
	});

	it('responds to root path with health check', async () => {
		const response = await SELF.fetch('https://example.com/');

		expect(response.status).toBe(200);
		const data = (await response.json()) as any;
		expect(data.status).toBe('healthy');
	});

	it('handles CORS preflight request', async () => {
		const response = await SELF.fetch('https://example.com/api/moderate', {
			method: 'OPTIONS',
		});

		expect(response.status).toBe(204);
		expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
	});

	it('returns 404 for unknown routes', async () => {
		const response = await SELF.fetch('https://example.com/unknown');

		expect(response.status).toBe(404);
		const data = (await response.json()) as any;
		expect(data.success).toBe(false);
		expect(data.error.code).toBe('INVALID_REQUEST');
	});

	it('validates moderation request body', async () => {
		const response = await SELF.fetch('https://example.com/api/moderate', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({}),
		});

		expect(response.status).toBe(400);
		const data = (await response.json()) as any;
		expect(data.success).toBe(false);
		expect(data.error.code).toBe('MISSING_TEXT');
	});

	it('validates text length minimum', async () => {
		const response = await SELF.fetch('https://example.com/api/moderate', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ text: 'short' }),
		});

		expect(response.status).toBe(400);
		const data = (await response.json()) as any;
		expect(data.success).toBe(false);
		expect(data.error.code).toBe('TEXT_TOO_SHORT');
	});
});
