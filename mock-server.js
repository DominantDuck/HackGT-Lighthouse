const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Mock data
const mockUsers = {
  'test@example.com': {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    role: 'patient',
    password: 'password123'
  }
};

// Auth endpoints
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (mockUsers[email] && mockUsers[email].password === password) {
    const user = { ...mockUsers[email] };
    delete user.password;
    
    res.json({
      token: 'mock-jwt-token-' + Date.now(),
      user: user
    });
  } else {
    res.status(401).json({
      message: 'Invalid credentials',
      code: 'INVALID_CREDENTIALS'
    });
  }
});

app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  res.json({
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    role: 'patient'
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mock prescription endpoints
app.post('/api/ingest/prescription', (req, res) => {
  res.json({
    rx_id: 'rx-' + Date.now(),
    patient_id: 'user-1',
    drug_name: 'Mock Drug',
    strength: '10mg',
    dosage_form: 'tablet',
    directions_sig: 'Take once daily',
    schedule: [{
      time_window: '08:00',
      amount: 1,
      unit: 'pill',
      with_food: false
    }],
    start_date: new Date().toISOString().split('T')[0],
    end_date: null,
    prn: false,
    warnings: ['Take with food'],
    prescriber: 'Dr. Smith',
    pharmacy: 'CVS Pharmacy',
    refills_remaining: 3
  });
});

app.get('/api/patients/:patientId/prescriptions', (req, res) => {
  res.json([{
    rx_id: 'rx-1',
    patient_id: req.params.patientId,
    drug_name: 'Mock Drug',
    strength: '10mg',
    dosage_form: 'tablet',
    directions_sig: 'Take once daily',
    schedule: [{
      time_window: '08:00',
      amount: 1,
      unit: 'pill',
      with_food: false
    }],
    start_date: new Date().toISOString().split('T')[0],
    end_date: null,
    prn: false,
    warnings: ['Take with food'],
    prescriber: 'Dr. Smith',
    pharmacy: 'CVS Pharmacy',
    refills_remaining: 3
  }]);
});

// Mock adherence endpoints
app.get('/api/adherence/:patientId', (req, res) => {
  res.json([{
    rx_id: 'rx-1',
    coverage_7d: 85.5,
    coverage_30d: 78.2,
    on_time_rate_7d: 90.0,
    missed_count_7d: 1,
    late_count_7d: 2,
    risk_score: 0.3,
    reasons: ['Missed morning dose']
  }]);
});

// Mock sensor events
app.post('/api/sensors/event', (req, res) => {
  res.json({
    id: 'event-' + Date.now(),
    patient_id: req.body.patient_id || 'user-1',
    rx_id: req.body.rx_id || 'rx-1',
    timestamp: new Date().toISOString(),
    source: 'sensor',
    amount_taken: 1,
    success: true,
    notes: 'Detected via sensor'
  });
});

// Mock check-ins
app.get('/api/patients/:patientId/checkins', (req, res) => {
  res.json([{
    id: 'checkin-1',
    patient_id: req.params.patientId,
    timestamp: new Date().toISOString(),
    type: 'scheduled',
    prompt: 'How are you feeling today?',
    response: null,
    response_timestamp: null,
    status: 'pending'
  }]);
});

app.post('/api/checkins/:checkInId/respond', (req, res) => {
  res.json({
    id: req.params.checkInId,
    patient_id: 'user-1',
    timestamp: new Date().toISOString(),
    type: 'scheduled',
    prompt: 'How are you feeling today?',
    response: req.body.response || 'Feeling good today',
    response_timestamp: new Date().toISOString(),
    status: 'completed'
  });
});

// Mock alerts
app.get('/api/alerts/:patientId', (req, res) => {
  res.json([{
    level: 'warn',
    type: 'repeated_miss',
    patient_id: req.params.patientId,
    rx_id: 'rx-1',
    summary: 'Missed 3 doses this week',
    recommended_action: 'Contact patient to discuss adherence'
  }]);
});

// Mock reports
app.get('/api/patients/:patientId/reports', (req, res) => {
  res.json([{
    id: 'report-1',
    patient_id: req.params.patientId,
    week_start: '2024-01-01',
    week_end: '2024-01-07',
    url: 'https://example.com/reports/report-1.pdf',
    generated_at: new Date().toISOString(),
    summary: {
      adherence_rate: 85.5,
      missed_doses: 1,
      side_effects_reported: 0,
      risk_factors: ['Missed morning dose']
    }
  }]);
});

app.post('/api/reports/weekly/:patientId', (req, res) => {
  res.json({
    id: 'report-' + Date.now(),
    patient_id: req.params.patientId,
    week_start: '2024-01-01',
    week_end: '2024-01-07',
    url: 'https://example.com/reports/report-' + Date.now() + '.pdf',
    generated_at: new Date().toISOString(),
    summary: {
      adherence_rate: 85.5,
      missed_doses: 1,
      side_effects_reported: 0,
      risk_factors: ['Missed morning dose']
    }
  });
});

// Mock patient endpoints
app.get('/api/patients/me', (req, res) => {
  res.json({
    id: 'user-1',
    name: 'Test User',
    email: 'test@example.com',
    phone: '+1234567890',
    avatar: null,
    risk_level: 'low',
    medication_count: 1,
    last_contact: new Date().toISOString(),
    active_prescriptions: []
  });
});

// Mock caregiver endpoints
app.get('/api/care/:caregiverId/patients', (req, res) => {
  res.json([{
    id: 'user-1',
    name: 'Test Patient',
    email: 'patient@example.com',
    phone: '+1234567890',
    avatar: null,
    risk_level: 'low',
    medication_count: 1,
    last_contact: new Date().toISOString(),
    active_prescriptions: []
  }]);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Mock API server running on http://localhost:${PORT}`);
  console.log(`📱 API Base URL: http://localhost:${PORT}/api`);
  console.log(`🔐 Test credentials: test@example.com / password123`);
});
