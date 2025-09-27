export type UUID = string;

export type Dose = {
  time_window: string;      // "08:00" or "18:00@Wed"
  amount: number;
  unit: 'pill'|'mg'|'mL'|'units';
  with_food?: boolean | null;
};

export type RxStructured = {
  patient_id: UUID;
  rx_id: UUID;
  drug_name: string;
  strength: string;
  dosage_form: string;
  route?: string | null;
  quantity_in_bottle?: number | null;
  directions_sig: string;
  schedule: Dose[];
  start_date?: string | null;
  end_date?: string | null;
  prn: boolean;
  warnings: string[];
  prescriber?: string | null;
  pharmacy?: string | null;
  refills_remaining?: number | null;
};

export type IntakeEvent = {
  patient_id: UUID;
  rx_id: UUID;
  timestamp: string;
  source: 'sensor'|'self_report'|'caretaker';
  amount_taken?: number | null;
  success: boolean;
  notes?: string | null;
};

export type AdherenceStatus = {
  rx_id: UUID;
  coverage_7d: number;         // %
  coverage_30d: number;        // %
  on_time_rate_7d: number;     // %
  missed_count_7d: number;
  late_count_7d: number;
  risk_score: number;          // 0..1
  reasons: string[];
};

export type Alert = {
  level: 'info'|'warn'|'urgent';
  type: 'repeated_miss'|'overdose_risk'|'side_effect'|'dose_change_suspected';
  patient_id: UUID;
  rx_id?: UUID | null;
  summary: string;
  recommended_action: string;
};

// Additional types for the app
export type Role = 'patient' | 'care';

export type User = {
  id: UUID;
  role: Role;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  user: User;
};

export type Patient = {
  id: UUID;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  risk_level: 'low' | 'medium' | 'high';
  medication_count: number;
  last_contact?: string;
  active_prescriptions: RxStructured[];
};

export type Caregiver = {
  id: UUID;
  name: string;
  email: string;
  organization?: string;
  patients: Patient[];
};

export type CheckIn = {
  id: UUID;
  patient_id: UUID;
  timestamp: string;
  type: 'scheduled' | 'ad_hoc';
  prompt: string;
  response?: string;
  response_timestamp?: string;
  status: 'pending' | 'completed' | 'missed';
};

export type WeeklyReport = {
  id: UUID;
  patient_id: UUID;
  week_start: string;
  week_end: string;
  url: string;
  generated_at: string;
  summary: {
    adherence_rate: number;
    missed_doses: number;
    side_effects_reported: number;
    risk_factors: string[];
  };
};

export type NotificationPreferences = {
  dose_reminders: boolean;
  check_in_reminders: boolean;
  alert_notifications: boolean;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  push_enabled: boolean;
  email_enabled: boolean;
  sms_enabled: boolean;
};

export type AccessibilityPreferences = {
  font_scale: number;
  high_contrast: boolean;
  haptics_enabled: boolean;
  voice_over_enabled: boolean;
  reduced_motion: boolean;
};

export type Theme = 'light' | 'dark' | 'system';

export type AppSettings = {
  theme: Theme;
  notifications: NotificationPreferences;
  accessibility: AccessibilityPreferences;
  language: string;
  timezone: string;
};

// API Response types
export type ApiResponse<T> = {
  data: T;
  message?: string;
  success: boolean;
};

export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
};

// Error types
export type ApiError = {
  message: string;
  code: string;
  details?: Record<string, any>;
};

// Upload types
export type UploadProgress = {
  loaded: number;
  total: number;
  percentage: number;
};

export type UploadStatus = 'idle' | 'uploading' | 'processing' | 'completed' | 'error';

// Sync types
export type SyncItem = {
  id: UUID;
  type: 'intake_event' | 'check_in' | 'alert_response' | 'upload';
  data: Record<string, any>;
  timestamp: string;
  retry_count: number;
  max_retries: number;
};

export type SyncStatus = {
  is_online: boolean;
  pending_items: number;
  last_sync: string | null;
  sync_in_progress: boolean;
};
