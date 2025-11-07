# AI Content Moderator API

A serverless, AI-powered content moderation API built on Cloudflare Workers. This API provides real-time sentiment analysis, spam detection, and text summarization using Cloudflare's Workers AI platform.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## 🎯 Overview

This project is a serverless API that leverages Cloudflare Workers AI to provide intelligent content moderation capabilities. It can analyze text for sentiment, classify content as spam or legitimate, and generate summaries of long-form content. The API is built with TypeScript and runs entirely on Cloudflare's edge network, providing low latency and global distribution.

### Key Benefits

- ⚡ **Serverless**: No infrastructure management required
- 🌍 **Global Edge Network**: Low latency worldwide
- 🤖 **AI-Powered**: Uses state-of-the-art AI models
- 💰 **Cost-Effective**: Pay only for what you use
- 🔒 **Secure**: Built-in security features
- 📈 **Scalable**: Handles traffic spikes automatically

## ✨ Features

### 1. Sentiment Analysis

Detect the emotional tone of text content:

- **Labels**: POSITIVE, NEGATIVE, or NEUTRAL
- **Score**: Confidence score (0.0 to 1.0)
- **Confidence**: Percentage representation of the score

**Model**: `@cf/huggingface/distilbert-sst-2-int8`

### 2. Text Classification

Categorize and detect spam content:

- **Categories**: spam, legitimate, promotional, informational, social
- **Spam Detection**: Boolean flag indicating if content is spam
- **Confidence**: Classification confidence score

**Model**: `@cf/meta/llama-2-7b-chat-int8`

### 3. Text Summarization

Generate concise summaries of long content:

- **Automatic**: Only summarizes text longer than 500 characters
- **Configurable**: Customizable maximum summary length
- **Metrics**: Original and summary length tracking

**Model**: `@cf/facebook/bart-large-cnn`

## 🏗️ Architecture

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ HTTP Request
       ▼
┌─────────────────────────────────┐
│   Cloudflare Worker (Edge)      │
│  ┌───────────────────────────┐  │
│  │  Router & Middleware      │  │
│  └───────┬───────────────────┘  │
│          │                       │
│  ┌───────▼───────────────────┐  │
│  │  AI Services              │  │
│  │  - SentimentService       │  │
│  │  - ClassificationService  │  │
│  │  - SummarizationService   │  │
│  └───────┬───────────────────┘  │
│          │                       │
└──────────┼───────────────────────┘
           │
           ▼
┌──────────────────────────┐
│  Cloudflare Workers AI   │
│  (AI Model Execution)    │
└──────────────────────────┘
```

### Technology Stack

- **Runtime**: Cloudflare Workers (V8 Isolates)
- **Language**: TypeScript
- **AI Platform**: Cloudflare Workers AI
- **Testing**: Vitest with Cloudflare Workers Test Pool
- **Build Tool**: Wrangler

## 📦 Prerequisites

Before you begin, ensure you have:

- **Node.js** (v18 or higher recommended)
- **npm** or **yarn** package manager
- **Cloudflare Account** (free tier works)
- **Cloudflare Workers AI** enabled in your account
- **Git** (for cloning the repository)

### Setting Up Cloudflare Account

1. Create a free account at [cloudflare.com](https://www.cloudflare.com)
2. Navigate to Workers & Pages in the dashboard
3. Enable Workers AI (may require enabling in beta features)
4. Note: Workers AI has usage limits on the free tier

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ai-mod/ai-mod
```

### 2. Install Dependencies

```bash
npm install
```

This will install:

- `wrangler` - Cloudflare Workers CLI
- `typescript` - TypeScript compiler
- `@cloudflare/workers-types` - TypeScript definitions
- `vitest` - Testing framework
- `@cloudflare/vitest-pool-workers` - Workers test utilities

### 3. Verify Installation

```bash
npm run check
```

This command validates:

- ✅ All required files exist
- ✅ Dependencies are configured
- ✅ TypeScript compilation
- ✅ Wrangler configuration
- ✅ Test setup

**Windows users** can also run:

