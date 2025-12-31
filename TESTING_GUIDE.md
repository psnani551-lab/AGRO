# Testing Guide

## 🧪 Manual Testing Checklist

### Initial Setup Test
```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev

# 3. Open browser
# Navigate to http://localhost:3000
```

### Homepage Tests

#### Visual Elements
- [ ] Video background loads (or shows overlay if no video)
- [ ] Hero section displays with title and subtitle
- [ ] Two CTA buttons are visible
- [ ] 9 sector cards display in grid
- [ ] Cards have icons, titles, and descriptions
- [ ] Navbar is sticky at top
- [ ] Theme toggle button visible (top right)
- [ ] Language switcher visible (top right)
- [ ] Chat widget floating button visible (bottom right)

#### Animations
- [ ] Page fades in on load
- [ ] Sector cards stagger animate on scroll
- [ ] Buttons have hover lift effect
- [ ] Buttons pulse on click
- [ ] Smooth transitions between elements

#### Responsive Design
- [ ] Resize browser to mobile width (< 640px)
  - [ ] Grid shows 1 column
  - [ ] Navbar adapts
  - [ ] Chat widget remains accessible
- [ ] Resize to tablet width (640-1024px)
  - [ ] Grid shows 2 columns
- [ ] Resize to desktop width (> 1024px)
  - [ ] Grid shows 3 columns

### Theme Toggle Tests

#### Light to Dark
- [ ] Click sun/moon icon in navbar
- [ ] Page transitions to dark mode
- [ ] All text remains readable
- [ ] Icons change color appropriately
- [ ] Background colors invert
- [ ] Favicon updates (if real favicons added)

#### Dark to Light
- [ ] Click icon again
- [ ] Page transitions to light mode
- [ ] All elements visible
- [ ] Smooth transition animation

#### Persistence
- [ ] Toggle theme
- [ ] Refresh page
- [ ] Theme persists (same as before refresh)
- [ ] Open in new tab
- [ ] Theme matches

#### System Preference
- [ ] Close all tabs
- [ ] Change system theme (OS settings)
- [ ] Open app in new tab
- [ ] App respects system preference

### Language Switcher Tests

#### English
- [ ] Click language switcher (globe icon)
- [ ] Dropdown appears
- [ ] Click "English"
- [ ] All UI text in English
- [ ] Navbar, buttons, sectors all translated

#### Hindi
- [ ] Click language switcher
- [ ] Select "हिंदी"
- [ ] All UI text changes to Hindi
- [ ] Verify: nav, hero, sectors, chat

#### Telugu
- [ ] Click language switcher
- [ ] Select "తెలుగు"
- [ ] All UI text changes to Telugu
- [ ] Verify all sections

#### Persistence
- [ ] Change language
- [ ] Refresh page
- [ ] Language persists
- [ ] Open new tab
- [ ] Language matches

### Chat Widget Tests

#### Opening/Closing
- [ ] Click floating chat button (bottom right)
- [ ] Chat window opens with animation
- [ ] Header shows "AI Assistant"
- [ ] Input field is focused
- [ ] Click X button
- [ ] Chat closes with animation
- [ ] Press Escape key
- [ ] Chat closes

#### Sending Messages
- [ ] Open chat
- [ ] Type "What crops should I plant?"
- [ ] Click send button (or press Enter)
- [ ] Message appears in chat
- [ ] Typing indicator shows
- [ ] AI response appears
- [ ] Response is relevant (mock or real)

#### Multiple Messages
- [ ] Send 3-4 messages
- [ ] All messages display
- [ ] Chat scrolls to bottom
- [ ] User messages on right (blue)
- [ ] AI messages on left (gray)

#### Error Handling
- [ ] Try sending empty message
- [ ] Button should be disabled
- [ ] Try very long message
- [ ] Should work (up to 1000 chars)

#### Accessibility
- [ ] Tab through chat elements
- [ ] All focusable
- [ ] Press Escape
- [ ] Chat closes
- [ ] Screen reader announces messages (if available)

### Location Detector Tests

