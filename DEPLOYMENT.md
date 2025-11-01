# 🚀 Deployment Guide - Cloudflare Workers

Complete step-by-step guide to deploy your CyberSoft contact backend to Cloudflare Workers.

## 📋 Prerequisites Checklist

Before you begin, ensure you have:

- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] Cloudflare account (free tier is fine)
- [ ] Resend account with verified domain
- [ ] Git installed (optional, but recommended)

## 🎯 Deployment Methods

Choose one of these methods:

1. **Wrangler CLI** (Recommended) - Fast, easy, repeatable
2. **Cloudflare Dashboard** - Good for first-time setup
3. **GitHub Actions** - For CI/CD automation

---

## Method 1: Deploy with Wrangler CLI ⚡ (Recommended)

### Step 1: Install Dependencies

```bash
cd cybersoft-contact-backend
npm install
```

### Step 2: Setup Cloudflare Account

First time only:

```bash
npx wrangler login
```

This opens your browser to authenticate with Cloudflare.

### Step 3: Configure Worker

Edit `wrangler.toml` if needed:

```toml
name = "cybersoft-contact-backend"
main = "src/index.ts"
compatibility_date = "2024-11-01"
```

### Step 4: Test Locally

```bash
# Copy environment variables
cp .dev.vars.example .dev.vars

# Add your Resend API key to .dev.vars
nano .dev.vars

# Start dev server
npm run dev
```

Visit: http://localhost:8787

Test the endpoint:
```bash
curl -X POST http://localhost:8787/api/contact \
  -H "Content-Type: application/json" \
  -H "Origin: https://cybersoft.az" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "projectType": "website",
    "message": "Test message"
  }'
```

### Step 5: Deploy to Production

```bash
npm run deploy
```

You'll see output like:
```
Uploaded cybersoft-contact-backend (1.23 sec)
Published cybersoft-contact-backend (0.45 sec)
  https://cybersoft-contact-backend.your-subdomain.workers.dev
```

### Step 6: Add Secrets

```bash
# Add Resend API key
npx wrangler secret put RESEND_API_KEY
# When prompted, paste: re_your_actual_api_key

# Add allowed origins (optional)
npx wrangler secret put ALLOWED_ORIGINS
# When prompted, paste: https://cybersoft.az,https://www.cybersoft.az
```

### Step 7: Test Production

```bash
curl -X POST https://cybersoft-contact-backend.your-subdomain.workers.dev/api/contact \
  -H "Content-Type: application/json" \
  -H "Origin: https://cybersoft.az" \
  -d '{
    "name": "Production Test",
    "email": "test@example.com",
    "projectType": "website",
    "message": "Testing production deployment"
  }'
```

Check your email at `sales@cybersoft.az`!

---

## Method 2: Deploy via Cloudflare Dashboard 🌐

### Step 1: Prepare Your Code

1. Make sure all files are ready
2. Copy the contents of `src/index.ts`

### Step 2: Create Worker in Dashboard

1. Go to https://dash.cloudflare.com
2. Click **Workers & Pages** in left sidebar
3. Click **Create Application**
4. Click **Create Worker**
5. Name it: `cybersoft-contact-backend`
6. Click **Deploy**

### Step 3: Update Worker Code

1. Click **Edit Code** button
2. Delete all default code
3. Paste the contents of `src/index.ts`
4. Click **Save and Deploy**

### Step 4: Add Environment Variables

1. Click **Settings** tab
2. Click **Variables** section
3. Under **Environment Variables**, click **Add variable**:
   - Variable name: `RESEND_API_KEY`
   - Value: `re_your_actual_api_key`
   - Type: Secret (click "Encrypt")
   - Click **Save**

4. Add another variable (optional):
   - Variable name: `ALLOWED_ORIGINS`
   - Value: `https://cybersoft.az,https://www.cybersoft.az`
   - Click **Save**

### Step 5: Get Your Worker URL

1. Go back to **Deployments** tab
2. Click on the latest deployment
3. Copy the URL: `https://cybersoft-contact-backend.your-subdomain.workers.dev`

### Step 6: Test

Use curl or Postman to test the endpoint.

---

## Method 3: GitHub Actions CI/CD 🤖

### Step 1: Setup GitHub Repository

```bash
git init
git add .
git commit -m "Initial commit: Contact backend worker"
git remote add origin https://github.com/yourusername/cybersoft-contact-backend.git
git push -u origin main
```

### Step 2: Get Cloudflare API Token

1. Go to https://dash.cloudflare.com/profile/api-tokens
2. Click **Create Token**
3. Use template: **Edit Cloudflare Workers**
4. Configure:
   - Account Resources: Include → Your Account
   - Zone Resources: Include → All Zones
