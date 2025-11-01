# CyberSoft Contact Backend - Cloudflare Worker

## 🚀 Features

- ✅ **Serverless**: Runs on Cloudflare's global edge network
- ✅ **Fast**: Sub-millisecond response times worldwide
- ✅ **Scalable**: Automatically scales to handle any traffic
- ✅ **Secure**: Built-in DDoS protection, input validation, CORS
- ✅ **Reliable**: 99.99% uptime SLA
- ✅ **Beautiful Emails**: HTML-formatted emails with responsive design
- ✅ **Type-Safe**: Written in TypeScript
- ✅ **Free Tier**: 100,000 requests/day on free plan

## 📋 Requirements

- Node.js 18+ and npm
- Cloudflare account (free tier works)
- Resend account (free tier: 3,000 emails/month)
- Wrangler CLI

## 🏗️ Project Structure

```
cybersoft-contact-backend/
├── src/
│   └── index.ts           # Main worker code
├── wrangler.toml          # Cloudflare Worker configuration
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── .gitignore            # Git ignore rules
├── .dev.vars.example     # Environment variables template
└── README.md             # This file
```

## 🛠️ Installation

### 1. Clone or Create Repository

```bash
# If you're creating a new repo
mkdir cybersoft-contact-backend
cd cybersoft-contact-backend

# Initialize git
git init
```

### 2. Install Dependencies

```bash
npm install
```

This will install:
- `wrangler` - Cloudflare Workers CLI
- `@cloudflare/workers-types` - TypeScript types
- `typescript` - TypeScript compiler
- `vitest` - Testing framework

### 3. Setup Environment Variables

For local development:

```bash
# Copy the example file
cp .dev.vars.example .dev.vars

# Edit .dev.vars and add your Resend API key
nano .dev.vars
```

Add your Resend API key:
```
RESEND_API_KEY=re_your_actual_api_key
```

## 🚦 Local Development

### Start Development Server

```bash
npm run dev
```

This starts the worker at `http://localhost:8787`

### Test the API

Using curl:
```bash
curl -X POST http://localhost:8787/api/contact \
  -H "Content-Type: application/json" \
  -H "Origin: https://cybersoft.az" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "company": "Test Company",
    "projectType": "website",
    "message": "This is a test message"
  }'
```

Expected response:
```json
{
  "success": true,
  "messageId": "abc-123-def",
  "message": "Email sent successfully"
}
```

### Test CORS Preflight

```bash
curl -X OPTIONS http://localhost:8787/api/contact \
  -H "Origin: https://cybersoft.az" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v
```

## 🌐 Deployment

### Option 1: Deploy with Wrangler (Recommended)

#### First Time Setup

1. Login to Cloudflare:
```bash
npx wrangler login
```

2. Deploy to production:
```bash
npm run deploy
```

Your worker will be available at:
```
https://cybersoft-contact-backend.your-subdomain.workers.dev/api/contact
```

#### Add Secrets (Environment Variables)

```bash
# Add Resend API key
npx wrangler secret put RESEND_API_KEY
# Paste your API key when prompted

# Optionally add allowed origins
npx wrangler secret put ALLOWED_ORIGINS
# Enter: https://cybersoft.az,https://www.cybersoft.az
```

### Option 2: Deploy via Cloudflare Dashboard

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Workers & Pages**
3. Click **Create Application** → **Create Worker**
4. Name it `cybersoft-contact-backend`
5. Replace the default code with the contents of `src/index.ts`
6. Click **Save and Deploy**
7. Go to **Settings** → **Variables** → Add:
   - `RESEND_API_KEY`: Your Resend API key
   - `ALLOWED_ORIGINS`: `https://cybersoft.az,https://www.cybersoft.az`

### Option 3: GitHub Actions CI/CD

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloudflare Workers

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    name: Deploy
    steps:
      - uses: actions/checkout@v4
      - uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          secrets: |
            RESEND_API_KEY
        env:
          RESEND_API_KEY: ${{ secrets.RESEND_API_KEY }}
