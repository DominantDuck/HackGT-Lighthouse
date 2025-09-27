# Medication Monitoring App

A production-ready React Native app for between-visit medication monitoring, built with Expo and TypeScript.

## Features

### Patient Features
- **Medication Management**: Upload prescriptions via camera or gallery, review parsed details
- **Adherence Tracking**: View adherence percentages, log doses, track streaks
- **Check-ins**: Respond to care team messages with quick replies or custom responses
- **Reports**: Generate and view weekly adherence reports
- **Notifications**: Receive dose reminders and check-in notifications

### Caregiver/Clinician Features
- **Dashboard**: View KPIs, adherence trends, and risk distribution
- **Patient Management**: View patient roster, filter by risk level, send messages
- **Alert Management**: Review and respond to patient alerts
- **Reports**: Generate and view patient reports

### Technical Features
- **Offline-First**: Works offline with automatic sync when online
- **Role-Based Navigation**: Different interfaces for patients and caregivers
- **Accessibility**: VoiceOver/TalkBack support, dynamic type, high contrast
- **Theming**: Light/dark/system theme support
- **Testing**: Comprehensive test suite with Jest and MSW

## Tech Stack

- **Framework**: Expo SDK 50, React Native 0.73
- **Language**: TypeScript
- **Navigation**: React Navigation 6
- **State Management**: Zustand + TanStack Query
- **Forms**: Formik + Yup
- **Storage**: Expo SQLite + AsyncStorage
- **Authentication**: JWT with Expo SecureStore
- **Notifications**: Expo Notifications
- **Charts**: Victory Native
- **Testing**: Jest + React Native Testing Library + MSW

## Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI
- iOS Simulator or Android Emulator (for development)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd medication-monitoring-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env
# Edit .env with your API base URL
```

4. Start the development server:
```bash
npm start
```

### Environment Variables

Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_API_BASE_URL=https://your-api-url.com
EXPO_PUBLIC_BUILD_VARIANT=dev
```

## Project Structure

```
app/
├── components/          # Reusable UI components
├── features/           # Feature-specific screens and logic
│   ├── auth/          # Authentication
│   ├── prescriptions/ # Medication management
│   ├── adherence/     # Adherence tracking
│   ├── checkins/      # Check-in system
│   ├── alerts/        # Alert management
│   ├── reports/       # Report generation
│   ├── patients/      # Patient management
│   └── settings/      # App settings
├── hooks/             # Custom React hooks
├── navigation/        # Navigation setup
├── providers/        # Context providers
├── store/            # Zustand stores
└── utils/            # Utility functions

types/
└── api.d.ts          # TypeScript type definitions

tests/
├── __mocks__/        # Mock implementations
├── __tests__/        # Test files
└── setup.ts          # Test setup
```

## API Integration

The app integrates with a backend API with the following endpoints:

### Authentication
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user

### Prescriptions
- `POST /ingest/prescription` - Upload prescription image
- `GET /patients/{id}/prescriptions` - Get patient prescriptions

### Adherence
- `GET /adherence/{patient_id}` - Get adherence data
- `POST /sensors/event` - Log medication intake

### Check-ins
- `GET /patients/{id}/checkins` - Get check-ins
- `POST /checkins/{id}/respond` - Respond to check-in

### Alerts
- `GET /alerts/{patient_id}` - Get alerts
- `POST /alerts/{id}/review` - Mark alert as reviewed

### Reports
- `GET /patients/{id}/reports` - Get reports
- `POST /reports/weekly/{patient_id}` - Generate report

## Testing

### Unit Tests
```bash
npm test
```

### Test Coverage
```bash
npm run test:coverage
```

### E2E Testing
See `tests/e2e-notes.md` for end-to-end testing scenarios.

## Building for Production

### iOS
```bash
expo build:ios
```

### Android
```bash
expo build:android
```

## Accessibility

The app includes comprehensive accessibility features:

- **VoiceOver/TalkBack Support**: All interactive elements are properly labeled
- **Dynamic Type**: Supports system font scaling
- **High Contrast**: Toggle for better visibility
- **Haptic Feedback**: Optional vibration feedback
- **Reduced Motion**: Respects system accessibility preferences

## Offline Support

The app works offline with the following features:

- **Data Caching**: Critical data is cached locally
- **Sync Queue**: Actions are queued when offline and synced when online
- **Conflict Resolution**: Handles data conflicts gracefully
- **Background Sync**: Automatic sync when connectivity is restored

## Security

- **Secure Storage**: Sensitive data encrypted with Expo SecureStore
- **JWT Authentication**: Secure token-based authentication
- **API Security**: All API calls include authentication headers
- **Data Validation**: Input validation on all forms

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please contact the development team or create an issue in the repository.