#### Permission Grant
- [ ] Look for location button (if added to page)
- [ ] Click "Detect My Location"
- [ ] Browser asks for permission
- [ ] Click "Allow"
- [ ] Success message shows
- [ ] Coordinates display

#### Permission Deny
- [ ] Clear location permission
- [ ] Click detect button
- [ ] Click "Block"
- [ ] Error message shows
- [ ] Message is helpful

#### In Chat Context
- [ ] Detect location
- [ ] Open chat
- [ ] Send message about local farming
- [ ] AI response should reference location (if real AI)

### Navigation Tests

#### Links
- [ ] Click "Home" in navbar
- [ ] Stays on homepage
- [ ] Click "About" in navbar
- [ ] Navigates to about page
- [ ] Smooth transition
- [ ] Click "Home" again
- [ ] Returns to homepage

#### Smooth Scroll
- [ ] Scroll down page
- [ ] Click navbar link
- [ ] Smooth scroll to top

#### Animated Underline
- [ ] Hover over "Home" link
- [ ] Underline animates in
- [ ] Move mouse away
- [ ] Underline animates out

### About Page Tests

#### Content
- [ ] Navigate to /about
- [ ] Video background loads
- [ ] Page title displays
- [ ] Mission statement visible
- [ ] 4 feature cards show
- [ ] Privacy note at bottom

#### Animations
- [ ] Page fades in
- [ ] Feature cards stagger animate
- [ ] Smooth transitions

#### Navigation
- [ ] Theme toggle works
- [ ] Language switcher works
- [ ] Chat widget works
- [ ] Can navigate back to home

### Keyboard Navigation Tests

#### Tab Order
- [ ] Press Tab repeatedly
- [ ] Focus moves logically:
  1. Skip to content link
  2. Home link
  3. About link
  4. Language switcher
  5. Theme toggle
  6. Hero buttons
  7. Sector cards
  8. Chat button

#### Focus Visibility
- [ ] All focused elements have visible outline
- [ ] Outline color contrasts with background
- [ ] Easy to see where focus is

#### Keyboard Actions
- [ ] Tab to theme toggle
- [ ] Press Enter
- [ ] Theme changes
- [ ] Tab to language switcher
- [ ] Press Enter
- [ ] Dropdown opens
- [ ] Arrow keys navigate options
- [ ] Enter selects

#### Chat Widget
- [ ] Tab to chat button
- [ ] Press Enter
- [ ] Chat opens
- [ ] Focus trapped in chat
- [ ] Tab cycles through chat elements
- [ ] Press Escape
- [ ] Chat closes
- [ ] Focus returns to button

### Accessibility Tests

#### Screen Reader (if available)
- [ ] Enable VoiceOver (Mac) or NVDA (Windows)
- [ ] Navigate through page
- [ ] All elements announced
- [ ] ARIA labels read correctly
- [ ] Chat messages announced
- [ ] Button purposes clear

#### Color Contrast
- [ ] Use browser DevTools
- [ ] Check text contrast
- [ ] All text meets 4.5:1 ratio
- [ ] Interactive elements meet 3:1

#### Reduced Motion
- [ ] Enable reduced motion (OS settings)
- [ ] Refresh page
- [ ] Animations disabled or minimal
- [ ] App still functional

### Performance Tests

#### Load Time
- [ ] Open DevTools Network tab
- [ ] Hard refresh (Cmd+Shift+R / Ctrl+Shift+F5)
- [ ] Check load time
- [ ] Should be < 3 seconds

#### Bundle Size
- [ ] Check Network tab
- [ ] Main JS bundle < 200 KB
- [ ] CSS < 50 KB
- [ ] Total page < 500 KB (without videos)

#### Lighthouse Audit
- [ ] Open DevTools
- [ ] Go to Lighthouse tab
- [ ] Run audit
- [ ] Performance: > 90
- [ ] Accessibility: > 90
- [ ] Best Practices: > 90
- [ ] SEO: > 90

### API Integration Tests

#### Mock Mode (Default)
- [ ] Ensure no API key in .env.local
- [ ] Send chat message
- [ ] Receives mock response
- [ ] Response is relevant
- [ ] Note about mock mode shows

