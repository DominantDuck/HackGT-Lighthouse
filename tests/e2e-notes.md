# End-to-End Testing Notes

## Test Scenarios

### Patient Flow
1. **Login as Patient**
   - Enter valid credentials
   - Verify navigation to patient home screen
   - Check that patient tabs are visible

2. **Upload Prescription**
   - Navigate to Medications tab
   - Tap "Add New Prescription"
   - Select image from gallery or take photo
   - Verify image processing and upload
   - Review parsed prescription details
   - Confirm and save prescription

3. **Log Medication Dose**
   - Go to Home screen
   - Find next scheduled dose
   - Tap "Taken" button
   - Verify dose is logged successfully
   - Check adherence percentage updates

4. **Respond to Check-in**
   - Navigate to Check-ins tab
   - Find pending check-in message
   - Use quick reply or compose custom response
   - Verify response is sent
   - Check status updates to "completed"

5. **Generate Report**
   - Go to Reports tab
   - Tap "Generate Weekly Report"
   - Wait for report generation
   - View generated report
   - Test share functionality

### Caregiver Flow
1. **Login as Caregiver**
   - Enter caregiver credentials
   - Verify navigation to dashboard
   - Check that caregiver tabs are visible

2. **View Dashboard**
   - Verify KPI cards display correctly
   - Check adherence trend chart
   - Review risk distribution
   - Check recent alerts section

3. **Manage Patients**
   - Navigate to Patients tab
   - Search for specific patient
   - Filter by risk level
   - View patient details
   - Send message to patient

4. **Handle Alerts**
   - Go to Alerts tab
   - Review alert details
   - Mark alert as reviewed
   - Escalate urgent alerts
   - Dismiss resolved alerts

## Test Data Setup

### Mock Prescriptions
```json
{
  "levothyroxine": {
    "drug_name": "Levothyroxine",
    "strength": "50mcg",
    "schedule": [{"time_window": "08:00", "amount": 1, "unit": "pill"}]
  },
  "warfarin": {
    "drug_name": "Warfarin",
    "strength": "5mg",
    "schedule": [
      {"time_window": "08:00", "amount": 1, "unit": "pill"},
      {"time_window": "20:00", "amount": 1, "unit": "pill"}
    ]
  }
}
```

### Mock Alerts
```json
{
  "repeated_miss": {
    "level": "warn",
    "type": "repeated_miss",
    "summary": "Patient has missed 3 doses this week"
  },
  "overdose_risk": {
    "level": "urgent",
    "type": "overdose_risk",
    "summary": "Potential overdose detected"
  }
}
```

## Accessibility Testing

### VoiceOver (iOS)
- Navigate through all screens using VoiceOver
- Verify all interactive elements are accessible
- Check that labels are descriptive
- Test gesture navigation

### TalkBack (Android)
- Similar to VoiceOver testing
- Verify focus management
- Test screen reader navigation

### Dynamic Type
- Test with largest text size
- Verify text doesn't get cut off
- Check that layouts remain usable

## Performance Testing

### Load Testing
- Test with large number of medications
- Verify smooth scrolling in lists
- Check memory usage during extended use

### Network Testing
- Test offline functionality
- Verify sync when back online
- Test with poor network conditions

## Device Testing

### iOS Devices
- iPhone SE (small screen)
- iPhone 14 Pro (standard screen)
- iPhone 14 Pro Max (large screen)
- iPad (tablet layout)

### Android Devices
- Various screen sizes
- Different Android versions
- Different manufacturers

## Security Testing

### Data Protection
- Verify sensitive data is encrypted
- Test secure storage functionality
- Check token expiration handling

### Authentication
- Test session timeout
- Verify logout functionality
- Check token refresh mechanism
