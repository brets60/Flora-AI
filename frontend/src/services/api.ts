import {
  User,
  Plant,
  CareReminder,
  CareLog,
  GrowthRecord,
  IdentificationResponse,
  DiagnosisResponse,
  ChatMessage,
  ChatConversation,
  NotificationItem,
  Article,
  DashboardStats,
  CalendarEvent
} from '../types';

const getApiBase = () => {
  if (import.meta.env.VITE_API_URL) {
    return `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`;
  }
  if (typeof window !== 'undefined' && window.location.origin && window.location.origin.startsWith('file:')) {
    return 'https://flora-ai-beta.vercel.app/api';
  }
  return '/api';
};

const API_BASE = getApiBase();

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('flora_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Built-in Botanical Mock Data for Offline & Demo Resilience
const MOCK_DEMO_USER: User = {
  id: 'user-demo-001',
  full_name: 'Dr. Flora Botanist',
  email: 'demo@floraai.com',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  preferred_language: 'en',
  timezone: 'UTC',
  theme: 'light',
  measurement_units: 'metric',
  notification_preferences: { browser: true, watering: true, fertilizing: true },
  created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  updated_at: new Date().toISOString(),
};

const MOCK_PLANTS: Plant[] = [
  {
    id: 'plant-001',
    user_id: 'user-demo-001',
    common_name: 'Monstera Deliciosa (Swiss Cheese Plant)',
    scientific_name: 'Monstera deliciosa',
    category: 'Indoor',
    photo_url: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=800&q=80',
    location: 'Living Room Corner',
    environment: 'indoor',
    health_status: 'healthy',
    care_preferences: {
      light: 'Bright indirect',
      watering_frequency_days: 7,
      fertilizing_frequency_days: 30,
      soil: 'Chunky aroid mix',
      humidity: '60%',
      toxicity: 'Toxic to pets'
    },
    notes: 'Growing 2 new leaves with lovely fenestrations!',
    date_added: new Date(Date.now() - 20 * 86400000).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'plant-002',
    user_id: 'user-demo-001',
    common_name: 'Snake Plant Laurentii',
    scientific_name: 'Dracaena trifasciata',
    category: 'Succulent',
    photo_url: 'https://images.unsplash.com/photo-1593482892290-f54927ae1bb6?auto=format&fit=crop&w=800&q=80',
    location: 'Bedroom Shelf',
    environment: 'indoor',
    health_status: 'healthy',
    care_preferences: {
      light: 'Low to bright indirect',
      watering_frequency_days: 18,
      fertilizing_frequency_days: 60,
      soil: 'Gritty cactus mix',
      humidity: '40%',
      toxicity: 'Mildly toxic'
    },
    notes: 'Thriving on minimal watering.',
    date_added: new Date(Date.now() - 15 * 86400000).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'plant-003',
    user_id: 'user-demo-001',
    common_name: 'Sweet Genovese Basil',
    scientific_name: 'Ocimum basilicum',
    category: 'Herb',
    photo_url: 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?auto=format&fit=crop&w=800&q=80',
    location: 'Kitchen Windowsill',
    environment: 'indoor',
    health_status: 'needs_attention',
    care_preferences: {
      light: 'Full direct sunlight',
      watering_frequency_days: 3,
      fertilizing_frequency_days: 14,
      soil: 'Rich organic loam',
      humidity: '50%',
      toxicity: 'Safe for pets'
    },
    notes: 'A bit thirsty, pinch flower buds to maintain bushy growth.',
    date_added: new Date(Date.now() - 10 * 86400000).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  }
];

const MOCK_REMINDERS: CareReminder[] = [
  {
    id: 'rem-001',
    user_id: 'user-demo-001',
    plant_id: 'plant-001',
    plant_name: 'Monstera Deliciosa (Swiss Cheese Plant)',
    task_type: 'watering',
    title: 'Water Monstera Deliciosa',
    due_at: new Date(Date.now() + 3 * 3600000).toISOString(),
    repeat_rule: 'weekly',
    repeat_days: 7,
    notes: 'Check top 2 inches of soil first',
    status: 'pending',
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'rem-002',
    user_id: 'user-demo-001',
    plant_id: 'plant-003',
    plant_name: 'Sweet Genovese Basil',
    task_type: 'watering',
    title: 'Water Basil & Check Leaves',
    due_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    repeat_rule: 'every_3_days',
    repeat_days: 3,
    notes: 'Soil dry to touch',
    status: 'overdue',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'rem-003',
    user_id: 'user-demo-001',
    plant_id: 'plant-001',
    plant_name: 'Monstera Deliciosa (Swiss Cheese Plant)',
    task_type: 'fertilizing',
    title: 'Diluted Organic Liquid Feed',
    due_at: new Date(Date.now() + 48 * 3600000).toISOString(),
    repeat_rule: 'monthly',
    repeat_days: 30,
    notes: 'Half strength balanced nitrogen-potassium fertilizer',
    status: 'pending',
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  }
];

const MOCK_STATS: DashboardStats = {
  total_plants: 3,
  plants_needing_attention: 1,
  upcoming_tasks_count: 2,
  completed_tasks_this_week: 4,
  health_distribution: {
    healthy: 2,
    needs_attention: 1,
    recovering: 0,
    diseased: 0,
  },
  today_tasks: MOCK_REMINDERS,
  recent_diagnoses: [],
  seasonal_tip: {
    season: 'Spring / Summer',
    title: 'Hydration & Aeration',
    tip: 'Check top 2 inches of soil before watering. Ensure drainage trays are emptied regularly.'
  }
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    ...getAuthHeader(),
    ...(options.headers || {}),
  } as Record<string, string>;

  // Only set Content-Type to application/json if body is not FormData
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMsg = 'An error occurred';
      try {
        const errorData = await response.json();
        errorMsg = errorData.detail || errorData.message || response.statusText;
      } catch {
        errorMsg = response.statusText;
      }
      throw new ApiError(errorMsg, response.status);
    }

    // Handle empty responses
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return (await response.json()) as T;
    }
    return {} as T;
  } catch (err: any) {
    const token = localStorage.getItem('flora_token');
    const isDemo = token && (token.includes('demo') || token === 'flora-demo-offline-jwt-token-2026');

    // Offline / Demo fallbacks for key query routes
    if (isDemo || (typeof navigator !== 'undefined' && !navigator.onLine)) {
      if (endpoint === '/auth/me') return MOCK_DEMO_USER as unknown as T;
      if (endpoint.startsWith('/dashboard/stats')) return MOCK_STATS as unknown as T;
      if (endpoint.startsWith('/plants') && options.method !== 'POST') return MOCK_PLANTS as unknown as T;
      if (endpoint.startsWith('/reminders') && options.method !== 'POST') return MOCK_REMINDERS as unknown as T;
      if (endpoint.startsWith('/notifications') && options.method !== 'POST') return [] as unknown as T;
      if (endpoint.startsWith('/calendar/events')) {
        return MOCK_REMINDERS.map(r => ({
          id: r.id,
          title: r.title,
          date: r.due_at.split('T')[0],
          task_type: r.task_type,
          plant_id: r.plant_id,
          plant_name: r.plant_name,
          status: r.status,
        })) as unknown as T;
      }
    }
    throw err;
  }
}