```

Add these secrets to your GitHub repository:
- `CLOUDFLARE_API_TOKEN`
- `RESEND_API_KEY`

## 🔗 Custom Domain Setup

To use a custom domain like `api.cybersoft.az`:

### 1. Add Domain to Cloudflare

Make sure `cybersoft.az` is managed by Cloudflare DNS.

### 2. Update wrangler.toml

Uncomment and configure the routes section:

```toml
routes = [
  { pattern = "api.cybersoft.az/api/contact", zone_name = "cybersoft.az" }
]
```

### 3. Deploy

```bash
npm run deploy
```

### 4. DNS Configuration

Cloudflare automatically creates the necessary DNS records. Your API will be available at:
```
https://api.cybersoft.az/api/contact
```

### 5. Update Frontend

Update your frontend to use the new endpoint:

```typescript
const response = await fetch("https://api.cybersoft.az/api/contact", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(formData),
});
```

## 📡 API Documentation

### Endpoint

```
POST /api/contact
```

### Headers

```
Content-Type: application/json
Origin: https://cybersoft.az
```

### Request Body

```typescript
{
  name: string;          // Required, 1-200 characters
  email: string;         // Required, valid email format
  company?: string;      // Optional, 0-200 characters
  projectType: string;   // Required: "website" | "saas" | "integration" | "other"
  message: string;       // Required, 1-5000 characters
}
```

### Success Response (200)

```json
{
  "success": true,
  "messageId": "abc-123-def-456",
  "message": "Email sent successfully"
}
```

### Error Responses

#### 400 Bad Request
```json
{
  "success": false,
  "error": "Name is required"
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Failed to send email. Please try again later."
}
```

#### 404 Not Found
```json
{
  "success": false,
  "error": "Not Found"
}
```

## 🔒 Security Features

- ✅ **Input Validation**: All fields validated and sanitized
- ✅ **XSS Prevention**: HTML entities escaped
- ✅ **CORS Protection**: Only allowed origins can access
- ✅ **Rate Limiting**: Built-in Cloudflare rate limiting
- ✅ **DDoS Protection**: Cloudflare's network protection
- ✅ **Message Length Limits**: Prevents abuse (5000 char max)
- ✅ **Email Format Validation**: Regex-based validation
- ✅ **Content-Type Check**: Only JSON requests accepted

## 📊 Monitoring

### View Logs in Real-Time

```bash
npm run tail
```

### Cloudflare Dashboard

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Workers & Pages**
3. Click on `cybersoft-contact-backend`
4. View:
   - Request metrics
   - Error rates
   - CPU time
   - Invocations

### Resend Dashboard

1. Go to [Resend Dashboard](https://resend.com/emails)
2. View:
   - Sent emails
   - Delivery status
   - Bounce rates
   - Errors

## 🧪 Testing

### Manual Testing

Use the test scripts in the `test/` directory (create if needed):

```bash
# Test successful submission
./test/test-success.sh

# Test validation errors
./test/test-validation.sh

# Test CORS
./test/test-cors.sh
```

### Automated Testing

Add tests using Vitest:

```bash
npm test
```

## 🐛 Troubleshooting

### Worker not receiving requests

1. Check worker URL is correct
2. Verify deployment was successful: `npx wrangler deployments list`
3. Check Cloudflare Dashboard for errors

### Email not sending

1. Verify `RESEND_API_KEY` is set correctly
2. Check Resend dashboard for errors
3. Verify domain is verified in Resend
4. Check worker logs: `npm run tail`

### CORS errors

1. Check `ALLOWED_ORIGINS` includes your domain
2. Verify Origin header is sent from frontend
3. Check browser console for exact error

### 500 errors

1. Check worker logs: `npm run tail`
2. Verify all environment variables are set
3. Test API key in Resend dashboard
4. Check Resend API status

## 💰 Cost Estimate

### Cloudflare Workers
- **Free Tier**: 100,000 requests/day
- **Paid**: $5/month for 10 million requests

### Resend
- **Free Tier**: 3,000 emails/month
- **Paid**: $20/month for 50,000 emails

### Typical Contact Form
- Expected: ~100-500 submissions/month
- Cost: **$0/month** (within free tiers)

## 🚀 Performance

- **Response Time**: <10ms globally
- **Cold Start**: <5ms
- **Availability**: 99.99% SLA
- **Scalability**: Unlimited (auto-scales)

## 📝 Environment Variables

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `RESEND_API_KEY` | ✅ Yes | Resend API key | - |
| `ALLOWED_ORIGINS` | ❌ No | Comma-separated list of allowed origins | `https://cybersoft.az,https://www.cybersoft.az` |

## 🔄 CI/CD

This project is ready for CI/CD. See the GitHub Actions example above.

## 📚 Additional Resources

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)
- [Resend API Docs](https://resend.com/docs)
- [TypeScript Docs](https://www.typescriptlang.org/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - See LICENSE file

## 🆘 Support

- **Email**: dev@cybersoft.az
- **Issues**: GitHub Issues
- **Docs**: This README

---

**Built with ❤️ for CyberSoft.az**

**Last Updated**: November 2025
