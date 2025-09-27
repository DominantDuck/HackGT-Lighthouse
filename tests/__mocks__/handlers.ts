import { http, HttpResponse } from 'msw';

const API_BASE_URL = 'http://localhost:3000/api';

// Mock API handlers
export const handlers = [
  // Auth endpoints
  http.post(`${API_BASE_URL}/auth/login`, () => {
    return HttpResponse.json({
      token: 'mock-jwt-token',
      user: {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'patient',
      },
    });
  }),

  http.get(`${API_BASE_URL}/auth/me`, () => {
    return HttpResponse.json({
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'patient',
    });
  }),

  // Prescription endpoints
  http.post(`${API_BASE_URL}/ingest/prescription`, () => {
    return HttpResponse.json({
      rx_id: 'rx-1',
      patient_id: 'user-1',
      drug_name: 'Mock Drug',
      strength: '10mg',
      dosage_form: 'tablet',
      directions_sig: 'Take once daily',
      schedule: [
        {
          time_window: '08:00',
          amount: 1,
          unit: 'pill',
          with_food: false,
        },
      ],
      start_date: '2024-01-01',
      end_date: null,
      prn: false,
      warnings: ['Take with food'],
      prescriber: 'Dr. Smith',
      pharmacy: 'CVS Pharmacy',
      refills_remaining: 3,
    });
  }),

  http.get(`${API_BASE_URL}/patients/:patientId/prescriptions`, () => {
    return HttpResponse.json([
      {
        rx_id: 'rx-1',
        patient_id: 'user-1',
        drug_name: 'Mock Drug',
        strength: '10mg',
        dosage_form: 'tablet',
        directions_sig: 'Take once daily',
        schedule: [
          {
            time_window: '08:00',
            amount: 1,
            unit: 'pill',
            with_food: false,
          },
        ],
        start_date: '2024-01-01',
        end_date: null,
        prn: false,
        warnings: ['Take with food'],
        prescriber: 'Dr. Smith',
        pharmacy: 'CVS Pharmacy',
        refills_remaining: 3,
      },
    ]);
  }),

  // Adherence endpoints
  http.get(`${API_BASE_URL}/adherence/:patientId`, () => {
    return HttpResponse.json({
      rx_id: 'rx-1',
      coverage_7d: 85.5,
      coverage_30d: 78.2,
      on_time_rate_7d: 90.0,
      missed_count_7d: 1,
      late_count_7d: 2,
      risk_score: 0.3,
      reasons: ['Missed morning dose'],
    });
  }),

  // Sensor events
  http.post(`${API_BASE_URL}/sensors/event`, () => {
    return HttpResponse.json({
      id: 'event-1',
      patient_id: 'user-1',
      rx_id: 'rx-1',
      timestamp: new Date().toISOString(),
      source: 'sensor',
      amount_taken: 1,
      success: true,
      notes: 'Detected via sensor',
    });
  }),

  // Check-ins
  http.get(`${API_BASE_URL}/patients/:patientId/checkins`, () => {
    return HttpResponse.json([
      {
        id: 'checkin-1',
        patient_id: 'user-1',
        timestamp: new Date().toISOString(),
        type: 'scheduled',
        prompt: 'How are you feeling today?',
        response: null,
        response_timestamp: null,
        status: 'pending',
      },
    ]);
  }),

  http.post(`${API_BASE_URL}/checkins/:checkInId/respond`, () => {
    return HttpResponse.json({
      id: 'checkin-1',
      patient_id: 'user-1',
      timestamp: new Date().toISOString(),
      type: 'scheduled',
      prompt: 'How are you feeling today?',
      response: 'Feeling good today',
      response_timestamp: new Date().toISOString(),
      status: 'completed',
    });
  }),

  // Alerts
  http.get(`${API_BASE_URL}/alerts/:patientId`, () => {
    return HttpResponse.json([
      {
        level: 'warn',
        type: 'repeated_miss',
        patient_id: 'user-1',
        rx_id: 'rx-1',
        summary: 'Missed 3 doses this week',
        recommended_action: 'Contact patient to discuss adherence',
      },
    ]);
  }),

  // Reports
  http.get(`${API_BASE_URL}/patients/:patientId/reports`, () => {
    return HttpResponse.json([
      {
        id: 'report-1',
        patient_id: 'user-1',
        week_start: '2024-01-01',
        week_end: '2024-01-07',
        url: 'https://example.com/reports/report-1.pdf',
        generated_at: new Date().toISOString(),
        summary: {
          adherence_rate: 85.5,
          missed_doses: 1,
          side_effects_reported: 0,
          risk_factors: ['Missed morning dose'],
        },
      },
    ]);
  }),

  http.post(`${API_BASE_URL}/reports/weekly/:patientId`, () => {
    return HttpResponse.json({
      id: 'report-1',
      patient_id: 'user-1',
      week_start: '2024-01-01',
      week_end: '2024-01-07',
      url: 'https://example.com/reports/report-1.pdf',
      generated_at: new Date().toISOString(),
      summary: {
        adherence_rate: 85.5,
        missed_doses: 1,
        side_effects_reported: 0,
        risk_factors: ['Missed morning dose'],
      },
    });
  }),

  // Patient endpoints
  http.get(`${API_BASE_URL}/patients/me`, () => {
    return HttpResponse.json({
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      phone: '+1234567890',
      avatar: null,
      risk_level: 'low',
      medication_count: 1,
      last_contact: new Date().toISOString(),
      active_prescriptions: [],
    });
  }),

  // Caregiver endpoints
  http.get(`${API_BASE_URL}/care/:caregiverId/patients`, () => {
    return HttpResponse.json([
      {
        id: 'user-1',
        name: 'Test Patient',
        email: 'patient@example.com',
        phone: '+1234567890',
        avatar: null,
        risk_level: 'low',
        medication_count: 1,
        last_contact: new Date().toISOString(),
        active_prescriptions: [],
      },
    ]);
  }),
];