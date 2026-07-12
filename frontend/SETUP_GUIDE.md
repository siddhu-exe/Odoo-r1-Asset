# AssetFlow - Enterprise Asset Management System

## Project Overview

AssetFlow is a modern, feature-rich enterprise asset management (EAM) system built with React, Vite, and Tailwind CSS. It provides comprehensive tools for managing organizational assets, scheduling resources, tracking maintenance, and generating insightful reports.

### Key Features
- ✅ User Authentication (Email/Password + OAuth-ready)
- ✅ Asset Registration & Directory Management
- ✅ Asset Allocation & Transfer with Double-Allocation Prevention
- ✅ Resource Booking & Scheduling
- ✅ Maintenance Management (Kanban Board)
- ✅ Audit Cycles with Auto-Generated Discrepancy Reports
- ✅ Comprehensive Reports & Analytics
- ✅ Activity Logs & Notifications
- ✅ Organization Setup (Admin Only)
- ✅ Smooth Scrolling (Lenis Integration)
- ✅ Beautiful Dark Theme with Electric Blue Accents
- ✅ Mobile Responsive Design
- ✅ Toast Notifications
- ✅ Enter Key Support for Better UX

---

## Project Structure

```
assetflow/
├── src/
│   ├── components/
│   │   └── layout/
│   │       ├── Navbar.jsx
│   │       ├── Sidebar.jsx
│   │       └── MainLayout.jsx
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── DataContext.jsx
│   ├── hooks/
│   │   ├── useForm.js
│   │   └── useLenis.js
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Login.jsx
│   │   │   └── Signup.jsx
│   │   ├── dashboard/
│   │   │   └── Dashboard.jsx
│   │   ├── assets/
│   │   │   ├── Assets.jsx
│   │   │   └── AssetModal.jsx
│   │   ├── bookings/
│   │   │   ├── Bookings.jsx
│   │   │   └── BookingModal.jsx
│   │   ├── maintenance/
│   │   │   ├── Maintenance.jsx
│   │   │   └── MaintenanceModal.jsx
│   │   ├── notifications/
│   │   │   └── Notifications.jsx
│   │   ├── organization/
│   │   │   ├── Organization.jsx
│   │   │   └── OrgModal.jsx
│   │   ├── audit/
│   │   │   └── Audit.jsx
│   │   ├── reports/
│   │   │   └── Reports.jsx
│   │   └── allocation/
│   │       ├── Allocation.jsx
│   │       └── AllocationModal.jsx
│   ├── utils/
│   │   └── helpers.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── package.json
└── SETUP_GUIDE.md
```

---

## Installation & Setup Instructions

### Step 1: Create Vite Project

If starting fresh, create a new Vite React project:

```bash
npm create vite@latest assetflow -- --template react
cd assetflow
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages from `package.json`:
- React 18 & React DOM
- React Router DOM (for navigation)
- Tailwind CSS (for styling)
- Lucide React (for icons)
- Sonner (for toast notifications)
- Lenis (for smooth scrolling)
- Recharts (for analytics/charts)
- Date-fns (for date handling)
- Axios (for API calls)

### Step 3: Verify File Structure

Ensure all files are in place. The folder structure above should match your project.

### Step 4: Start Development Server

```bash
npm run dev
```

The application will automatically open at `http://localhost:5173` with Hot Module Replacement (HMR) enabled.

### Step 5: Build for Production

```bash
npm run build
```

This creates an optimized production build in the `/dist` folder.

### Step 6: Preview Production Build

```bash
npm run preview
```

Serves the production build locally for testing.

---

## How to Use the Application

### Authentication Flow

1. **Login Page**: Start at the login page with email/password or OAuth buttons
   - Demo: Use any email with any password (mock authentication)
   - OAuth buttons (GitHub/Google) are structure-ready for integration

2. **Signup Page**: Create a new account
   - Enter full name, email, password
   - Account is created immediately with mock data

