# Development Setup

## Quick Start

1. **Start the Expo Development Server:**
   ```bash
   npm start
   ```
   This starts the React Native app on `http://localhost:8081`

2. **No Mock Server Needed!** 
   The app now uses Firebase for authentication and data storage.

## Data Storage

The app now uses **Firebase Firestore** as the primary data source:

- **🔥 Firebase Firestore**: Real-time database for all app data
- **🔐 Firebase Auth**: User authentication and session management
- **📱 Offline Support**: Data syncs when connection is restored
- **🚀 Production Ready**: Scalable cloud database

### Firebase Collections:
- `prescriptions/` - Patient medication data
- `adherence/` - Medication adherence tracking
- `checkins/` - Patient check-in responses
- `alerts/` - System alerts and notifications
- `reports/` - Generated weekly reports
- `intake_events/` - Medication intake logging

## Firebase Configuration

The app is configured to use Firebase with your Lighthouse project:
- **Project ID**: `lighthouse-hackgt`
- **Storage Bucket**: `lighthouse-hackgt.firebasestorage.app`
- **Auth Domain**: `lighthouse-hackgt.firebaseapp.com`

## Development Features

- ✅ **Firebase Authentication**: Sign in/up directly through Firebase
- ✅ **Firebase Integration**: Real-time cloud database
- ✅ **No Mock Server**: Everything runs through Firebase
- ✅ **Offline Support**: Data syncs when connection is restored
- ✅ **Hot Reload**: Instant updates during development
- ✅ **Cross-Platform**: Works on web, iOS, and Android
- ✅ **Type Safety**: Full TypeScript support
- ✅ **Testing**: Jest test suite included

## App Structure

The app has 4 main tabs (starts with Check-ins):
- **Check-ins** (Default): Patient communication and check-ins
- **Medications**: Manage prescriptions and medications
- **Reports**: View adherence reports and analytics
- **Settings**: App configuration and user settings

## Troubleshooting

If you encounter Firebase connection errors:
1. Check your Firebase configuration in `firebase.config.js`
2. Ensure Firebase services are enabled in the Firebase Console
3. Verify your API keys are correct
4. Check the Firebase Console for any error logs

## Firebase Console

Visit [Firebase Console](https://console.firebase.google.com/) to:
- View your data in real-time
- Monitor app usage
- Configure security rules
- Set up authentication
