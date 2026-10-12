export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  preferred_language: string;
  timezone: string;
  theme: string;
  measurement_units: string;
  notification_preferences?: {
    email?: boolean;
    browser?: boolean;
    watering?: boolean;
    fertilizing?: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface PlantCarePreferences {
  light?: string;
  watering_frequency_days?: number;
  fertilizing_frequency_days?: number;
  soil?: string;
  humidity?: string;
  toxicity?: string;
  ideal_temp?: string;
}

export interface Plant {
  id: string;
  user_id: string;
  common_name: string;
  scientific_name?: string;
  category: string;
  photo_url?: string;
  location?: string;
  environment: string;
  date_added: string;
  health_status: 'healthy' | 'needs_attention' | 'recovering' | 'diseased';
  care_preferences?: PlantCarePreferences;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CareReminder {
  id: string;
  user_id: string;
  plant_id: string;
  task_type: 'watering' | 'fertilizing' | 'pruning' | 'repotting' | 'pest_inspection' | 'harvesting' | 'custom';
  title: string;
  due_at: string;
  repeat_rule: string;
  repeat_days: number;
  notes?: string;
  status: 'pending' | 'completed' | 'overdue' | 'snoozed';
  plant_name?: string;
  plant_photo?: string;
  created_at: string;
  updated_at: string;
}

export interface CareLog {
  id: string;
  user_id: string;
  plant_id: string;
  reminder_id?: string;
  action_type: string;
  notes?: string;
  measurement_value?: number;
  measurement_unit?: string;
  completed_at: string;
}

export interface GrowthRecord {
  id: string;
  user_id: string;
  plant_id: string;
  height?: number;
  measurement_unit: string;
  leaf_count?: number;
  health_status: string;
  photo_url?: string;
  observation?: string;
  recorded_at: string;
}

export interface IdentificationCandidate {
  common_name: string;
  scientific_name: string;
  family?: string;
  confidence: number;
  description: string;
  light: string;
  water: string;
  soil: string;
  humidity?: string;
  pet_toxicity?: string;
  propagation?: string;
  common_problems?: string[];
  care_tips?: string[];
}

export interface IdentificationResponse {
  id: string;
  image_url: string;
  confidence: number;
  provider: string;
  primary_candidate: IdentificationCandidate;
  alternative_candidates: IdentificationCandidate[];
  created_at: string;
}

export interface ConditionDetail {
  name: string;
  confidence: number;
  severity: 'Low' | 'Moderate' | 'High' | 'Severe';
  description: string;
  contributing_factors: string[];
}

export interface DiagnosisResponse {
  id: string;
  image_url: string;
  confidence: number;
  provider: string;
  observed_symptoms: string[];
  possible_conditions: ConditionDetail[];
  recommendations: {
    immediate_actions?: string[];
    cultural_controls?: string[];
    organic_remedies?: string[];
    isolation_needed?: boolean;
    expert_consultation?: string;
  };
  isolation_needed: boolean;
  user_context?: Record<string, any>;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  suggested_actions?: string[];
  created_at: string;
}

export interface ChatConversation {
  id: string;
  user_id: string;
  plant_id?: string;
  title: string;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  plant_id?: string;
  reminder_id?: string;
  title: string;
  message: string;
  notification_type: 'care_due' | 'care_overdue' | 'health_alert' | 'system';
  read_at?: string;
  created_at: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  category: string;
  image_url?: string;
  summary: string;
  content: string;
  difficulty: 'Easy' | 'Medium' | 'Advanced';
  light_req?: string;
  water_req?: string;
  common_problems?: { issue: string; fix: string }[];
  step_by_step?: string[];
  attribution?: string;
  created_at: string;
}

export interface DashboardStats {
  total_plants: number;
  plants_needing_attention: number;
  upcoming_tasks_count: number;
  completed_tasks_this_week: number;
  health_distribution: Record<string, number>;
  today_tasks: CareReminder[];
  recent_diagnoses: DiagnosisResponse[];
  seasonal_tip: {
    season: string;
    title: string;
    tip: string;
  };
}

export interface CalendarEvent {
  id: string;
  reminder_id?: string;
  type: 'reminder' | 'completed_log';
  task_type: string;
  title: string;
  date: string;
  status: string;
  plant_id: string;
  plant_name: string;
  notes?: string;
}