#### Real AI Mode (if API key added)
- [ ] Add OpenAI API key to .env.local
- [ ] Restart dev server
- [ ] Send chat message
- [ ] Receives real AI response
- [ ] Response is contextual
- [ ] No mock note shows

#### Error Handling
- [ ] Use invalid API key
- [ ] Send message
- [ ] Fallback to mock response
- [ ] Error logged (check console)

### Mobile Device Tests

#### iOS Safari
- [ ] Open on iPhone
- [ ] All features work
- [ ] Touch interactions smooth
- [ ] Chat widget usable
- [ ] Theme toggle works
- [ ] No layout issues

#### Android Chrome
- [ ] Open on Android
- [ ] All features work
- [ ] Touch interactions smooth
- [ ] Responsive layout correct

#### Tablet
- [ ] Open on iPad/Android tablet
- [ ] Layout adapts appropriately
- [ ] 2-column grid on sectors
- [ ] All features accessible

### Cross-Browser Tests

#### Chrome
- [ ] All features work
- [ ] Animations smooth
- [ ] No console errors

#### Firefox
- [ ] All features work
- [ ] Animations smooth
- [ ] No console errors

#### Safari
- [ ] All features work
- [ ] Animations smooth
- [ ] No console errors

#### Edge
- [ ] All features work
- [ ] Animations smooth
- [ ] No console errors

### SEO Tests

#### Meta Tags
- [ ] View page source
- [ ] Check title tag
- [ ] Check meta description
- [ ] Check OpenGraph tags
- [ ] Check Twitter Card tags

#### Structured Data
- [ ] View page source
- [ ] Find JSON-LD script
- [ ] Validate at schema.org validator
- [ ] No errors

#### Sitemap
- [ ] Navigate to /sitemap.xml
- [ ] XML displays correctly
- [ ] Both pages listed

#### Robots.txt
- [ ] Navigate to /robots.txt
- [ ] File displays
- [ ] Allows all crawlers
- [ ] Sitemap referenced

### Build Tests

#### Production Build
```bash
npm run build
```
- [ ] Build completes successfully
- [ ] No errors
- [ ] All routes generated
- [ ] Bundle sizes reasonable

#### Production Server
```bash
npm start
```
- [ ] Server starts
- [ ] Navigate to http://localhost:3000
- [ ] All features work
- [ ] Performance improved vs dev

## 🐛 Common Issues & Solutions

### Issue: Port 3000 in use
**Solution**: 
```bash
lsof -ti:3000 | xargs kill -9
# or
PORT=3001 npm run dev
```

### Issue: Videos not loading
**Solution**: Videos are optional. App works without them. Add real videos to `public/videos/` if needed.

### Issue: Favicons not showing
**Solution**: Favicons are placeholders. Create real PNG files or use the SVG versions in `public/`.

### Issue: Chat not responding
**Solution**: Check console for errors. Verify API route is working. Mock mode should always work.

### Issue: Animations not smooth
**Solution**: Check if reduced motion is enabled. Disable in OS settings if testing animations.

### Issue: Build fails
**Solution**:
```bash
rm -rf .next node_modules
npm install
npm run build
```

## ✅ Test Results Template

```
Date: ___________
Tester: ___________

Homepage: ☐ Pass ☐ Fail
About Page: ☐ Pass ☐ Fail
Theme Toggle: ☐ Pass ☐ Fail
Language Switcher: ☐ Pass ☐ Fail
Chat Widget: ☐ Pass ☐ Fail
Navigation: ☐ Pass ☐ Fail
Responsive: ☐ Pass ☐ Fail
Accessibility: ☐ Pass ☐ Fail
Performance: ☐ Pass ☐ Fail
Build: ☐ Pass ☐ Fail

Notes:
_________________________________
_________________________________
_________________________________
```

## 📊 Expected Results

All tests should pass with:
- ✅ No console errors
- ✅ Smooth animations
- ✅ Fast load times
- ✅ Responsive layout
- ✅ Accessible features
- ✅ Working AI chat (mock or real)
- ✅ Theme persistence
- ✅ Language switching
- ✅ Successful build

---

**Testing Status**: Ready for comprehensive testing
**Last Updated**: 2024
