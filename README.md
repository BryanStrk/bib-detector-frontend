# Bib Detector Frontend

![Status](https://img.shields.io/badge/status-production-brightgreen)
![React](https://img.shields.io/badge/react-19+-61dafb)
![Vite](https://img.shields.io/badge/vite-latest-646cff)
![Tailwind CSS](https://img.shields.io/badge/tailwind-4+-06B6D4)
![Node.js](https://img.shields.io/badge/node-18+-339933)
![License](https://img.shields.io/badge/license-MIT-green)

**Modern React SPA for athlete race photo gallery and privacy-first claim flow.** Built with React 19, Vite for blazing-fast development, and Tailwind CSS for responsive design. Features admin dashboard, public gallery, and secure runner authentication.

**Live:** https://bib-detector-frontend.vercel.app

---

## 📋 Table of Contents

- [Tech Stack](#tech-stack)
- [Features](#features)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Component Architecture](#component-architecture)
- [Styling with Tailwind](#styling-with-tailwind)
- [Authentication Flow](#authentication-flow)
- [Deployment](#deployment)
- [Development](#development)
- [Best Practices](#best-practices)

---

## 🛠️ Tech Stack

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Framework** | React 19 | UI library with latest hooks & features |
| **Build Tool** | Vite | Lightning-fast dev server & bundling |
| **Routing** | React Router 7 | Client-side navigation & nested routes |
| **Styling** | Tailwind CSS 4 | Utility-first CSS, optimized production |
| **HTTP Client** | Fetch API | Native async/await data fetching |
| **State** | React Context | Auth & runner session management |
| **Node** | 18.0.0+ | LTS version recommended |
| **Package Manager** | npm 9+ | Dependencies & scripts |

---

## ✨ Features

### Admin Experience
- 📊 **Detection Dashboard** — Statistics on processed photos, detected bibs, confidence metrics
- 🖼️ **Photo Gallery** — Browse & delete race photos
- 📤 **Batch Upload** — Process multiple photos concurrently
- 📋 **Analytics** — Processing time, detection accuracy trends

### Runner Experience
- 📝 **Claim Flow** — Select event → enter bib + email → receive magic link
- 🔐 **Secure Access** — No signup required, token-based authentication (24h)
- 📸 **Private Gallery** — See only photos where runner appears
- 💧 **Watermarked Preview** — "BIB DETECTOR" watermark on gallery view
- ⬇️ **Download Original** — Signed URL for 1-hour authenticated access

### Technical Highlights
- ⚡ **Vite HMR** — Instant feedback during development
- 🎨 **Responsive Design** — Mobile-first Tailwind CSS
- 🔄 **Code Splitting** — Automatic route-based splitting
- 🛡️ **Type-Safe** — (Ready for TypeScript migration)
- ♿ **Accessible** — WCAG-compliant components

---

## 🚀 Getting Started

### Prerequisites

- **Node.js 18.0.0+** (check with `node --version`)
- **npm 9+** (included with Node.js)
- **Git**

### Installation

#### 1. Clone Repository
```bash
git clone https://github.com/BryanStrk/bib-detector-frontend.git
cd bib-detector-frontend
```

#### 2. Install Dependencies
```bash
npm install
```

This installs:
- React 19 + React Router 7
- Vite + ESLint plugin
- Tailwind CSS + PostCSS
- All peer dependencies

#### 3. Configure Environment Variables

Create `.env.local` file in project root:

```env
# Backend API
VITE_API_URL=http://localhost:8000

# App metadata
VITE_APP_NAME=Bib Detector
VITE_APP_VERSION=1.0.0
```

**For Production (Vercel):**
```env
VITE_API_URL=https://bryanstrike-bib-detector.hf.space
```

**⚠️ Important:** Add `.env.local` to `.gitignore` — never commit environment files.

#### 4. Start Development Server
```bash
npm run dev
```

**Output:**
```
  VITE v8.0.16  ready in 191 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Visit http://localhost:5173/ in your browser.

#### 5. Build for Production
```bash
npm run build
```

Generates optimized bundle in `dist/` directory.

#### 6. Preview Production Build
```bash
npm run preview
```

Serves production bundle locally for testing.

---

## 📂 Project Structure

```
bib-detector-frontend/
├── src/
│   ├── pages/                    # Route components (lazy-loaded)
│   │   ├── Dashboard.jsx         # Admin: detection stats & photos
│   │   ├── Gallery.jsx           # Public/admin gallery view
│   │   ├── Claim.jsx             # Runner: claim form
│   │   ├── ClaimVerify.jsx       # Runner: token verification
│   │   ├── MyPhotos.jsx          # Runner: private gallery
│   │   └── NotFound.jsx          # 404 fallback
│   │
│   ├── components/               # Reusable UI components
│   │   ├── Navbar.jsx            # Header with navigation
│   │   ├── Footer.jsx            # Footer
│   │   ├── Gallery/
│   │   │   ├── Gallery.jsx       # Gallery grid container
│   │   │   ├── PhotoCard.jsx     # Individual photo card
│   │   │   └── PhotoModal.jsx    # Full-screen photo viewer
│   │   ├── Forms/
│   │   │   ├── ClaimForm.jsx     # Bib claim form
│   │   │   └── UploadForm.jsx    # Photo upload form
│   │   ├── Badges/
│   │   │   └── EstadoBadge.jsx   # Status badge component
│   │   ├── Icons.jsx             # SVG icon components
│   │   └── Loaders/
│   │       └── Spinner.jsx       # Loading indicator
│   │
│   ├── context/                  # Global state management
│   │   ├── AuthContext.jsx       # Admin auth context
│   │   └── runner-auth.js        # Runner token helpers
│   │
│   ├── services/                 # API & business logic
│   │   ├── detectionApi.js       # HTTP client (BASE_URL=VITE_API_URL)
│   │   └── utils.js              # Helper functions
│   │
│   ├── lib/                      # Utilities
│   │   ├── detections.js         # Detection data helpers
│   │   └── validators.js         # Input validation
│   │
│   ├── styles/
│   │   └── index.css             # Global styles & Tailwind imports
│   │
│   ├── App.jsx                   # Route definitions & layout
│   ├── main.jsx                  # React entry point
│   └── index.css                 # Tailwind + globals
│
├── public/
│   ├── favicon.svg
│   └── index.html
│
├── .env.example                  # Template for .env.local
├── .env.local                    # (Git-ignored) Local env vars
├── .eslintrc.cjs                 # ESLint config
├── eslint.config.js              # Flat config (ESLint 9+)
├── tailwind.config.js            # Tailwind customization
├── postcss.config.js             # PostCSS plugins
├── vite.config.js                # Vite bundler config
├── package.json
├── package-lock.json
└── README.md
```

---

## 🧩 Component Architecture

### Smart Components (Containers)
Handle state, fetch data, pass props to presentational components.

```jsx
// pages/Dashboard.jsx
export default function Dashboard() {
  const { adminToken } = useAuth();
  const [photos, setPhotos] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      const response = await detectionApi.getStats(adminToken);
      setStats(response);
    };
    fetchStats();
  }, [adminToken]);

  return (
    <div className="container mx-auto">
      <StatsGrid stats={stats} />
      <Gallery photos={photos} />
    </div>
  );
}
```

### Presentational Components
Pure UI components that receive data via props.

```jsx
// components/Gallery/PhotoCard.jsx
export default function PhotoCard({ photo, onDelete, isAdmin }) {
  return (
    <div className="relative overflow-hidden rounded-lg shadow-lg">
      <img
        src={photo.preview_url}
        alt="Race photo"
        className="w-full h-64 object-cover"
      />
      {isAdmin && (
        <button
          onClick={() => onDelete(photo.id)}
          className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded"
        >
          ✕
        </button>
      )}
    </div>
  );
}
```

### Context Providers (State)

**Admin Auth:**
```jsx
// context/AuthContext.jsx
export const AuthProvider = ({ children }) => {
  const [adminToken, setAdminToken] = useState(
    localStorage.getItem("bib-detector.admin-token")
  );

  const login = (token) => {
    localStorage.setItem("bib-detector.admin-token", token);
    setAdminToken(token);
  };

  return (
    <AuthContext.Provider value={{ adminToken, login }}>
      {children}
    </AuthContext.Provider>
  );
};
```

**Runner Auth:**
```javascript
// context/runner-auth.js
export const getRunnerToken = () =>
  localStorage.getItem("bib-detector.runner-token");

export const setRunnerToken = (token) =>
  localStorage.setItem("bib-detector.runner-token", token);

export const clearRunnerToken = () =>
  localStorage.removeItem("bib-detector.runner-token");
```

---

## 🎨 Styling with Tailwind CSS

### Custom Color Palette

Defined in `tailwind.config.js`:

```javascript
export default {
  theme: {
    extend: {
      colors: {
        ink: "#1a1a2e",      // Text color
        canvas: "#0f0f1e",   // Background
        accent: "#7c3aed",   // Primary (purple)
        accent-dark: "#2563eb", // Secondary (blue)
      },
    },
  },
};
```

### Usage in Components

```jsx
// Header with gradient
<header className="bg-gradient-to-r from-accent to-accent-dark">
  <h1 className="text-white font-bold text-2xl">Bib Detector</h1>
</header>

// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {photos.map(photo => <PhotoCard key={photo.id} {...photo} />)}
</div>

// Watermark badge
<span className="inline-block px-3 py-1 bg-opacity-50 bg-ink text-white rounded-full text-sm">
  #819
</span>
```

### Key Tailwind Features Used

| Feature | Example | Purpose |
|---------|---------|---------|
| **Responsive** | `md:flex`, `lg:grid-cols-4` | Mobile-first design |
| **Dark Mode** | `dark:bg-slate-900` | Support for dark theme |
| **Gradients** | `bg-gradient-to-r` | Visual polish |
| **Opacity** | `opacity-50`, `bg-opacity-75` | Layering & watermarks |
| **Grid** | `grid grid-cols-1 md:grid-cols-2` | Flexible layouts |
| **Spacing** | `px-4 py-2 gap-8` | Consistent padding |

---

## 🔐 Authentication Flow

### Admin Flow

```
┌─────────────────┐
│  Login Page     │
└────────┬────────┘
         │ username + password
         ↓
┌─────────────────┐       ┌──────────────┐
│  Backend Auth   │──────→│  JWT Token   │
└─────────────────┘       └────────┬─────┘
                                   │
                         ┌─────────↓────────┐
                         │ localStorage:    │
                         │ admin-token      │
                         └──────────────────┘
                                   │
                         ┌─────────↓────────┐
                         │ useAuth hook     │
                         │ AuthContext      │
                         └──────────────────┘
```

**Implementation:**
```jsx
function LoginPage() {
  const { login } = useAuth();

  const handleLogin = async (username, password) => {
    const response = await detectionApi.loginAdmin(username, password);
    login(response.access_token);
    navigate("/dashboard");
  };

  return <LoginForm onSubmit={handleLogin} />;
}
```

### Runner Flow

```
┌──────────────────┐
│  /claim Form     │
│  event + bib     │
│  + email         │
└────────┬─────────┘
         │ POST /api/claims
         ↓
┌──────────────────┐
│  Backend sends   │
│  magic link      │
│  email           │
└────────┬─────────┘
         │
    ┌────↓────────────────────┐
    │ Runner opens email link  │
    │ /claim/verify?token=...  │
    └────┬─────────────────────┘
         │
         ↓
┌──────────────────────────┐
│  POST /claims/verify     │
│  { claim_token }         │
└────┬─────────────────────┘
     │
     ↓
┌──────────────────────┐      ┌──────────────┐
│  Backend validates   │─────→│ Runner Token │
│  claim token        │      └────────┬─────┘
└──────────────────────┘             │
                        ┌────────────↓──────────┐
                        │  setRunnerToken()     │
                        │  localStorage         │
                        └─────────────┬─────────┘
                                      │
                        ┌─────────────↓─────────┐
                        │ Redirect to /my-photos│
                        └───────────────────────┘
```

**Implementation:**
```jsx
// Claim.jsx
function ClaimPage() {
  const handleClaim = async (event_id, bib_number, email) => {
    await detectionApi.requestClaim({ event_id, bib_number, email });
    setSubmitted(true); // Show "check inbox" message
  };

  return <ClaimForm onSubmit={handleClaim} />;
}

// ClaimVerify.jsx
function ClaimVerifyPage() {
  useEffect(() => {
    const token = new URLSearchParams(location.search).get("token");
    const verifyAndRedirect = async () => {
      const response = await detectionApi.verifyClaim(token);
      setRunnerToken(response.access_token);
      navigate("/my-photos");
    };
    verifyAndRedirect();
  }, []);

  return <div>Verifying...</div>;
}

// MyPhotos.jsx
function MyPhotosPage() {
  const runnerToken = getRunnerToken();
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    const fetchPhotos = async () => {
      const response = await detectionApi.getMyPhotos(runnerToken);
      setPhotos(response.photos);
    };
    fetchPhotos();
  }, [runnerToken]);

  return <Gallery photos={photos} isAdmin={false} />;
}
```

---

## 🚀 Deployment

### Vercel (Recommended)

**Prerequisites:**
- Vercel account linked to GitHub
- Repository already connected

**Automatic Deployment:**
1. Push to `main` branch
2. Vercel detects changes
3. Automatic build & deployment
4. Preview URL provided on PR

**Environment Variables (Vercel Dashboard):**
```
VITE_API_URL=https://bryanstrike-bib-detector.hf.space
```

**Manual Deploy:**
```bash
npm run build
vercel deploy --prod
```

**Live URL:** https://bib-detector-frontend.vercel.app

### Manual Build & Deploy

```bash
# Build optimized bundle
npm run build

# Bundle size analysis
npm run preview

# Deploy to hosting of choice (Netlify, GitHub Pages, etc.)
```

---

## 💻 Development

### Available Scripts

```bash
# Start dev server with HMR
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Lint code
npm run lint

# Format code (if configured)
npm run format
```

### Development Workflow

1. **Run dev server:**
   ```bash
   npm run dev
   ```

2. **Backend running locally?**
   - Make sure `http://localhost:8000` is accessible
   - Or update `VITE_API_URL` in `.env.local` to production API

3. **Edit & save:**
   - Vite HMR automatically reloads browser
   - No manual refresh needed

4. **Check browser console:**
   - API errors logged with details
   - Custom error handling via `SessionExpiredError`

### Debugging Tips

```javascript
// Enable verbose logging
const LOG_LEVEL = "debug"; // or "info", "warn", "error"

// Log API responses
console.log("API Response:", response);

// Check localStorage
console.log(localStorage.getItem("bib-detector.admin-token"));

// React DevTools (install browser extension)
// Inspect component props, state, context
```

---

## ✅ Best Practices Implemented

### 1. **Component Design**
- ✅ Single Responsibility Principle
- ✅ Props validation (implicit via usage)
- ✅ Reusable UI components
- ✅ Container/Presentational pattern

### 2. **State Management**
- ✅ Context API for global state
- ✅ localStorage for persistence
- ✅ Minimal prop drilling
- ✅ Clear token lifecycle

### 3. **Performance**
- ✅ Route-based code splitting
- ✅ Image lazy loading
- ✅ Memoized components
- ✅ Optimized re-renders

### 4. **Styling**
- ✅ Utility-first Tailwind CSS
- ✅ Custom color tokens
- ✅ Responsive mobile-first
- ✅ Consistent spacing scale

### 5. **Error Handling**
```jsx
// Global error boundary (optional, enhance App.jsx)
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    console.error("Error caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong. Please reload.</div>;
    }
    return this.props.children;
  }
}
```

### 6. **Security**
- ✅ Tokens in localStorage (consider httpOnly cookies for v2)
- ✅ No hardcoded API keys
- ✅ Environment variable injection
- ✅ CORS handled by backend

### 7. **Accessibility (a11y)**
- ✅ Semantic HTML (buttons, links)
- ✅ ARIA labels where needed
- ✅ Keyboard navigation ready
- ✅ Color contrast compliance

---

## 🔄 API Integration

### detectionApi Service

Located in `src/services/detectionApi.js`:

```javascript
const BASE_URL = import.meta.env.VITE_API_URL;

export const detectionApi = {
  // Admin operations
  loginAdmin: (username, password) => fetch(...),
  getStats: (token) => fetch(...),
  getPhotos: (token, eventId) => fetch(...),
  deletePhoto: (token, photoId) => fetch(...),

  // Runner operations
  getEvents: () => fetch(...),
  requestClaim: (eventId, bibNumber, email) => fetch(...),
  verifyClaim: (claimToken) => fetch(...),
  getMyPhotos: (runnerToken) => fetch(...),
};

// Error handling
class SessionExpiredError extends Error {
  constructor() {
    super("Session expired. Please login again.");
    this.name = "SessionExpiredError";
  }
}
```

---

## 📦 Dependencies

### Core
- `react@19` — UI library
- `react-dom@19` — DOM rendering
- `react-router-dom@7` — Routing

### Styling
- `tailwindcss@4` — Utility CSS framework
- `postcss` — CSS transformation
- `autoprefixer` — Browser prefixes

### Dev Tools
- `vite@latest` — Build tool
- `eslint` — Code linting
- `@vitejs/plugin-react` — React optimizations

See `package.json` for complete list.

---

## 🤝 Contributing

### Workflow
1. **Fork & clone**
2. **Create feature branch:** `git checkout -b feat/feature-name`
3. **Make changes** (follow code style)
4. **Test locally:** `npm run dev`
5. **Commit:** `git commit -m "feat: add feature-name"`
6. **Push & open PR**

### Code Style
- Use **functional components** (no class components)
- Use **React hooks** for state & effects
- **ESLint** on commit (configure husky/lint-staged if needed)
- **Tailwind** for all styling (no custom CSS unless necessary)

---

## 📄 License

MIT License — See [LICENSE](LICENSE) for details.

---

## 📞 Support & Links

- **Live App:** https://bib-detector-frontend.vercel.app
- **Backend API:** https://bryanstrike-bib-detector.hf.space
- **Backend Repo:** https://github.com/BryanStrk/bib-detector-backend
- **Issues:** [GitHub Issues](https://github.com/BryanStrk/bib-detector-frontend/issues)

---

## 🎯 Roadmap

- [ ] TypeScript migration
- [ ] Advanced photo filters
- [ ] Social media sharing
- [ ] Multi-language support (i18n)
- [ ] PWA features (offline support)
- [ ] Analytics dashboard
- [ ] Email notifications on new photos

---

**Built with ❤️ by Bryan Paico Albines**  
*Modern, responsive, privacy-first race photo gallery.*