export const api = {
  // --- Auth & User ---
  async register(data: { full_name: string; email: string; password: string; terms_accepted: boolean }) {
    return request<{ access_token: string; token_type: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async login(data: { email: string; password: string }) {
    return request<{ access_token: string; token_type: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getMe(): Promise<User> {
    return request<User>('/auth/me');
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    return request<User>('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async changePassword(old_password: string, new_password: string) {
    return request<{ message: string }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ old_password, new_password }),
    });
  },

  async deleteAccount() {
    return request<{ message: string }>('/auth/delete-account', {
      method: 'DELETE',
    });
  },

  async exportUserData() {
    return request<any>('/auth/export-data');
  },

  // --- Plants ---
  async getPlants(params?: { search?: string; category?: string; health_status?: string }): Promise<Plant[]> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.category) query.append('category', params.category);
    if (params?.health_status) query.append('health_status', params.health_status);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request<Plant[]>(`/plants${queryString}`);
  },

  async getPlant(id: string): Promise<Plant> {
    return request<Plant>(`/plants/${id}`);
  },

  async createPlant(data: Partial<Plant>): Promise<Plant> {
    return request<Plant>('/plants', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updatePlant(id: string, data: Partial<Plant>): Promise<Plant> {
    return request<Plant>(`/plants/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async deletePlant(id: string): Promise<{ message: string }> {
    return request<{ message: string }>(`/plants/${id}`, {
      method: 'DELETE',
    });
  },

  async uploadPlantPhoto(id: string, file: File): Promise<Plant> {
    const formData = new FormData();
    formData.append('file', file);
    return request<Plant>(`/plants/${id}/photo`, {
      method: 'POST',
      body: formData,
    });
  },

  async getPlantCareLogs(plantId: string): Promise<CareLog[]> {
    return request<CareLog[]>(`/plants/${plantId}/care-logs`);
  },

  async addPlantCareLog(plantId: string, data: { action_type: string; notes?: string; measurement_value?: number; measurement_unit?: string }): Promise<CareLog> {
    return request<CareLog>(`/plants/${plantId}/care-logs`, {
      method: 'POST',
      body: JSON.stringify({ plant_id: plantId, ...data }),
    });
  },

  // --- Plant Identification ---
  async identifyPlant(file: File, plantId?: string): Promise<IdentificationResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (plantId) formData.append('plant_id', plantId);
    return request<IdentificationResponse>('/identify', {
      method: 'POST',
      body: formData,
    });
  },

  async getIdentifications(): Promise<IdentificationResponse[]> {
    return request<IdentificationResponse[]>('/identify');
  },

  // --- Disease Diagnosis ---
  async diagnoseDisease(file: File, context?: {
    plant_id?: string;
    plant_species?: string;
    plant_age?: string;
    environment?: string;
    watering_frequency?: string;
    sunlight_exposure?: string;
    fertilizer_usage?: string;
    symptoms_description?: string;
  }): Promise<DiagnosisResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (context) {
      Object.entries(context).forEach(([k, v]) => {
        if (v) formData.append(k, v);
      });
    }
    return request<DiagnosisResponse>('/diagnose', {
      method: 'POST',
      body: formData,
    });
  },

  async getDiagnoses(): Promise<DiagnosisResponse[]> {
    return request<DiagnosisResponse[]>('/diagnose');
  },

  // --- Reminders ---
  async getReminders(params?: { status?: string; plant_id?: string; task_type?: string }): Promise<CareReminder[]> {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.plant_id) query.append('plant_id', params.plant_id);
    if (params?.task_type) query.append('task_type', params.task_type);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request<CareReminder[]>(`/reminders${queryString}`);
  },

  async createReminder(data: {
    plant_id: string;
    task_type: string;
    title: string;
    due_at: string;
    repeat_rule?: string;
    repeat_days?: number;
    notes?: string;
  }): Promise<CareReminder> {
    return request<CareReminder>('/reminders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateReminder(id: string, data: Partial<CareReminder>): Promise<CareReminder> {
    return request<CareReminder>(`/reminders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async completeReminder(id: string, notes?: string): Promise<CareReminder> {
    const query = notes ? `?notes=${encodeURIComponent(notes)}` : '';
    return request<CareReminder>(`/reminders/${id}/complete${query}`, {
      method: 'POST',
    });
  },

  async snoozeReminder(id: string, days: number = 1): Promise<CareReminder> {
    return request<CareReminder>(`/reminders/${id}/snooze?days=${days}`, {
      method: 'POST',
    });
  },

  async deleteReminder(id: string): Promise<{ message: string }> {
    return request<{ message: string }>(`/reminders/${id}`, {
      method: 'DELETE',
    });
  },

  // --- Growth Records ---
  async getGrowthRecords(plantId: string): Promise<GrowthRecord[]> {
    return request<GrowthRecord[]>(`/plants/${plantId}/growth`);
  },

  async addGrowthRecord(plantId: string, data: {
    height?: number;
    measurement_unit?: string;
    leaf_count?: number;
    health_status?: string;
    observation?: string;
    photo?: File;
  }): Promise<GrowthRecord> {
    const formData = new FormData();
    if (data.height !== undefined) formData.append('height', data.height.toString());
    if (data.measurement_unit) formData.append('measurement_unit', data.measurement_unit);
    if (data.leaf_count !== undefined) formData.append('leaf_count', data.leaf_count.toString());
    if (data.health_status) formData.append('health_status', data.health_status);
    if (data.observation) formData.append('observation', data.observation);
    if (data.photo) formData.append('photo', data.photo);

    return request<GrowthRecord>(`/plants/${plantId}/growth`, {
      method: 'POST',
      body: formData,
    });
  },

  async deleteGrowthRecord(recordId: string): Promise<{ message: string }> {
    return request<{ message: string }>(`/growth-records/${recordId}`, {
      method: 'DELETE',
    });
  },

  // --- Chat ---
  async sendChatMessage(message: string, conversationId?: string, plantId?: string): Promise<ChatMessage> {
    return request<ChatMessage>('/chat', {
      method: 'POST',
      body: JSON.stringify({ message, conversation_id: conversationId, plant_id: plantId }),
    });
  },

  async getChatConversations(): Promise<ChatConversation[]> {
    return request<ChatConversation[]>('/chat/conversations');
  },

  async getChatConversation(id: string): Promise<ChatConversation> {
    return request<ChatConversation>(`/chat/conversations/${id}`);
  },

  async deleteChatConversation(id: string): Promise<{ message: string }> {
    return request<{ message: string }>(`/chat/conversations/${id}`, {
      method: 'DELETE',
    });
  },

  // --- Notifications ---
  async getNotifications(): Promise<NotificationItem[]> {
    return request<NotificationItem[]>('/notifications');
  },

  async markNotificationRead(id: string): Promise<NotificationItem> {
    return request<NotificationItem>(`/notifications/${id}/read`, {
      method: 'PATCH',
    });
  },

  async markAllNotificationsRead(): Promise<{ message: string }> {
    return request<{ message: string }>('/notifications/mark-all-read', {
      method: 'POST',
    });
  },

  async dismissNotification(id: string): Promise<{ message: string }> {
    return request<{ message: string }>(`/notifications/${id}`, {
      method: 'DELETE',
    });
  },

  // --- Articles ---
  async getArticles(params?: { category?: string; difficulty?: string; search?: string }): Promise<Article[]> {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.difficulty) query.append('difficulty', params.difficulty);
    if (params?.search) query.append('search', params.search);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request<Article[]>(`/articles${queryString}`);
  },

  async getArticle(slug: string): Promise<Article> {
    return request<Article>(`/articles/${slug}`);
  },

  // --- Dashboard ---
  async getDashboardStats(): Promise<DashboardStats> {
    return request<DashboardStats>('/dashboard/stats');
  },

  // --- Calendar ---
  async getCalendarEvents(params?: { start_date?: string; end_date?: string; plant_id?: string; task_type?: string }): Promise<CalendarEvent[]> {
    const query = new URLSearchParams();
    if (params?.start_date) query.append('start_date', params.start_date);
    if (params?.end_date) query.append('end_date', params.end_date);
    if (params?.plant_id) query.append('plant_id', params.plant_id);
    if (params?.task_type) query.append('task_type', params.task_type);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request<CalendarEvent[]>(`/calendar/events${queryString}`);
  },

  // --- Healthcheck ---
  async getHealth() {
    return request<{
      status: string;
      service: string;
      gemini_ai_configured: boolean;
      active_model: string;
      mode: string;
    }>('/health');
  }
};
