# AI Content Moderator API

Serverless AI-powered content moderation API running on Cloudflare Workers.

## Features

- **Sentiment Analysis**: Detect positive, negative, or neutral sentiment
- **Text Classification**: Spam detection and content categorization
- **Text Summarization**: Generate concise summaries of long content

## API Endpoints

### POST /api/moderate

Moderate content with AI analysis.

**Request Body:**

```json
{
  "text": "Your text to analyze here",
  "features": ["sentiment", "classification", "summarization"],
  "options": {
    "maxLength": 150
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "text": "Your text...",
    "sentiment": {
      "label": "POSITIVE",
      "score": 0.9876,
      "confidence": 99
    },
    "classification": {
      "category": "legitimate",
      "confidence": 0.92,
      "isSpam": false
    },
    "summarization": {
      "summary": "Brief summary here...",
      "originalLength": 1500,
      "summaryLength": 120
    }
  },
  "metadata": {
    "timestamp": "2024-11-07T10:30:00Z",
    "processingTime": 234,
    "features": ["sentiment", "classification", "summarization"]
  }
}
```

### GET /health

Check API health status.

## Development

```bash
# Check project setup and configuration
npm run check

# Run TypeScript type checking
npm run typecheck

# Run locally
npm run dev

# Deploy to production
npm run deploy

# View logs
npm run tail

# Run tests
npm test
```

### Project Health Check

Run `npm run check` to validate your project setup. This command will:

- ✅ Verify all required files exist
- ✅ Check dependencies are configured
- ✅ Validate TypeScript compilation
- ✅ Verify Wrangler configuration
- ✅ Check test setup

**Windows users** can also run:

```powershell
.\scripts\check.ps1
```

## Example Usage

```bash
curl -X POST https://your-worker.workers.dev/api/moderate \
  -H "Content-Type: application/json" \
  -d '{
    "text": "This is an amazing product! Highly recommend it.",
    "features": ["sentiment", "classification"]
  }'
```
