# Property Management System

A comprehensive web application for managing rental properties, tracking rent payments, and monitoring tenant information. Built with React, Firebase, and Material-UI with **direct Firebase integration** - no backend required!

## Features

- 🏠 **Property Management**: Add, edit, and manage your rental properties
- 💰 **Rent Tracking**: Track monthly rent amounts and lease agreements  
- 📊 **Payment Monitoring**: Record and monitor rent payments with detailed history
- 👤 **User Authentication**: Secure login with Firebase Authentication (Email/Password and Google)
- 📈 **Dashboard Analytics**: Overview of collection rates, recent payments, and property statistics
- 📱 **Responsive Design**: Mobile-friendly interface built with Material-UI
- 🔥 **Real-time Updates**: Live data synchronization using Firebase Firestore
- 🚀 **No Backend Required**: Direct Firebase integration eliminates server complexity

## Tech Stack

### Frontend
- **React** - UI framework
- **Vite** - Build tool and development server
- **Material-UI (MUI)** - Component library and design system
- **React Router** - Client-side routing
- **React Query** - Data fetching and caching
- **React Hook Form** - Form management
- **Firebase SDK** - Authentication and Firestore database

### Database & Authentication
- **Firebase Firestore** - NoSQL document database with real-time updates
- **Firebase Authentication** - User authentication and authorization
- **Firestore Security Rules** - Client-side access control

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- Yarn package manager
- Firebase project with Firestore and Authentication enabled

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Elisa149/PROPERTY-MANAGEMENT-SYSTEM.git
   cd PROPERTY-MANAGEMENT-SYSTEM
   ```

2. **Install dependencies**
   ```bash
   yarn setup
   ```

3. **Firebase Configuration**
   
   Create a Firebase project at [Firebase Console](https://console.firebase.google.com):
   - Enable Firestore Database
   - Enable Authentication (Email/Password and Google providers)
   - Register a web app and get the configuration
   
   **Environment Configuration:**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your Firebase web app config:
   ```env
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
   ```

4. **Add Firestore Security Rules**
   
   In Firebase Console → Firestore Database → Rules, add:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
       match /properties/{propertyId} {
         allow read, write: if request.auth != null && 
           (resource == null || resource.data.userId == request.auth.uid);
         allow create: if request.auth != null && 
           request.resource.data.userId == request.auth.uid;
       }
       match /rent/{rentId} {
         allow read, write: if request.auth != null &&
           (resource == null || resource.data.userId == request.auth.uid);
         allow create: if request.auth != null &&
           request.resource.data.userId == request.auth.uid;
       }
       match /payments/{paymentId} {
         allow read, write: if request.auth != null &&
           (resource == null || resource.data.userId == request.auth.uid);
         allow create: if request.auth != null &&
           request.resource.data.userId == request.auth.uid;
       }
       match /tenants/{tenantId} {
         allow read, write: if request.auth != null &&
           (resource == null || resource.data.userId == request.auth.uid);
         allow create: if request.auth != null &&
           request.resource.data.userId == request.auth.uid;
       }
     }
   }
   ```

5. **Start the development server**
   ```bash
   yarn dev
   ```

6. **Open your browser**
   - Frontend: http://localhost:5173
   - Test Firebase integration: http://localhost:5173/app/firebase-example

## Project Structure

```
property-management-system/
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── common/         # Common components
│   │   └── Layout/         # Layout components
│   ├── contexts/           # React context providers
│   ├── pages/              # Main application pages
│   │   ├── admin/          # Admin pages
│   │   └── auth/           # Authentication pages
│   ├── services/           # Firebase service layer
│   ├── config/             # Firebase configuration
│   ├── App.jsx             # Root component
│   ├── main.jsx            # Application entry point
│   └── index.css           # Global styles
├── public/                 # Static assets (images, fonts, etc.)
├── docs/                   # Documentation files
├── index.html              # HTML entry point
├── package.json            # Dependencies and scripts
├── vite.config.js          # Vite configuration
├── env.example             # Environment variables template
└── README.md               # This file
```

## Firebase Services

### Available Services
- `propertyService` - Property CRUD operations
- `paymentService` - Payment tracking and management
- `rentService` - Rent agreement management
- `tenantService` - Tenant information management
- `userService` - User profile management
- `realtimeService` - Real-time data subscriptions

### Usage Examples

```javascript
import { propertyService, realtimeService } from './services/firebaseService';

// Create a property
await propertyService.create({
  name: 'My Property',
  type: 'building',
  location: { village: 'Kampala', district: 'Central' },
  caretakerName: 'John Doe',
  caretakerPhone: '+256123456789',
  ownershipType: 'owned'
}, user.uid);

// Real-time subscription
const unsubscribe = realtimeService.subscribeToProperties(
  user.uid,
  (properties) => setProperties(properties)
);

// Record payment
await paymentService.create({
  propertyId: 'property-id',
  amount: 500,
  paymentDate: new Date(),
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
  paymentMethod: 'cash'
}, user.uid);
```

## Development

### Available Scripts

```bash
# Install all dependencies
yarn setup

# Start development server
yarn dev

# Build for production
yarn build

# Preview production build
yarn preview

# Run linting
yarn lint
```

### Environment Variables

**Frontend (.env):**
- `VITE_FIREBASE_API_KEY` - Firebase web app API key
- `VITE_FIREBASE_AUTH_DOMAIN` - Firebase auth domain
- `VITE_FIREBASE_PROJECT_ID` - Firebase project ID
- `VITE_FIREBASE_STORAGE_BUCKET` - Firebase storage bucket
- `VITE_FIREBASE_MESSAGING_SENDER_ID` - Firebase messaging sender ID
- `VITE_FIREBASE_APP_ID` - Firebase web app ID
- `VITE_FIREBASE_MEASUREMENT_ID` - Firebase Analytics ID (optional)

## Key Benefits

### 🚀 **Simplified Architecture**
- No backend server to maintain or deploy
- Direct Firebase integration reduces complexity
- Single codebase for frontend

### ⚡ **Real-time Updates**
- Live data synchronization across all clients
- Instant updates when data changes
- No need to refresh pages

### 🔒 **Secure by Default**
- Firestore security rules handle access control
- User data isolation built-in
- Authentication required for all operations

### 💰 **Cost Effective**
- No server hosting costs
- Firebase free tier covers most use cases
- Pay only for what you use

### 📱 **Offline Support**
- Firebase provides offline capabilities
- Data syncs when connection is restored
- Works seamlessly across devices

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions:

1. Check the [Issues](../../issues) page
2. Create a new issue if your problem isn't already reported
3. Provide detailed information about your environment and the issue

## Documentation

- [Complete Firebase Setup Guide](docs/FIREBASE_DIRECT_SETUP.md) - Detailed setup instructions
- [Firebase Security Rules](docs/firestore-direct-access.rules) - Security configuration
- [RBAC System Design](docs/RBAC_SYSTEM_DESIGN.md) - Role-based access control documentation
- [Environment Template](env.example) - Environment variables template

---

**Happy Property Managing! 🏠💼**

Built with ❤️ using React, Firebase, and Material-UI
