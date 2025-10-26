# Project Structure - Standard React Application

This document describes the reorganized project structure following standard React/Vite conventions.

## 📁 Directory Structure

```
property-management-system/
├── src/                    # Source code
│   ├── components/         # React components
│   │   ├── common/         # Shared components
│   │   │   └── LoadingSpinner.jsx
│   │   ├── Layout/         # Layout components
│   │   │   ├── Layout.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── PaymentReceipt.jsx
│   │   ├── PendingApproval.jsx
│   │   ├── PropertySelectorDialog.jsx
│   │   ├── RoleAssignment.jsx
│   │   ├── RoleGuard.jsx
│   │   ├── SpaceManagement.jsx
│   │   └── SquatterManagement.jsx
│   ├── contexts/           # React Context providers
│   │   └── AuthContext.jsx
│   ├── pages/              # Page components
│   │   ├── admin/          # Admin pages
│   │   │   ├── AdminDashboardPage.jsx
│   │   │   ├── AnalyticsPage.jsx
│   │   │   ├── OrganizationSettingsPage.jsx
│   │   │   └── PropertyAssignmentPage.jsx
│   │   ├── auth/           # Authentication pages
│   │   │   ├── LoginPage.jsx
│   │   │   └── RegisterPage.jsx
│   │   ├── AllSpacesPage.jsx
│   │   ├── CreatePropertyPage.jsx
│   │   ├── Dashboard.jsx
│   │   ├── FirebaseDirectExample.jsx
│   │   ├── PaymentsPage.jsx
│   │   ├── ProfilePage.jsx
│   │   ├── PropertiesOverviewPage.jsx
│   │   ├── PropertiesPage.jsx
│   │   ├── PropertyDetailsPage.jsx
│   │   ├── RentPage.jsx
│   │   ├── SimpleCreatePropertyPage.jsx
│   │   ├── SpaceAssignmentPage.jsx
│   │   ├── TenantsPage.jsx
│   │   └── UserManagementPage.jsx
│   ├── services/           # Service layer
│   │   ├── api.js          # Legacy API (not used)
│   │   └── firebaseService.js  # Direct Firebase operations
│   ├── config/             # Configuration
│   │   └── firebase.js     # Firebase configuration
│   ├── App.jsx             # Root component
│   ├── main.jsx            # Application entry point
│   └── index.css           # Global styles
├── public/                 # Static assets (images, fonts, etc.)
├── index.html              # HTML entry point (Vite requirement)
├── docs/                   # Documentation
│   ├── FIREBASE_DIRECT_SETUP.md
│   ├── RBAC_SYSTEM_DESIGN.md
│   ├── firestore-direct-access.rules
│   └── ... (other documentation files)
├── node_modules/           # Dependencies (gitignored)
├── .gitignore              # Git ignore rules
├── env.example             # Environment variables template
├── package.json            # Project dependencies and scripts
├── vite.config.js          # Vite configuration
├── yarn.lock               # Yarn lock file
└── README.md               # Project documentation
```

## 🎯 Key Changes from Previous Structure

### Before (Monorepo with Backend)
```
property-management-system/
├── backend/                # ❌ Removed
│   └── ...
├── frontend/               # ❌ Removed wrapper
│   ├── src/
│   └── ...
└── package.json
```

### After (Standard React App)
```
property-management-system/
├── src/                    # ✅ At root level
├── public/                 # ✅ At root level
├── docs/                   # ✅ Organized documentation
└── package.json            # ✅ Single package.json
```

## 📝 Configuration Files

### package.json
- **Location**: Root directory
- **Purpose**: Manages all dependencies and scripts
- **Key Scripts**:
  - `yarn dev` - Start development server
  - `yarn build` - Build for production
  - `yarn preview` - Preview production build
  - `yarn lint` - Run ESLint

### vite.config.js
- **Location**: Root directory
- **Purpose**: Vite build tool configuration
- **Port**: 5173 (standard Vite port)

### env.example
- **Location**: Root directory
- **Purpose**: Template for environment variables
- **Usage**: Copy to `.env` and fill in Firebase credentials

### .gitignore
- **Location**: Root directory
- **Purpose**: Specifies files to ignore in git
- **Ignores**: node_modules, .env, dist, build outputs

## 🔥 Firebase Integration

All Firebase operations are handled client-side through:
- **Configuration**: `src/config/firebase.js`
- **Services**: `src/services/firebaseService.js`
- **Context**: `src/contexts/AuthContext.jsx`

No backend server required!

## 🚀 Getting Started

1. **Install dependencies**:
   ```bash
   yarn install
   ```

2. **Set up environment**:
   ```bash
   cp env.example .env
   # Edit .env with your Firebase credentials
   ```

3. **Start development**:
   ```bash
   yarn dev
   ```

4. **Open browser**:
   ```
   http://localhost:5173
   ```

## 📚 Documentation

All documentation has been moved to the `docs/` folder:
- Setup guides
- Feature documentation
- Firebase security rules
- RBAC system design
- Integration guides

## ✨ Benefits of New Structure

1. **Standard Convention**: Follows React/Vite best practices
2. **Simplified**: Single package.json, no monorepo complexity
3. **Clean**: Documentation organized in separate folder
4. **Maintainable**: Clear separation of concerns
5. **Scalable**: Easy to add new features and components

## 🔧 Development Workflow

1. **Add new component**: Create in `src/components/`
2. **Add new page**: Create in `src/pages/`
3. **Add new service**: Add to `src/services/`
4. **Update docs**: Add to `docs/` folder
5. **Test**: Run `yarn dev` and test in browser

## 📦 Build & Deploy

```bash
# Build for production
yarn build

# Preview production build
yarn preview

# Deploy to hosting (Vercel, Netlify, etc.)
# Just point to the root directory
```

---

**This structure provides a clean, standard React application ready for development and deployment!** 🎉
