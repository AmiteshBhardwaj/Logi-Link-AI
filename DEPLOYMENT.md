# Deployment Guide - Logi-Link AI

This guide will help you deploy Logi-Link AI to Vercel (recommended) or other platforms.

## Prerequisites

- ✅ Database schema set up in Supabase
- ✅ Environment variables configured
- ✅ Build passes locally (`npm run build`)

## Option 1: Deploy to Vercel (Recommended)

Vercel is the recommended platform for Next.js applications and provides seamless deployment.

### Step 1: Install Vercel CLI (Optional)

```bash
npm i -g vercel
```

### Step 2: Deploy via Vercel Dashboard

1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Import Project to Vercel**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Vercel will auto-detect Next.js settings

3. **Configure Environment Variables**
   In Vercel Dashboard → Project Settings → Environment Variables, add:
   
   ```
   OPENAI_API_KEY=your_openai_api_key
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   LLM_MODEL=gpt-4o-mini (optional)
   WHISPER_MODEL=whisper-1 (optional)
   EMBEDDING_MODEL=text-embedding-3-large (optional)
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at `https://your-project.vercel.app`

### Step 3: Deploy via CLI (Alternative)

```bash
# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? logi-link-ai (or your choice)
# - Directory? ./
# - Override settings? No

# Add environment variables
vercel env add OPENAI_API_KEY
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY

# Deploy to production
vercel --prod
```

## Option 2: Deploy to Other Platforms

### Netlify

1. Build command: `npm run build`
2. Publish directory: `.next`
3. Add environment variables in Netlify dashboard

### AWS Amplify

1. Connect GitHub repository
2. Build settings:
   - Build command: `npm run build`
   - Output directory: `.next`
3. Add environment variables

### Docker Deployment

Create a `Dockerfile`:

```dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

Update `next.config.js`:

```javascript
const nextConfig = {
  output: 'standalone',
  // ... rest of config
};
```

## Post-Deployment Checklist

- [ ] Verify environment variables are set correctly
- [ ] Test the application at the deployed URL
- [ ] Test hybrid reasoning query
- [ ] Test voice input (if supported)
- [ ] Verify Supabase connection
- [ ] Check error logs in Vercel dashboard
- [ ] Set up custom domain (optional)

## Troubleshooting

### Build Fails
- Check environment variables are set
- Verify TypeScript compilation passes locally
- Check Vercel build logs for specific errors

### Runtime Errors
- Verify all environment variables are set in production
- Check Supabase connection (URL and keys)
- Verify OpenAI API key is valid
- Check Vercel function logs

### Database Connection Issues
- Verify Supabase URL and keys are correct
- Check if RLS policies allow access
- Verify `match_documents` function exists

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | ✅ Yes | OpenAI API key for LLM, Whisper, and embeddings |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Yes | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Yes | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ Yes | Supabase service role key (for admin operations) |
| `LLM_MODEL` | No | LLM model (default: `gpt-4o-mini`) |
| `WHISPER_MODEL` | No | Whisper model (default: `whisper-1`) |
| `EMBEDDING_MODEL` | No | Embedding model (default: `text-embedding-3-large`) |

## Support

For issues or questions:
1. Check Vercel deployment logs
2. Check Supabase logs
3. Review error messages in the application
4. Verify all environment variables are set correctly

