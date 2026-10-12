-- ====================================================================
-- FloraAI Database Schema Migration (PostgreSQL / Supabase Compatible)
-- Normalized architecture for botanical assistants & care scheduling
-- ====================================================================

-- 1. PROFILES / USERS
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500),
    preferred_language VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'UTC',
    theme VARCHAR(10) DEFAULT 'light',
    measurement_units VARCHAR(10) DEFAULT 'metric',
    notification_preferences JSONB DEFAULT '{"email": false, "browser": true, "watering": true, "fertilizing": true}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. PLANTS
CREATE TABLE IF NOT EXISTS plants (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    common_name VARCHAR(255) NOT NULL,
    scientific_name VARCHAR(255),
    category VARCHAR(100) DEFAULT 'Indoor',
    photo_url VARCHAR(500),
    location VARCHAR(255) DEFAULT 'Living Room',
    environment VARCHAR(50) DEFAULT 'indoor',
    date_added TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    health_status VARCHAR(50) DEFAULT 'healthy',
    care_preferences JSONB DEFAULT '{}'::jsonb,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_plants_user_id ON plants(user_id);
CREATE INDEX IF NOT EXISTS idx_plants_common_name ON plants(common_name);
CREATE INDEX IF NOT EXISTS idx_plants_health_status ON plants(health_status);

-- 3. PLANT IDENTIFICATIONS
CREATE TABLE IF NOT EXISTS plant_identifications (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plant_id VARCHAR(36) REFERENCES plants(id) ON DELETE SET NULL,
    image_url VARCHAR(500) NOT NULL,
    identification_result JSONB NOT NULL,
    confidence REAL DEFAULT 0.95,
    provider VARCHAR(100) DEFAULT 'FloraAI Botanical Engine',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_plant_ident_user ON plant_identifications(user_id);

-- 4. PLANT DIAGNOSES
CREATE TABLE IF NOT EXISTS plant_diagnoses (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plant_id VARCHAR(36) REFERENCES plants(id) ON DELETE SET NULL,
    image_url VARCHAR(500) NOT NULL,
    observed_symptoms JSONB NOT NULL,
    possible_conditions JSONB NOT NULL,
    recommendations JSONB NOT NULL,
    isolation_needed BOOLEAN DEFAULT FALSE,
    confidence REAL DEFAULT 0.88,
    provider VARCHAR(100) DEFAULT 'FloraAI Pathology Engine',
    user_context JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_plant_diag_user ON plant_diagnoses(user_id);

-- 5. CARE REMINDERS
CREATE TABLE IF NOT EXISTS care_reminders (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plant_id VARCHAR(36) NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
    task_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    due_at TIMESTAMP WITH TIME ZONE NOT NULL,
    repeat_rule VARCHAR(50) DEFAULT 'weekly',
    repeat_days INTEGER DEFAULT 7,
    notes TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_care_reminders_user ON care_reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_care_reminders_due ON care_reminders(due_at);
CREATE INDEX IF NOT EXISTS idx_care_reminders_status ON care_reminders(status);

-- 6. CARE LOGS
CREATE TABLE IF NOT EXISTS care_logs (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plant_id VARCHAR(36) NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
    reminder_id VARCHAR(36) REFERENCES care_reminders(id) ON DELETE SET NULL,
    action_type VARCHAR(50) NOT NULL,
    notes TEXT,
    measurement_value REAL,
    measurement_unit VARCHAR(20),
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_care_logs_user ON care_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_care_logs_plant ON care_logs(plant_id);

-- 7. GROWTH RECORDS
CREATE TABLE IF NOT EXISTS growth_records (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plant_id VARCHAR(36) NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
    height REAL,
    measurement_unit VARCHAR(20) DEFAULT 'cm',
    leaf_count INTEGER,
    health_status VARCHAR(50) DEFAULT 'healthy',
    photo_url VARCHAR(500),
    observation TEXT,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_growth_records_plant ON growth_records(plant_id);

-- 8. CHAT CONVERSATIONS & MESSAGES
CREATE TABLE IF NOT EXISTS chat_conversations (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plant_id VARCHAR(36) REFERENCES plants(id) ON DELETE SET NULL,
    title VARCHAR(255) DEFAULT 'Botanical Consultation',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id VARCHAR(36) PRIMARY KEY,
    conversation_id VARCHAR(36) NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    suggested_actions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_conv ON chat_messages(conversation_id);

-- 9. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plant_id VARCHAR(36) REFERENCES plants(id) ON DELETE SET NULL,
    reminder_id VARCHAR(36) REFERENCES care_reminders(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) DEFAULT 'care_due',
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifs_user ON notifications(user_id);

-- 10. ARTICLES / LEARNING CENTER
CREATE TABLE IF NOT EXISTS articles (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(100) NOT NULL,
    image_url VARCHAR(500),
    summary TEXT NOT NULL,
    content TEXT NOT NULL,
    difficulty VARCHAR(50) DEFAULT 'Easy',
    light_req VARCHAR(100),
    water_req VARCHAR(100),
    common_problems JSONB DEFAULT '[]'::jsonb,
    step_by_step JSONB DEFAULT '[]'::jsonb,
    attribution VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
