# ChakmaLex Deployment Guide

This guide covers deploying ChakmaLex to Netlify and other platforms.

## 🚀 Quick Netlify Deployment

### Prerequisites
- Node.js 18+ installed locally
- A Netlify account
- GitHub/GitLab repository (recommended)

### Automatic Deployment from Git

1. **Connect Repository**
   ```bash
   # Push your code to GitHub/GitLab
   git add .
   git commit -m "Deploy ChakmaLex to Netlify"
   git push origin main
   ```

2. **Configure Netlify**
   - Go to [Netlify Dashboard](https://app.netlify.com)
   - Click "New site from Git"
   - Connect your repository
   - Use these build settings:
     - **Build command**: `npm run build:client`
     - **Publish directory**: `dist/spa`
     - **Functions directory**: `netlify/functions`

3. **Environment Variables** (Optional)
   In Netlify dashboard → Site settings → Environment variables:
   ```
   NODE_ENV=production
   API_BASE_URL=https://your-site.netlify.app/api
   ```

### Manual Deployment

1. **Build the project**
   ```bash
   npm install
   npm run build
   ```

2. **Deploy via Netlify CLI**
   ```bash
   # Install Netlify CLI
   npm install -g netlify-cli
   
   # Login to Netlify
   netlify login
   
   # Deploy
   netlify deploy --prod --dir=dist/spa --functions=netlify/functions
   ```

## 🔧 Advanced Configuration

### Custom Domain Setup

1. **Add Custom Domain**
   - Netlify Dashboard → Domain settings → Add custom domain
   - Configure DNS records with your domain provider

2. **SSL Certificate**
   - Automatic via Let's Encrypt (enabled by default)
   - Or upload custom certificate in Netlify dashboard

### Performance Optimization

The `netlify.toml` is already optimized with:
- ✅ Static asset caching (1 year)
- ✅ Security headers
- ✅ Font optimization
- ✅ Image caching
- ✅ API redirects

### PWA Configuration

ChakmaLex includes PWA features:
- 📱 App installation on mobile/desktop
- 🔄 Offline dictionary access
- 🎯 Native app shortcuts
- 💾 Background sync

### Analytics Setup (Optional)

Add Google Analytics or other analytics:

1. **Environment Variable**
   ```
   ANALYTICS_ID=GA_MEASUREMENT_ID
   ```

2. **Code Integration**
   Analytics can be added to `client/App.tsx`

## 🌐 Alternative Deployment Platforms

### Vercel
```bash
npm install -g vercel
vercel --prod
```

### Railway
```bash
npm install -g @railway/cli
railway login
railway deploy
```

### DigitalOcean App Platform
1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `dist/spa`

## 🔍 Troubleshooting

### Common Issues

**Build Failures**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

**404 Errors on Routes**
- Ensure `netlify.toml` includes SPA fallback
- Check that `dist/spa/index.html` exists

**API Function Errors**
- Verify `netlify/functions/api.ts` is present
- Check function logs in Netlify dashboard

### Debug Commands
```bash
# Type checking
npm run typecheck

# Local development
npm run dev

# Production build test
npm run build && npm start
```

## 📊 Monitoring

### Netlify Analytics
- Built-in analytics available in dashboard
- Shows page views, unique visitors, bandwidth

### Performance Monitoring
- Lighthouse scores available in Netlify
- Core Web Vitals tracking
- Real User Monitoring (RUM)

### Error Tracking
Consider adding error tracking:
- Sentry
- LogRocket  
- Bugsnag

## 🔐 Security Considerations

### Headers
Security headers are configured in `netlify.toml`:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`

### Content Security Policy
Consider adding CSP headers for enhanced security:
```toml
[[headers]]
  for = "/*"
  [headers.values]
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline'"
```

### Environment Variables
- Never commit `.env` files
- Use Netlify environment variables for secrets
- Regularly rotate API keys

## 📝 Deployment Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] Build successful (`npm run build`)
- [ ] Environment variables configured
- [ ] Custom domain set up (if applicable)
- [ ] SSL certificate active
- [ ] Analytics configured (optional)
- [ ] Error tracking set up (optional)
- [ ] Performance monitoring enabled
- [ ] Backup strategy in place

## 🆘 Support

For deployment issues:
- Check [Netlify Documentation](https://docs.netlify.com)
- Review build logs in Netlify dashboard
- Contact support via the repository issues

---

**Happy Deploying! 🚀**