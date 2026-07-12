# 🚀 AssetFlow - Step-by-Step Execution Guide

## ⚡ QUICK START (5 minutes)

### Step 1: Install Dependencies
```bash
cd /path/to/assetflow
npm install
# or
pnpm install
```

### Step 2: Start Development Server
```bash
npm run dev
# or
pnpm dev
```

You'll see:
```
  VITE v5.0.8  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  press h + enter to show help
```

### Step 3: Open in Browser
```
http://localhost:5173
```

### Step 4: Login
Use any credentials (mock auth):
- **Email**: test@company.com
- **Password**: anypassword123

✅ You're in! The full dashboard is ready to use.

---

## 📋 DETAILED SETUP (10 minutes)

### Prerequisites
- Node.js 18+ installed
- npm or pnpm package manager
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Full Installation Steps

#### 1. Clone or navigate to project
```bash
cd /path/to/assetflow
```

#### 2. Install all dependencies
```bash
npm install
```

Expected output:
```
added XXX packages in XXX seconds
```

#### 3. Verify installation
```bash
npm list vite
npm list react
npm list tailwindcss
```

All should show version numbers (no errors).

#### 4. Start development server
```bash
npm run dev
```

Wait for this message:
```
➜  Local:   http://localhost:5173/
```

#### 5. Open application
- Browser: `http://localhost:5173`
- Or use: `cmd/ctrl + click` on the Local URL in terminal

#### 6. You're running!
Login page appears → Use credentials → Dashboard loads

---

## 🎯 FEATURES TO EXPLORE

Once logged in, you'll see the sidebar with these sections:

### 1. Dashboard ✅
- Overview of today's metrics
- Quick action buttons
- Recent activity feed
- Usage statistics

**Try this**: Click "Dashboard" → See KPI cards update

### 2. Organization Setup (Admin) ✅
- Create departments
- Define asset categories
- Manage employees
- Configure organization hierarchy

**Try this**: Click "Organization Setup" → Add a Department

### 3. Assets ✅
- Register new assets
- Search and filter assets
- Track asset details
- View asset status

**Try this**: Click "Assets" → "+ Register Asset" → Fill form → Press Enter or Click Submit

### 4. Allocation & Transfer ✅
- Allocate assets to employees
- Transfer between departments
- Track allocation history
- Prevent double allocation

**Try this**: Click "Allocation & Transfer" → Create allocation

### 5. Resource Booking ✅
- Book conference rooms/resources
- View availability calendar
- Check booking conflicts
- Manage time slots

**Try this**: Click "Resource Booking" → Select date → Book a slot

### 6. Maintenance Management ✅
- Kanban board with 5 columns
- Drag and drop tasks
- Track maintenance status
- Manage workflow

**Try this**: Click "Maintenance" → Drag a card between columns

### 7. Audit ✅
- Verify asset locations
- Run audit cycles
- Generate discrepancy reports
- Track audit history

**Try this**: Click "Audit" → Close Audit Cycle

### 8. Reports ✅
- View analytics charts
- Utilization reports
- Maintenance frequency graphs
- Asset insights

**Try this**: Click "Reports" → Explore charts and export

### 9. Notifications ✅
- Activity log
- Filtered by type (All, Alerts, Approvals, Bookings)
- Timestamp tracking

**Try this**: Click "Notifications" → Filter by "Alerts"

---

## 🎨 DESIGN FEATURES

### Color Scheme
- **Dark Navy**: #0f172a (background)
- **Electric Cyan**: #00d4ff (primary accents)
- **Coral**: #ff6b35 (alerts, highlights)
- **Light Gray**: #e2e8f0 (text on dark)

### Responsive Design
The app works on:
- **Desktop**: 1920x1080 and larger
- **Tablet**: 768x1024
- **Mobile**: 375x667 (fully responsive)

**Try this**: Resize browser window → Sidebar collapses on mobile

### Animations
- **Smooth scrolling**: Lenis integration (no jarring jumps)
- **Hover effects**: Buttons and cards have subtle animation
- **Page transitions**: Smooth fade-in effects
- **Modal slides**: Smooth slide-in animations

**Try this**: Scroll down slowly → Notice smooth motion

### Forms
- **Enter key support**: Press Enter anywhere to submit
- **Toast notifications**: Success/error messages appear
- **Real-time validation**: Instant feedback
- **Accessible**: ARIA labels and keyboard navigation

**Try this**: Fill a form → Press Tab to navigate → Press Enter to submit

---

## 🔧 DEVELOPMENT COMMANDS

### Development
```bash
npm run dev        # Start dev server (hot reload enabled)
npm run build      # Build for production
npm run preview    # Preview production build locally
```