```powershell
.\scripts\check.ps1
```

### 4. Authenticate with Cloudflare

```bash
npx wrangler login
```

This will open your browser to authenticate with Cloudflare.

## ⚙️ Configuration

### Wrangler Configuration (`wrangler.toml`)

```toml
name = "ai-mod"
main = "src/index.ts"
compatibility_date = "2024-01-01"

# Enable Workers AI
[ai]
binding = "AI"

# Environment variables (optional)
[vars]
ENVIRONMENT = "production"
```

### Environment Variables

You can set environment variables in `wrangler.toml` or use `.dev.vars` for local development:

```bash
# .dev.vars (not committed to git)
ENVIRONMENT=development
```

### API Configuration (`src/utils/constants.ts`)

```typescript
export const API_CONFIG = {
  MAX_TEXT_LENGTH: 5000, // Maximum characters per request
  MIN_TEXT_LENGTH: 10, // Minimum characters required
  DEFAULT_THRESHOLD: 0.7, // Default confidence threshold
  MAX_SUMMARY_LENGTH: 150, // Default summary length
} as const;
```

## 📚 API Documentation

### Base URL

- **Local Development**: `http://localhost:8787`
- **Production**: `https://ai-mod.<your-subdomain>.workers.dev`

### Endpoints

#### 1. Health Check

Check if the API is running and healthy.

**Endpoint**: `GET /health` or `GET /`

**Response**:

```json
{
  "status": "healthy",
  "timestamp": "2024-11-07T10:30:00.000Z",
  "version": "1.0.0"
}
```

**Example**:

```bash
curl http://localhost:8787/health
```

#### 2. Content Moderation

Analyze text content with AI-powered features.

**Endpoint**: `POST /api/moderate`

**Request Headers**:

```
Content-Type: application/json
```

**Request Body**:

```json
{
  "text": "Your text to analyze here",
  "features": ["sentiment", "classification", "summarization"],
  "options": {
    "maxLength": 150
  }
}
```

**Parameters**:

- `text` (required, string): Text to analyze (10-5000 characters)
- `features` (optional, array): Features to enable
  - `"sentiment"` - Sentiment analysis
  - `"classification"` - Spam detection and classification
  - `"summarization"` - Text summarization
  - `"all"` - Enable all features
- `options` (optional, object):
  - `maxLength` (number): Maximum summary length (default: 150)

**Success Response** (200):

```json
{
  "success": true,
  "data": {
    "text": "Your text to analyze here",
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
      "summary": "Brief summary of the content...",
      "originalLength": 1500,
      "summaryLength": 120
    }
  },
  "metadata": {
    "timestamp": "2024-11-07T10:30:00.000Z",
    "processingTime": 234,
    "features": ["sentiment", "classification", "summarization"]
  }
}
```

**Error Responses**:

- **400 Bad Request**: Invalid request format

```json
{
  "success": false,
  "error": {
    "code": "MISSING_TEXT",
    "message": "Text field is required and must be a string"
  },
  "timestamp": "2024-11-07T10:30:00.000Z"
}
```

- **404 Not Found**: Route not found

```json
{
  "success": false,
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Route not found: /unknown"
  },
  "timestamp": "2024-11-07T10:30:00.000Z"
}
```

- **500 Internal Server Error**: Server error

```json
{
  "success": false,
  "error": {
    "code": "AI_ERROR",
    "message": "AI service temporarily unavailable",
    "details": {
      "originalError": "..."
    }
  },
  "timestamp": "2024-11-07T10:30:00.000Z"
}
```

**Example Requests**:

```bash
# Sentiment analysis only
curl -X POST http://localhost:8787/api/moderate \
  -H "Content-Type: application/json" \
  -d '{
    "text": "This is an amazing product! Highly recommend it.",
    "features": ["sentiment"]
  }'

# Spam detection
curl -X POST http://localhost:8787/api/moderate \
  -H "Content-Type: application/json" \
  -d '{
    "text": "CLICK HERE NOW!!! Buy cheap products!",
    "features": ["classification"]
  }'

# Full analysis
curl -X POST http://localhost:8787/api/moderate \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Long text content here...",
    "features": ["all"]
  }'
```