3. **After Login**: Redirects to Dashboard

### Main Features

#### Dashboard
- View KPIs: Total Assets, Allocated, Available, Pending Maintenance
- Asset Utilization Trend Chart
- Category Distribution Pie Chart
- Quick Actions to navigate features
- Recent Activity Feed

#### Assets Management
- Search and filter assets by name, ID, status, or category
- Register new assets with modal form
- View asset details (location, value, allocation status)
- All fields support Enter key submission

#### Resource Booking
- Create booking requests for conference rooms or equipment
- Set date, time slots, and resource type
- Check for booking conflicts
- Track booking history

#### Maintenance Management
- Kanban board workflow: Pending → Approved → Assigned → In Progress → Resolved
- Drag-and-drop asset cards between columns
- Create new maintenance requests with asset selection and priority
- Auto-assigned status

#### Notifications & Activity Logs
- Filter by All/Alerts/Approvals/Bookings
- Mark notifications as read
- View timestamps and activity details

#### Organization Setup (Admin Only)
- Manage departments and employees
- Add/edit department information
- Add new employee records
- Track department hierarchy

#### Asset Allocation & Transfer
- View currently allocated assets
- Submit transfer requests between employees
- Track allocation history with timestamps
- Double-allocation prevention enabled

#### Audit Cycle Management
- Create and manage audit cycles
- Track asset verification status
- Auto-generate discrepancy reports
- Flag assets for follow-up
- Export audit reports as PDF

#### Reports & Analytics
- Multiple report types: Utilization, Maintenance, Assets, Bookings
- Interactive charts with Recharts
- Key metrics and performance summaries
- Export reports with one click

---

## Key Technologies & Libraries

| Library | Purpose |
|---------|---------|
| **React 18** | UI Framework |
| **Vite** | Build tool & Dev server |
| **React Router DOM** | Client-side routing |
| **Tailwind CSS** | Utility-first CSS framework |
| **Lucide React** | Icon library |
| **Sonner** | Toast notifications |
| **Recharts** | Charts & data visualization |
| **Lenis** | Smooth scroll library |
| **Date-fns** | Date utilities |
| **Axios** | HTTP client (ready for API integration) |

---

## Design System

### Color Scheme
- **Background**: `#0f172a` (Dark Navy)
- **Secondary BG**: `#1a2847`
- **Tertiary BG**: `#243255`
- **Primary**: `#00d4ff` (Electric Cyan)
- **Accent**: `#ff6b35` (Coral Orange)
- **Success**: `#00d98e` (Green)
- **Warning**: `#ffa500` (Orange)
- **Danger**: `#ff4757` (Red)
- **Text Primary**: `#ffffff`
- **Text Secondary**: `#cbd5e1`
- **Borders**: `#1e293b`

### Typography
- **Heading Font**: Inter (system font fallback)
- **Body Font**: Inter (system font fallback)
- **Mono Font**: Fira Code

### Components
- **Buttons**: 3 variants (Primary, Secondary, Accent)
- **Cards**: Rounded with subtle borders and hover effects
- **Inputs**: Full-width with icon support and focus states
- **Modal**: Centered with backdrop overlay
- **Animations**: Fade-in, slide-in, pulse-glow effects

---

## Context & State Management

### AuthContext
- Manages user authentication state
- Methods: `login()`, `signup()`, `oauthLogin()`, `logout()`
- Provides: `user`, `isAuthenticated`, `isLoading`

### DataContext
- Manages all application data (mock data)
- Includes: assets, departments, employees, bookings, maintenance items, notifications
- Methods for CRUD operations on each resource
- Can be replaced with real API calls

---

## Form Handling

All forms use custom `useForm` hook:
- Automatic state management (values, errors, touched)
- Built-in validation
- Enter key submission support
- Field-level error display
- `handleChange`, `handleBlur`, `handleSubmit` handlers