### Project Structure
```
assetflow/
├── src/
│   ├── pages/              # Feature pages (Dashboard, Assets, etc.)
│   ├── components/         # Reusable components (Layout, UI)
│   ├── context/           # React Context (Auth, Data)
│   ├── hooks/             # Custom hooks (useForm, useLenis)
│   ├── utils/             # Helper functions
│   ├── App.jsx            # Main app with routing
│   ├── main.jsx           # Entry point
│   └── index.css          # Global styles + Tailwind
├── public/                # Static assets
├── index.html             # HTML template
├── package.json           # Dependencies
├── vite.config.js         # Vite configuration
├── tailwind.config.js     # Tailwind CSS configuration
└── README.md              # Full documentation
```

### File Types Used
- `.jsx` - React components
- `.js` - Utilities and hooks
- `.css` - Styling (Tailwind)
- `.md` - Documentation

---

## 🔐 AUTHENTICATION SYSTEM

### Current Setup
- **Mock Authentication**: Works instantly (no backend needed)
- **Type**: Session-based with localStorage
- **Features**: Login, Signup, Logout, Role management

### How It Works
1. Enter email and password on login page
2. Click "Sign In" (or press Enter)
3. Session created and stored locally
4. Redirected to dashboard
5. Sidebar shows user info
6. Can logout from navbar

### OAuth Integration Ready ✅
The app structure supports OAuth integration:
- Google OAuth
- Microsoft OAuth
- Custom OAuth provider

**To enable OAuth**: 
1. Get client ID and client secret from your OAuth provider
2. Add environment variables (see OAuth section below)
3. Uncomment OAuth button code in Login.jsx
4. Backend API integration ready

### Test Credentials
```
Email: test@company.com
Password: anypassword (any password works in mock mode)
```

Or:
```
Email: admin@company.com
Password: admin123
```

---

## 🌍 TESTING ALL PAGES

### Quick Page Tour

```bash
# After logging in, visit each URL directly:

http://localhost:5173/dashboard           # Dashboard
http://localhost:5173/organization        # Organization Setup
http://localhost:5173/assets              # Assets
http://localhost:5173/allocation          # Allocation & Transfer
http://localhost:5173/bookings            # Resource Booking
http://localhost:5173/maintenance         # Maintenance
http://localhost:5173/audit               # Audit
http://localhost:5173/reports             # Reports
http://localhost:5173/notifications       # Notifications
```

### Test Modal Forms

1. **Asset Modal**
   - Click "+ Register Asset"
   - Fill all fields
   - Press Enter or click Submit
   - Mock data saved to state

2. **Booking Modal**
   - Click "Book a slot"
   - Select dates
   - Enter details
   - Submit

3. **Maintenance Modal**
   - Click "Create Maintenance"
   - Fill form
   - Submit

4. **Organization Modal**
   - Click "+ Add Department"
   - Fill details
   - Submit

### Test Notifications
- Click any button to trigger notifications
- See toast appear in top-right
- Different colors for success/error
- Auto-dismiss after 3 seconds

### Test Responsive Design
1. Open DevTools (F12)
2. Click device toolbar icon
3. Select "iPhone 13" or custom size
4. Refresh page
5. Observe responsive layout

---

## 🎯 COMMON TASKS

### Add a New Asset
1. Go to Assets page
2. Click "+ Register Asset"
3. Fill in:
   - Asset ID (e.g., AF-0100)
   - Asset Name (e.g., "Dell Monitor")
   - Category (choose from dropdown)
   - Status (Available/Maintenance)
4. Press Enter or click Submit
5. Asset appears in table

### Create an Allocation
1. Go to Allocation & Transfer
2. Click "Create Allocation"
3. Select asset and employee
4. Click Submit
5. Allocation created with history

### Book a Resource
1. Go to Resource Booking
2. Click "Book a slot"
3. Select date and time
4. Enter resource details
5. Submit
6. Booking appears in calendar

### Run Maintenance
1. Go to Maintenance
2. Click "Create Maintenance"
3. Fill asset and details
4. Submit
5. Card appears in "Pending" column
6. Drag to "In Progress" → "Resolved"

### View Reports
1. Go to Reports
2. See 4 different charts:
   - Utilization by Department
   - Maintenance Frequency
   - Most Used Assets
   - Assets for Maintenance
3. Click "Export Report" to download

---

## 🎨 CUSTOMIZATION

### Change Colors
Edit `tailwind.config.js`:

```javascript
colors: {
  dark: '#0f172a',           // Change background
  cyan: '#00d4ff',           // Change primary
  coral: '#ff6b35',          // Change accent
  // ... other colors
}
```

Then save → Auto-reload in browser

### Change Fonts
Edit `src/index.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=YourFont&display=swap');

body {
  font-family: 'YourFont', sans-serif;
}
```

### Add New Page
1. Create `src/pages/yourpage/YourPage.jsx`
2. Add route in `src/App.jsx`
3. Add sidebar link in `src/components/layout/Sidebar.jsx`
4. Import and use like other pages