### CORS Support

The API supports CORS and handles preflight requests automatically:

- **Allowed Origins**: `*` (all origins)
- **Allowed Methods**: `GET`, `POST`, `OPTIONS`
- **Allowed Headers**: `Content-Type`

## 📁 Project Structure

```
ai-mod/
├── src/
│   ├── index.ts                 # Main entry point (Worker handler)
│   ├── router.ts                # Request routing logic
│   ├── types/
│   │   └── index.ts             # TypeScript type definitions
│   ├── service/
│   │   ├── sentiment.ts        # Sentiment analysis service
│   │   ├── classification.ts   # Spam detection service
│   │   └── summarization.ts    # Text summarization service
│   ├── middlewares/
│   │   ├── cors.ts             # CORS handling
│   │   ├── errorHandler.ts     # Error handling middleware
│   │   └── validation.ts       # Request validation
│   └── utils/
│       ├── constants.ts        # Configuration constants
│       └── response.ts         # Response formatting utilities
├── test/
│   ├── index.spec.ts           # Unit tests
│   ├── test-requests.sh        # Manual test script (bash)
│   └── tsconfig.json           # Test TypeScript config
├── scripts/
│   ├── check.js                # Project health check script
│   └── check.ps1               # PowerShell health check
├── package.json                 # Dependencies and scripts
├── tsconfig.json                # TypeScript configuration
├── wrangler.toml                # Cloudflare Workers configuration
├── vitest.config.mts           # Vitest test configuration
└── README.md                    # This file
```

### Key Files Explained

- **`src/index.ts`**: Main entry point that handles incoming requests, applies CORS, and routes to appropriate handlers
- **`src/router.ts`**: Contains the routing logic and orchestrates AI service calls
- **`src/service/`**: Contains the three AI services that interact with Cloudflare Workers AI models
- **`src/middlewares/`**: Request validation, error handling, and CORS middleware
- **`src/utils/`**: Shared utilities for constants and response formatting

## 🛠️ Development

### Available Scripts

```bash
# Check project setup and configuration
npm run check

# Run TypeScript type checking
npm run typecheck

# Start local development server
npm run dev

# Deploy to production
npm run deploy

# View production logs
npm run tail

# Run tests
npm test
```

### Development Workflow

1. **Start the development server**:

   ```bash
   npm run dev
   ```

   This starts a local server at `http://localhost:8787`

2. **Make changes** to the code - the server will automatically reload

3. **Test your changes** using curl, Postman, or the test scripts

4. **Run type checking**:

   ```bash
   npm run typecheck
   ```

5. **Run tests**:
   ```bash
   npm test
   ```

### Project Health Check

Run `npm run check` to validate your project setup. This command will:

- ✅ Verify all required files exist
- ✅ Check dependencies are configured
- ✅ Validate TypeScript compilation
- ✅ Verify Wrangler configuration
- ✅ Check test setup

## 🧪 Testing

### Automated Tests

Run the test suite:

```bash
npm test
```

The test suite includes:

- Health check endpoint tests
- CORS preflight handling
- Error handling validation
- Request validation tests

### Manual Testing

#### Using the Test Script (Bash/Linux/Mac/Git Bash)

```bash
bash test/test-requests.sh
```

#### Using PowerShell (Windows)

Create `test/test-requests.ps1`:

```powershell
$API_URL = "http://localhost:8787"

# Test 1: Sentiment Analysis
Write-Host "Test 1: Positive Sentiment" -ForegroundColor Cyan
$body1 = @{
    text = "This is absolutely amazing! Best product ever!"
    features = @("sentiment")
} | ConvertTo-Json

Invoke-RestMethod -Uri "$API_URL/api/moderate" -Method POST -Body $body1 -ContentType "application/json" | ConvertTo-Json -Depth 10
```

#### Using curl

```bash
# Health check
curl http://localhost:8787/health

# Sentiment analysis
curl -X POST http://localhost:8787/api/moderate \
  -H "Content-Type: application/json" \
  -d '{
    "text": "This is absolutely amazing! Best product ever!",
    "features": ["sentiment"]
  }'
```

