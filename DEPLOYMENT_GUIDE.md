# Deployment Guide

## 🚀 Quick Deploy Options

### Option 1: Vercel (Recommended - 5 minutes)

#### Why Vercel?
- Built by Next.js creators
- Zero configuration
- Automatic HTTPS
- Global CDN
- Free tier available
- Automatic deployments

#### Steps:

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit: Smart Farming Assistant"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

2. **Deploy to Vercel**
- Go to [vercel.com](https://vercel.com)
- Click "New Project"
- Import your GitHub repository
- Vercel auto-detects Next.js
- Click "Deploy"

3. **Add Environment Variables** (Optional)
- Go to Project Settings
- Navigate to Environment Variables
- Add: `AI_API_KEY` = your OpenAI key
- Redeploy

4. **Done!**
- Your app is live at: `your-project.vercel.app`
- Custom domain available in settings

#### Vercel CLI (Alternative)
```bash
npm i -g vercel
vercel login
vercel
# Follow prompts
```

---

### Option 2: Netlify (Alternative - 5 minutes)

#### Steps:

1. **Push to GitHub** (same as above)

2. **Deploy to Netlify**
- Go to [netlify.com](https://netlify.com)
- Click "Add new site" → "Import an existing project"
- Connect to GitHub
- Select your repository
- Build settings:
  - Build command: `npm run build`
  - Publish directory: `.next`
- Click "Deploy"

3. **Add Environment Variables**
- Go to Site settings → Environment variables
- Add: `AI_API_KEY` = your OpenAI key
- Trigger redeploy

4. **Done!**
- Live at: `your-site.netlify.app`

---

### Option 3: AWS Amplify

#### Steps:

1. **Push to GitHub** (same as above)

2. **Deploy to Amplify**
- Go to AWS Amplify Console
- Click "New app" → "Host web app"
- Connect GitHub repository
- Build settings (auto-detected):
  ```yaml
  version: 1
  frontend:
    phases:
      preBuild:
        commands:
          - npm install
      build:
        commands:
          - npm run build
    artifacts:
      baseDirectory: .next
      files:
        - '**/*'
    cache:
      paths:
        - node_modules/**/*
  ```
- Deploy

3. **Environment Variables**
- Add in Amplify Console
- `AI_API_KEY` = your key

---

### Option 4: Docker (Self-hosted)

#### Dockerfile
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

#### Build and Run
```bash
# Build image
docker build -t smart-farming-assistant .

# Run container
docker run -p 3000:3000 \
  -e AI_API_KEY=your_key_here \
  smart-farming-assistant
```

#### Docker Compose
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - AI_API_KEY=${AI_API_KEY}
    restart: unless-stopped
```

---

## 🔧 Pre-Deployment Checklist

### Code Preparation
- [ ] All features tested locally
- [ ] Build succeeds: `npm run build`
- [ ] No TypeScript errors: `npm run type-check`
- [ ] No console errors in production build
- [ ] Environment variables documented

### Assets
- [ ] Add real video files (or remove video components)
- [ ] Add real favicon files (or use placeholders)
- [ ] Optimize images (if any added)
- [ ] Check asset file sizes

### Configuration
- [ ] Update `NEXT_PUBLIC_APP_URL` in .env
- [ ] Update sitemap.xml with real domain
- [ ] Update robots.txt with real domain
- [ ] Update metadata in app/layout.tsx

### Security
- [ ] API keys in environment variables (not in code)
- [ ] Security headers configured (next.config.js)
- [ ] HTTPS enabled (automatic on Vercel/Netlify)
- [ ] CORS configured if needed

### SEO
- [ ] Meta tags complete
- [ ] OpenGraph images added
- [ ] Sitemap accessible
- [ ] Robots.txt accessible
- [ ] Structured data valid

---

## 🌐 Custom Domain Setup

### Vercel
1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS records (provided by Vercel)
4. Wait for DNS propagation (5-60 minutes)
5. HTTPS automatically configured

### Netlify
1. Go to Domain settings
2. Add custom domain
3. Update DNS records
4. Enable HTTPS (automatic)

### Cloudflare (Optional)
- Add site to Cloudflare
- Point DNS to deployment
- Enable CDN and security features
- Configure SSL/TLS

---

## 📊 Post-Deployment

### Monitoring

#### Vercel Analytics
```bash
npm install @vercel/analytics
```

Add to `app/layout.tsx`:
```typescript
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

#### Google Analytics (Optional)
Add to `app/layout.tsx`:
```typescript
<Script
  src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
  strategy="afterInteractive"
/>
<Script id="google-analytics" strategy="afterInteractive">
  {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'GA_MEASUREMENT_ID');
  `}
</Script>
```

### Performance Monitoring
- Use Vercel Analytics
- Use Lighthouse CI
- Monitor Core Web Vitals
- Set up error tracking (Sentry, etc.)

### Testing Production
```bash
# Test production build locally
npm run build
npm start

# Open http://localhost:3000
# Test all features
```

---

## 🔄 Continuous Deployment

### Automatic Deployments

#### Vercel/Netlify
- Push to `main` branch → Auto deploy to production
- Push to other branches → Auto deploy to preview
- Pull requests → Auto deploy to preview URLs

#### GitHub Actions (Custom)
```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - run: npm run test # if tests added
      # Add deployment steps
```

---

## 🐛 Troubleshooting Deployment

### Build Fails

**Issue**: Build fails on deployment
**Solution**:
```bash
# Test build locally first
npm run build

# Check for errors
npm run type-check

# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

### Environment Variables Not Working

**Issue**: API key not found in production
**Solution**:
- Verify variable name matches exactly
- Restart deployment after adding variables
- Check variable is not prefixed with `NEXT_PUBLIC_` (unless needed client-side)

### 404 Errors

**Issue**: Pages return 404
**Solution**:
- Verify routes in `app/` directory
- Check file names match URLs
- Ensure `page.tsx` files exist
- Redeploy

### Slow Performance

**Issue**: App loads slowly
**Solution**:
- Enable CDN (automatic on Vercel/Netlify)
- Optimize images
- Check bundle size
- Enable caching headers

### API Errors

**Issue**: Chat not working in production
**Solution**:
- Check API route is deployed
- Verify environment variables
- Check API logs
- Test with mock mode first

---

## 📈 Scaling Considerations

### Traffic Growth
- Vercel/Netlify scale automatically
- Monitor usage in dashboard
- Upgrade plan if needed

### Database (Future)
- Add Vercel Postgres
- Or use Supabase
- Or MongoDB Atlas

### Caching
- Use Vercel Edge Cache
- Implement ISR (Incremental Static Regeneration)
- Cache API responses

---

## 💰 Cost Estimates

### Vercel
- **Hobby (Free)**:
  - 100 GB bandwidth
  - Unlimited deployments
  - Perfect for this project
- **Pro ($20/month)**:
  - More bandwidth
  - Team features

### Netlify
- **Starter (Free)**:
  - 100 GB bandwidth
  - 300 build minutes
  - Good for this project
- **Pro ($19/month)**:
  - More resources

### AWS Amplify
- **Pay as you go**:
  - ~$0.01 per build minute
  - ~$0.15 per GB served
  - Estimate: $5-20/month

### Self-Hosted
- **VPS**: $5-20/month
- **Domain**: $10-15/year
- **SSL**: Free (Let's Encrypt)

---

## ✅ Deployment Checklist

### Before Deploy
- [ ] Code tested locally
- [ ] Build succeeds
- [ ] Environment variables ready
- [ ] Assets optimized
- [ ] Domain purchased (if using custom)

### During Deploy
- [ ] Repository connected
- [ ] Build settings configured
- [ ] Environment variables added
- [ ] Deployment successful

### After Deploy
- [ ] Site accessible
- [ ] All features work
- [ ] HTTPS enabled
- [ ] Custom domain configured (if applicable)
- [ ] Analytics added (optional)
- [ ] Monitoring set up

### Testing Production
- [ ] Homepage loads
- [ ] About page loads
- [ ] Chat works
- [ ] Theme toggle works
- [ ] Language switcher works
- [ ] Mobile responsive
- [ ] Performance good (Lighthouse)

---

## 🎉 Success!

Your Smart Farming Assistant is now live and accessible worldwide!

**Next Steps**:
1. Share the URL
2. Monitor performance
3. Gather user feedback
4. Iterate and improve
5. Add more features

**Support**:
- Vercel: [vercel.com/docs](https://vercel.com/docs)
- Netlify: [docs.netlify.com](https://docs.netlify.com)
- Next.js: [nextjs.org/docs](https://nextjs.org/docs)

---

**Deployment Status**: Ready for production deployment
**Recommended Platform**: Vercel (easiest for Next.js)
**Estimated Time**: 5-10 minutes