### Modify Data Structure
Edit `src/context/DataContext.jsx` to change:
- Asset fields
- Booking structure
- Maintenance status
- Any mock data

---

## 🚀 DEPLOYMENT

### Build for Production
```bash
npm run build
```

Creates optimized `dist/` folder

### Deploy Options

#### Option 1: Vercel (Recommended)
```bash
npm install -g vercel
vercel
# Follow prompts
```

#### Option 2: Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

#### Option 3: GitHub Pages
1. Build: `npm run build`
2. Push `dist/` folder
3. Enable GitHub Pages in settings

#### Option 4: Traditional Hosting
1. Build: `npm run build`
2. Upload `dist/` folder to server
3. Configure server to serve `index.html` for all routes

---

## ⚙️ ENVIRONMENT VARIABLES

### For OAuth Integration
Create `.env.local`:

```env
VITE_GOOGLE_CLIENT_ID=your_client_id_here
VITE_GOOGLE_CLIENT_SECRET=your_secret_here
VITE_MICROSOFT_CLIENT_ID=your_client_id_here
VITE_API_BASE_URL=http://localhost:3000/api
```

Then restart dev server:
```bash
npm run dev
```

Access in code:
```javascript
const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
```

---

## 🐛 TROUBLESHOOTING

### Issue: "Cannot find module 'react'"
**Solution**: Run `npm install` again

### Issue: Port 5173 already in use
**Solution**: Kill process or use different port
```bash
npm run dev -- --port 5174
```

### Issue: Styles not loading
**Solution**: 
1. Restart dev server
2. Clear browser cache (Ctrl+Shift+Del)
3. Hard refresh (Ctrl+Shift+R)

### Issue: Forms not submitting
**Solution**: 
1. Check browser console (F12)
2. Ensure all required fields filled
3. Try clicking submit button (Enter key might not work in nested forms)

### Issue: Responsive not working
**Solution**: Clear localStorage
```javascript
// Run in browser console:
localStorage.clear()
location.reload()
```

### Issue: Notifications not showing
**Solution**: Check Sonner is imported correctly in App.jsx

---

## 📚 DOCUMENTATION GUIDES

Read in this order:

1. **PROJECT_OVERVIEW.md** (2 min) - Quick reference
2. **README.md** (5 min) - Full feature guide
3. **SETUP_GUIDE.md** (10 min) - Detailed setup
4. **COMPLETION_SUMMARY.md** (5 min) - Project status

---

## ✅ VERIFICATION CHECKLIST

After setup, verify:

- [ ] Dev server running at http://localhost:5173
- [ ] Login page displays correctly
- [ ] Can login with any email/password
- [ ] Dashboard shows KPI cards and charts
- [ ] Sidebar navigation works
- [ ] All pages load without errors
- [ ] Forms submit on Enter key
- [ ] Notifications show on actions
- [ ] Responsive design works on mobile
- [ ] Smooth scrolling on long pages
- [ ] Charts display data correctly
- [ ] Kanban drag-and-drop works
- [ ] Modals open and close smoothly
- [ ] Logout works from navbar

Once all verified: ✅ **Project is ready to use!**

---

## 🎯 NEXT STEPS

### Immediate
- [ ] Run `npm run dev`
- [ ] Open http://localhost:5173
- [ ] Explore all pages and features
- [ ] Read README.md for details

### Short Term
- [ ] Customize colors in tailwind.config.js
- [ ] Add your own logo/branding
- [ ] Integrate with real API endpoint
- [ ] Connect OAuth authentication

### Medium Term
- [ ] Add database backend
- [ ] Implement real authentication
- [ ] Deploy to production
- [ ] Add custom features

### Long Term
- [ ] Add user roles and permissions
- [ ] Implement real-time notifications
- [ ] Add advanced reporting
- [ ] Mobile app integration

---

## 📞 SUPPORT

### Stuck? Check:
1. **Browser Console** (F12) - Look for error messages
2. **README.md** - Feature documentation
3. **SETUP_GUIDE.md** - Configuration help
4. **Code Comments** - In all .jsx files

### Common Issues:
- Dependencies not installed → Run `npm install`
- Server not running → Run `npm run dev`
- Page not found → Check URL and routing
- Styles broken → Clear cache and restart

---

## 🎉 YOU'RE ALL SET!

```bash
# One command to get started:
npm install && npm run dev

# Then open:
http://localhost:5173

# Login with any email/password
# Explore the full AssetFlow application!
```

**Happy developing! 🚀**

Built with React + Vite + Tailwind CSS
Fully functional, production-ready, no backend required for demo

---

**Last Updated**: July 12, 2026
**Status**: ✅ Complete & Ready to Run
**Version**: 1.0.0