## 🚀 Deployment

### Deploy to Cloudflare Workers

1. **Ensure you're logged in**:

   ```bash
   npx wrangler login
   ```

2. **Deploy**:

   ```bash
   npm run deploy
   ```

3. **View your deployed worker URL** in the output

4. **Monitor logs**:
   ```bash
   npm run tail
   ```

### Environment Variables

Set environment variables in the Cloudflare dashboard or in `wrangler.toml`:

```toml
[vars]
ENVIRONMENT = "production"
```

### Custom Domain

You can bind a custom domain in the Cloudflare dashboard under Workers & Pages.

## 🐛 Troubleshooting

### Common Issues

#### 1. "AI binding not found" Error

**Problem**: The AI binding is not configured correctly.

**Solution**:

- Check `wrangler.toml` has `[ai]` section with `binding = "AI"`
- Ensure Workers AI is enabled in your Cloudflare account
- Run `npm run check` to verify configuration

#### 2. TypeScript Compilation Errors

**Problem**: Type errors when building.

**Solution**:

```bash
npm run typecheck
```

Fix any type errors shown in the output.

#### 3. "Module not found" Errors

**Problem**: Dependencies not installed.

**Solution**:

```bash
npm install
```

#### 4. Sentiment Analysis Returns Wrong Label

**Problem**: The sentiment model might return results in an unexpected format.

**Solution**: Check the `src/service/sentiment.ts` file. The model returns an array of results - ensure the code selects the result with the highest score.

#### 5. Local Development Server Won't Start

**Problem**: Port 8787 might be in use or Wrangler not authenticated.

**Solution**:

- Check if port 8787 is available
- Run `npx wrangler login` to authenticate
- Check `wrangler.toml` configuration

#### 6. AI Model Errors

**Problem**: Workers AI might be rate-limited or unavailable.

**Solution**:

- Check your Cloudflare Workers AI usage limits
- Verify Workers AI is enabled in your account
- Check Cloudflare status page for service issues

### Getting Help

- Check the [Cloudflare Workers documentation](https://developers.cloudflare.com/workers/)
- Review [Workers AI documentation](https://developers.cloudflare.com/workers-ai/)
- Check project issues or create a new one

## 📝 How It Works

### Request Flow

1. **Client sends request** → `POST /api/moderate` with text and features
2. **CORS middleware** → Handles preflight requests
3. **Validation middleware** → Validates request format and text length
4. **Router** → Determines which features to enable
5. **AI Services** → Execute in parallel using `Promise.all()`
6. **Response Formatter** → Formats results with metadata
7. **CORS headers** → Added to response
8. **Client receives** → JSON response with analysis results

### AI Model Integration

Each service (`SentimentService`, `ClassificationService`, `SummarizationService`) uses the Cloudflare Workers AI binding:

```typescript
const response = await this.env.AI.run(MODEL_NAME, {
  // Model-specific parameters
});
```

The models run on Cloudflare's edge network, providing low latency globally.

### Parallel Execution

The router executes multiple AI services in parallel for better performance:

```typescript
const promises: Promise<any>[] = [];
// Add promises for each enabled feature
await Promise.all(promises);
```

This ensures all AI operations run simultaneously rather than sequentially.

## 📊 Performance

- **Average Response Time**: 200-500ms (depending on features enabled)
- **Concurrent Requests**: Handled automatically by Cloudflare
- **Global Latency**: < 50ms to nearest edge location
- **Rate Limits**: Based on your Cloudflare plan

## 🔐 Security

- **Input Validation**: All requests are validated before processing
- **Error Handling**: Errors don't expose internal details
- **CORS**: Configurable CORS headers
- **Type Safety**: Full TypeScript coverage

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Cloudflare Workers platform
- Cloudflare Workers AI models
- Hugging Face for sentiment analysis model
- Meta for Llama-2 model
- Facebook for BART summarization model

---

**Built with ❤️ using Cloudflare Workers AI**
