# Quick Start Guide

## 🚀 Get Started in 3 Steps

### 1. Install Dependencies
```bash
npm install
# or
pnpm install
```

### 2. Set Up Environment (Optional)
```bash
cp .env.local.example .env.local
```

Edit `.env.local` if you want real AI responses:
```env
AI_API_KEY=your_openai_api_key_here
```

**Note**: The app works perfectly without an API key using mock responses!

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

## 📦 What's Included

✅ **Fully functional app** - Works immediately with mock AI responses  
✅ **All components** - Chat widget, theme toggle, language switcher  
✅ **3 languages** - English, Hindi, Telugu  
✅ **Dark/Light mode** - With smooth animations  
✅ **Responsive design** - Mobile, tablet, desktop  
✅ **SEO optimized** - Meta tags, sitemap, robots.txt  
✅ **Accessible** - WCAG 2.1 AA compliant  

## 🎨 Optional: Add Assets

The app works without these, but you can add them for a complete experience:

### Videos (Optional)
Place in `public/videos/`:
- `home.mp4` - Homepage background
- `about.mp4` - About page background

Get free videos from:
- [Pexels](https://www.pexels.com/search/videos/farming/)
- [Pixabay](https://pixabay.com/videos/search/agriculture/)

### Favicons (Optional)
- `public/favicon-light.png` (32x32 or 64x64)
- `public/favicon-dark.png` (32x32 or 64x64)

Create at: [Favicon.io](https://favicon.io/)

## 🤖 AI Integration

### Using Mock Mode (Default)
- No setup required
- Returns realistic farming advice
- Perfect for development and demos

### Using Real AI (OpenAI)
1. Get API key from [OpenAI Platform](https://platform.openai.com/)
2. Add to `.env.local`: `AI_API_KEY=sk-...`
3. Restart dev server

## 🌍 Features to Try

1. **Chat Widget** - Click the floating button (bottom right)
2. **Theme Toggle** - Switch between dark/light mode (top right)
3. **Language Switcher** - Try English, Hindi, or Telugu (top right)
4. **Location Detection** - Allow location access for context-aware responses
5. **Responsive Design** - Resize browser or test on mobile

## 📱 Test on Mobile

```bash
# Find your local IP
ipconfig getifaddr en0  # macOS
# or
hostname -I  # Linux

# Access from phone
http://YOUR_IP:3000
```

## 🏗️ Build for Production

```bash
npm run build
npm start
```

## 🐛 Troubleshooting

### Port 3000 already in use?
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

### Build errors?
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### TypeScript errors?
```bash
npm run type-check
```

## 📚 Learn More

- Check `README.md` for full documentation
- Review code comments for implementation details
- Explore `lib/` folder for utilities
- Check `components/` for reusable components

## 🎯 Next Steps

1. ✅ Run the app
2. ✅ Test all features
3. ✅ Try different languages
4. ✅ Test chat widget
5. ✅ Toggle dark mode
6. 📝 Customize colors in `tailwind.config.ts`
7. 📝 Add your own sectors in `app/page.tsx`
8. 📝 Extend translations in `lib/i18n.tsx`
9. 🚀 Deploy to Vercel/Netlify

## 💡 Tips

- **Mock mode is great** - Don't feel pressured to add an API key
- **Videos are optional** - App looks good without them
- **Start simple** - Get familiar with the code first
- **Customize gradually** - Change colors, add features, etc.

---

**Need help?** Check the main README.md or review the code comments!
