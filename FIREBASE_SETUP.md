# Firebase Setup Guide

## 🔥 Firebase Configuration for Lighthouse Project

### 1. Get Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your **lighthouse-hackgt** project
3. Go to **Project Settings** (gear icon)
4. Scroll down to **Your apps** section
5. Click **Add app** → **Web** (</>) 
6. Register your app with a name like "Medication Monitoring App"
7. Copy the configuration object

### 2. Update Firebase Configuration

Replace the placeholder values in `firebase.config.js`:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyB...", // From Firebase Console
  authDomain: "lighthouse-hackgt.firebaseapp.com",
  projectId: "lighthouse-hackgt",
  storageBucket: "lighthouse-hackgt.appspot.com", 
  messagingSenderId: "33371202765",
  appId: "1:33371202765:web:..." // From Firebase Console
};
```

### 3. Enable Firebase Services

#### Authentication
1. Go to **Authentication** → **Sign-in method**
2. Enable **Email/Password** provider
3. Optionally enable **Google** or other providers

#### Firestore Database
1. Go to **Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode** (for development)
4. Select a location (choose closest to your users)

#### Storage (Optional)
1. Go to **Storage**
2. Click **Get started**
3. Choose **Start in test mode**
4. Select a location

### 4. Security Rules (Development)

#### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to all documents for development
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

#### Storage Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

### 5. Update App Configuration

#### Replace Mock API with Firebase
Update your API calls to use Firebase instead of the mock server:

```typescript
// In your components, replace:
import { usePrescriptions } from './rx.api';

// With:
import { useFirebasePrescriptions } from './firebaseRx.api';
```

#### Update Authentication
Replace the existing auth provider with Firebase:

```typescript
// In App.tsx, wrap with FirebaseAuthProvider
import { FirebaseAuthProvider } from './app/providers/FirebaseAuthProvider';

export default function App() {
  return (
    <FirebaseAuthProvider>
      <QueryProvider>
        <ThemeProvider>
          <StatusBar style="auto" />
          <AppContent />
        </ThemeProvider>
      </QueryProvider>
    </FirebaseAuthProvider>
  );
}
```

### 6. Test Firebase Integration

1. Start your app: `npm start`
2. Try logging in with Firebase authentication
3. Check Firestore console to see data being created
4. Test offline functionality

### 7. Production Considerations

#### Security Rules (Production)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /prescriptions/{document} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.patient_id;
    }
    
    match /adherence/{document} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.patient_id;
    }
  }
}
```

#### Environment Variables
Create `.env` file:
```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=lighthouse-hackgt.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=lighthouse-hackgt
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=lighthouse-hackgt.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=33371202765
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## 🚀 Benefits of Firebase Integration

- ✅ **Real-time Database**: Firestore provides real-time updates
- ✅ **Offline Support**: Built-in offline capabilities
- ✅ **Authentication**: Secure user management
- ✅ **Scalability**: Handles millions of users
- ✅ **Security**: Built-in security rules
- ✅ **Analytics**: User behavior tracking
- ✅ **Storage**: File upload capabilities

## 📱 Next Steps

1. Complete Firebase configuration
2. Test authentication flow
3. Migrate data from mock server
4. Implement real-time features
5. Add push notifications
6. Deploy to production