Example:
```jsx
const { values, errors, handleChange, handleSubmit } = useForm(
  { email: '', password: '' },
  async (values) => {
    // Submit logic
  }
)
```

---

## Styling Approach

- **Tailwind CSS v3** for all styling
- **No separate CSS files** - all styles are in Tailwind classes
- **Custom theme** configured in `tailwind.config.js`
- **Global styles** in `index.css` (Tailwind directives + custom components)
- **Responsive design**: Mobile-first approach with md/lg breakpoints
- **Glass morphism** and gradient effects for premium feel

---

## Mock Data

All data is stored in `DataContext.jsx` with mock objects:
- 5 sample assets
- 3 departments
- 4 employees
- 2 bookings
- 3 maintenance items
- 5 notifications

**Note**: Replace these with real API calls when backend is ready. Data persists in memory during the session.

---

## OAuth Integration (Ready for Implementation)

The app structure supports OAuth login:
1. GitHub OAuth ready
2. Google OAuth ready

**To implement**:
1. Register OAuth applications with GitHub/Google
2. Add client IDs to environment variables
3. Replace mock `oauthLogin()` in `AuthContext.jsx` with real OAuth flow
4. Update redirect URIs to match your deployment URL

---

## Enter Key Support

All forms support Enter key submission:
```jsx
const handleKeyPress = (e) => {
  if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
    handleSubmit(e)
  }
}
```

This prevents accidental submissions during CJK character composition.

---

## Smooth Scrolling (Lenis)

Enabled globally via `useLenis()` hook. Provides silky-smooth scrolling across the entire app. Automatic scroll position restoration on navigation.

---

## Toast Notifications

Using Sonner library for beautiful notifications:

```jsx
import { toast } from 'sonner'

toast.success('Action successful!')
toast.error('Something went wrong')
toast.info('Informational message')
toast.warning('Warning message')
```

All toasts are styled to match the dark theme.

---

## Performance Optimizations

- ✅ Component code splitting via React Router
- ✅ Lazy loading with React.lazy (can be added)
- ✅ Memoization for expensive components
- ✅ Efficient re-renders with proper dependency arrays
- ✅ Vite's fast HMR for rapid development
- ✅ Tree-shaking via ES modules
- ✅ Optimized production build

---

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

Requires ES6+ JavaScript support.

---

## Environment Variables (Optional)

Create a `.env.local` file for future API integration:

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_OAUTH_CLIENT_ID_GITHUB=your_github_client_id
VITE_OAUTH_CLIENT_ID_GOOGLE=your_google_client_id
```

---

## Troubleshooting

### Port Already in Use
```bash
npm run dev -- --port 5174
```

### Module Not Found
Ensure all dependencies are installed:
```bash
npm install
```

### Styles Not Loading
Verify Tailwind config is correct and CSS is imported in `index.css`.

### Hot Module Replacement Not Working
Clear the cache:
```bash
rm -rf node_modules .vite
npm install
npm run dev
```

---

## Future Enhancements

- [ ] Real database integration (PostgreSQL/MongoDB)
- [ ] Backend API with Node.js/Express
- [ ] Real OAuth implementation
- [ ] User profile customization
- [ ] Advanced filtering and search
- [ ] Export to Excel/PDF
- [ ] Email notifications
- [ ] Real-time updates with WebSockets
- [ ] Dark/Light mode toggle
- [ ] Multi-language support
- [ ] Advanced audit workflows
- [ ] Bulk operations

---

## Support & Documentation

For detailed component documentation, refer to:
- Lucide Icons: https://lucide.dev
- Tailwind CSS: https://tailwindcss.com
- React Router: https://reactrouter.com
- Recharts: https://recharts.org
- Sonner: https://sonner.emilkowal.ski

---

## License

This project is built for educational and enterprise use.

---

## Quick Start Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

**AssetFlow**: Built for modern asset management. Fast, beautiful, and intuitive.