5. Click **Continue to summary**
6. Click **Create Token**
7. **Copy the token** (you won't see it again!)

### Step 3: Add GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**

Add these secrets:
- Name: `CLOUDFLARE_API_TOKEN`, Value: Your Cloudflare API token
- Name: `RESEND_API_KEY`, Value: Your Resend API key

### Step 4: Create GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloudflare Workers

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    name: Deploy
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Deploy to Cloudflare Workers
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          command: deploy
          secrets: |
            RESEND_API_KEY
        env:
          RESEND_API_KEY: ${{ secrets.RESEND_API_KEY }}
```

### Step 5: Push and Deploy

```bash
git add .github/workflows/deploy.yml
git commit -m "Add GitHub Actions workflow"
git push
```

GitHub Actions will automatically deploy your worker!

---

## 🔗 Custom Domain Setup

### Option A: Worker Route (Recommended)

Make your API available at `api.cybersoft.az`:

#### Step 1: Update wrangler.toml

```toml
routes = [
  { pattern = "api.cybersoft.az/api/contact", zone_name = "cybersoft.az" }
]
```

#### Step 2: Deploy

```bash
npm run deploy
```

Cloudflare automatically creates DNS records!

#### Step 3: Test

```bash
curl https://api.cybersoft.az/api/contact
```

### Option B: Custom Domain (Alternative)

Use workers.dev subdomain:

#### Step 1: In Cloudflare Dashboard

1. Go to **Workers & Pages** → Your Worker
2. Click **Settings** → **Domains & Routes**
3. Click **Add Custom Domain**
4. Enter: `api.cybersoft.az`
5. Click **Add Domain**

#### Step 2: DNS (Automatic)

Cloudflare automatically creates:
- CNAME record: `api` → `cybersoft-contact-backend.workers.dev`

---

## 🧪 Post-Deployment Testing

### Test 1: Health Check

```bash
curl https://your-worker-url.workers.dev/api/contact \
  -X OPTIONS \
  -H "Origin: https://cybersoft.az" \
  -v
```

Expected: 204 No Content with CORS headers

### Test 2: Valid Submission

```bash
curl -X POST https://your-worker-url.workers.dev/api/contact \
  -H "Content-Type: application/json" \
  -H "Origin: https://cybersoft.az" \
  -d '{
    "name": "Test User",
    "email": "your-email@example.com",
    "company": "Test Co",
    "projectType": "website",
    "message": "This is a test"
  }'
```

Expected:
```json
{
  "success": true,
  "messageId": "abc-123",
  "message": "Email sent successfully"
}
```

Check `sales@cybersoft.az` inbox!

### Test 3: Validation Error

```bash
curl -X POST https://your-worker-url.workers.dev/api/contact \
  -H "Content-Type: application/json" \
  -H "Origin: https://cybersoft.az" \
  -d '{
    "name": "",
    "email": "invalid-email",
    "projectType": "",
    "message": ""
  }'
```

Expected:
```json
{
  "success": false,
  "error": "Name is required"
}
```

### Test 4: CORS from Browser

Open browser console on `https://cybersoft.az`:

```javascript
fetch('https://your-worker-url.workers.dev/api/contact', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'Browser Test',
    email: 'test@example.com',
    projectType: 'website',
    message: 'Testing from browser'
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

---

## 🔄 Update Frontend

Update your frontend to use the worker URL:

### Before (Cloudflare Pages Functions):
```typescript
const response = await fetch("/api/contact", { ... });
```

### After (Cloudflare Workers):
```typescript
const response = await fetch("https://api.cybersoft.az/api/contact", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(formData),
});
```

Or if using workers.dev:
```typescript
const response = await fetch("https://cybersoft-contact-backend.your-subdomain.workers.dev/api/contact", { ... });
```

---

## 📊 Monitoring

### View Live Logs

```bash
npm run tail
```

### Cloudflare Dashboard Metrics

1. Go to **Workers & Pages** → Your Worker
2. View:
   - **Metrics**: Request count, errors, CPU time
   - **Logs**: Real-time logs
   - **Analytics**: Detailed analytics

### Set Up Alerts

1. Go to **Notifications** in Cloudflare Dashboard
2. Create alert for:
   - High error rate
   - High CPU usage
   - Deployment failures

---

## 🐛 Troubleshooting

### Worker Not Found (404)

**Problem**: Getting 404 errors

**Solutions**:
1. Check deployment succeeded: `npx wrangler deployments list`
2. Verify URL is correct
3. Check routes in `wrangler.toml`
4. Redeploy: `npm run deploy`

### CORS Errors

**Problem**: Browser shows CORS errors

**Solutions**:
1. Check `ALLOWED_ORIGINS` includes your domain
2. Verify Origin header is being sent
3. Test with curl first
4. Check worker logs: `npm run tail`

### Email Not Sending (500)

**Problem**: API returns 500, email not sent

**Solutions**:
1. Check `RESEND_API_KEY` is set: `npx wrangler secret list`
2. Verify API key in Resend dashboard
3. Check Resend domain is verified
4. View logs: `npm run tail`
5. Test Resend API directly

### Secrets Not Working

**Problem**: Environment variables not available

**Solutions**:
1. List secrets: `npx wrangler secret list`
2. Delete and recreate: 
   ```bash
   npx wrangler secret delete RESEND_API_KEY
   npx wrangler secret put RESEND_API_KEY
   ```
3. Redeploy after adding secrets

---

## 🔄 Updating the Worker

### Make Changes

1. Edit `src/index.ts`
2. Test locally: `npm run dev`
3. Deploy: `npm run deploy`

### Version Control

```bash
git add src/index.ts
git commit -m "Update: Description of changes"
git push
```

If using GitHub Actions, it auto-deploys!

---

## 📋 Deployment Checklist

- [ ] Dependencies installed
- [ ] Tested locally
- [ ] Deployed to Cloudflare
- [ ] Secrets added (RESEND_API_KEY)
- [ ] Custom domain configured (optional)
- [ ] Tested production endpoint
- [ ] Email received successfully
- [ ] Frontend updated with new URL
- [ ] Monitoring setup
- [ ] Documentation updated

---

## 🎉 Success!

Your worker is now deployed and ready to handle contact form submissions!

**Worker URL**: `https://your-worker-url.workers.dev/api/contact`

**Next Steps**:
1. Update frontend to use worker URL
2. Test end-to-end from your website
3. Monitor logs for first real submissions
4. Set up alerts for errors

---

## 📞 Support

- Wrangler Issues: https://github.com/cloudflare/workers-sdk/issues
- Cloudflare Docs: https://developers.cloudflare.com/workers/
- Resend Support: https://resend.com/support

**Happy Deploying! 🚀**
