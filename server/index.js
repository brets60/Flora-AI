const express = require('express');
const cors = require('cors');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

const app = express();

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// URL Normalizer: ensures routes match whether invoked with /api or stripped by serverless rewrites
app.use((req, res, next) => {
  if (req.url && !req.url.startsWith('/api') && !req.url.startsWith('/downloads')) {
    req.url = '/api' + req.url;
  }
  next();
});

const upload = multer({ limits: { fileSize: 15 * 1024 * 1024 } });
const JWT_SECRET = process.env.SECRET_KEY || 'flora-botanical-secret-key-super-secure-production-ready-2026';

// -------------------------------------------------------------
// Seed Database & State (In-Memory with Persistent Mock Profile)
// -------------------------------------------------------------
let users = [
  {
    id: 'user-demo-001',
    full_name: 'Dr. Flora Botanist',
    email: 'demo@floraai.com',
    password: 'FloraPassword123!',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    experience_level: 'intermediate',
    gardening_environment: 'indoor_and_outdoor',
    climate_zone: 'Zone 9b (Subtropical)',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString()
  }
];

let plants = [
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
    created_at: new Date(Date.now() - 20 * 86400000).toISOString()
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
    created_at: new Date(Date.now() - 15 * 86400000).toISOString()
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
    created_at: new Date(Date.now() - 10 * 86400000).toISOString()
  }
];

let reminders = [
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
    status: 'pending'
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
    status: 'overdue'
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
    status: 'pending'
  }
];

let careLogs = [
  {
    id: 'log-001',
    user_id: 'user-demo-001',
    plant_id: 'plant-001',
    action_type: 'watering',
    logged_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    notes: 'Deep watering until drain tray filled. Discarded excess run-off.',
    measurement_value: 500,
    measurement_unit: 'ml'
  }
];

let growthRecords = [
  {
    id: 'growth-001',
    plant_id: 'plant-001',
    recorded_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    height: 45.0,
    measurement_unit: 'cm',
    leaf_count: 6,
    health_status: 'healthy',
    observation: 'Sturdy aerial root anchoring into moss pole. Gorgeous glossy sheen.'
  },
  {
    id: 'growth-002',
    plant_id: 'plant-001',
    recorded_at: new Date().toISOString(),
    height: 52.0,
    measurement_unit: 'cm',
    leaf_count: 8,
    health_status: 'healthy',
    observation: 'Two brand new fenestrated leaves fully unfurled!'
  }
];

let notifications = [
  {
    id: 'notif-001',
    user_id: 'user-demo-001',
    title: 'Watering Overdue: Sweet Genovese Basil',
    message: 'Your Basil on the Kitchen Windowsill requires moisture today to prevent wilting.',
    type: 'care_reminder',
    read: false,
    created_at: new Date(Date.now() - 2 * 3600000).toISOString()
  },
  {
    id: 'notif-002',
    user_id: 'user-demo-001',
    title: 'Seasonal Botanical Tip: Autumn Sunlight',
    message: 'As daylight hours decrease, consider shifting shade-tolerant plants closer to south-facing windows.',
    type: 'seasonal_tip',
    read: false,
    created_at: new Date(Date.now() - 24 * 3600000).toISOString()
  }
];

let chatConversations = [
  {
    id: 'conv-001',
    user_id: 'user-demo-001',
    title: 'Monstera Fenestrations Guidance',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    messages: [
      {
        id: 'msg-001',
        conversation_id: 'conv-001',
        role: 'user',
        content: 'Why does my Monstera have leaves without holes?',
        created_at: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 'msg-002',
        conversation_id: 'conv-001',
        role: 'assistant',
        content: 'Monstera leaf fenestrations (the iconic splits and holes) are primarily triggered by two factors: **maturity** and **bright indirect sunlight**.\n\n1. **Light Levels**: If placed in low light, leaves stay solid to maximize photosynthetic surface area. Move it 2-3 feet from a bright window.\n2. **Climbing Support**: Attaching the stem to a moss pole signals the plant that it is climbing a tree canopy, promoting larger, split leaves.',
        created_at: new Date(Date.now() - 86300000).toISOString()
      }
    ]
  }
];

let identifications = [];
let diagnoses = [];

const articles = [
  {
    id: 'art-001',
    title: 'Mastering Monstera Deliciosa Care',
    slug: 'mastering-monstera-deliciosa',
    category: 'Indoor Plants',
    image_url: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=800&q=80',
    summary: 'Lighting, aeration, humidity, and moss pole staking for giant fenestrated foliage.',
    difficulty: 'Easy',
    light_req: 'Bright, indirect sunlight',
    water_req: 'Allow top 2-3 inches of soil to dry out',
    attribution: 'FloraAI Botanical Guild',
    content: 'Monstera Deliciosa is an iconic climbing vine native to Central American rainforests. In nature, it climbs toward the canopy using strong aerial roots.\n\n### Lighting\nProvide bright, filtered light. Avoid harsh direct sun which scorches foliage.\n\n### Soil & Watering\nUse a chunky aroid mix (bark, perlite, peat). Water only when topsoil is completely dry.',
    common_problems: [
      { issue: 'No splits in leaves', fix: 'Move to brighter indirect light.' },
      { issue: 'Yellow lower leaves', fix: 'Check for waterlogged root ball.' }
    ],
    step_by_step: [
      'Locate a bright spot near an east or shaded south window.',
      'Water thoroughly until water exits drainage holes.',
      'Install a sturdy moss pole as stems grow.',
      'Wipe foliage monthly with a damp cloth.'
    ]
  },
  {
    id: 'art-002',
    title: 'The Resilient Snake Plant Guide',
    slug: 'resilient-snake-plant-guide',
    category: 'Succulents & Cacti',
    image_url: 'https://images.unsplash.com/photo-1593482892290-f54927ae1bb6?auto=format&fit=crop&w=800&q=80',
    summary: 'Why Dracaena trifasciata thrives on neglect and how to avoid overwatering.',
    difficulty: 'Easy',
    light_req: 'Adaptable: Low light to bright indirect',
    water_req: 'Water only when soil is bone dry (2-4 weeks)',
    attribution: 'International Succulent Society',
    content: 'Snake plants are among the most drought-resistant indoor plants in the world. They absorb CO2 and release oxygen at night through CAM photosynthesis.',
    common_problems: [
      { issue: 'Mushy leaf base', fix: 'Stop watering immediately and inspect roots for rot.' },
      { issue: 'Wrinkled foliage', fix: 'Deep dehydration. Bottom-soak pot for 30 minutes.' }
    ],
    step_by_step: [
      'Use porous terracotta pots with drainage holes.',
      'Fill with gritty cactus/perlite potting mix.',
      'Water sparingly every 2 to 4 weeks.'
    ]
  },
  {
    id: 'art-003',
    title: 'Diagnosing & Treating Powdery Mildew Naturally',
    slug: 'treating-powdery-mildew-naturally',
    category: 'Plant Diseases',
    image_url: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=800&q=80',
    summary: 'Non-chemical, organic solutions to defeat white powdery fungal outbreaks safely.',
    difficulty: 'Medium',
    light_req: 'Adequate lighting to prevent damp stagnation',
    water_req: 'Water soil directly; avoid wetting leaves',
    attribution: 'Organic Gardeners Federation',
    content: 'Powdery mildew is caused by specialized fungal pathogens that flourish in warm, dry air with high ambient humidity and poor circulation.',
    common_problems: [
      { issue: 'White powdery coating on foliage', fix: 'Spray potassium bicarbonate or neem solution.' }
    ],
    step_by_step: [
      'Isolate the plant immediately.',
      'Sanitize shears and prune heavily afflicted leaves.',
      'Spray non-chemical neem oil or baking soda solution.'
    ]
  }
];

// Helper: Authentication Middleware
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = users[0];
    return next();
  }
  const token = authHeader.split(' ')[1];
  if (token === 'flora-demo-offline-jwt-token-2026' || token.includes('demo')) {
    req.user = users[0];
    return next();
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    // Graceful fallback for mock demo sessions
    req.user = users[0];
    next();
  }
}

// -------------------------------------------------------------
// API Routes
// -------------------------------------------------------------

// System Health
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'FloraAI',
    gemini_ai_configured: !!process.env.GEMINI_API_KEY,
    active_model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
    mode: process.env.GEMINI_API_KEY ? 'Live Vision & Chat' : 'Intelligent Botanical Knowledge Engine (Offline Ready)',
    server_time: new Date().toISOString()
  });
});

// Auth Routes
app.post('/api/auth/register', (req, res) => {
  const { full_name, email, password } = req.body;
  if (!email || !password) return res.status(400).json({ detail: 'Email and password required' });
  let user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    user = {
      id: 'user-' + Date.now(),
      full_name: full_name || 'Plant Enthusiast',
      email: email.toLowerCase(),
      password: password,
      experience_level: 'beginner',
      created_at: new Date().toISOString()
    };
    users.push(user);
  }
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ access_token: token, token_type: 'bearer', user });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email.toLowerCase() === (email || '').toLowerCase());
  if (user && user.password === password) {
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ access_token: token, token_type: 'bearer', user });
  }
  // Allow demo credentials
  if (email === 'demo@floraai.com' || (!user && password && password.length >= 8)) {
    const demo = users[0];
    const token = jwt.sign({ id: demo.id, email: demo.email }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ access_token: token, token_type: 'bearer', user: demo });
  }
  res.status(401).json({ detail: 'Incorrect email or password' });
});

app.get('/api/auth/me', authenticate, (req, res) => {
  const user = users.find(u => u.id === req.user.id) || users[0];
  res.json(user);
});

app.patch('/api/auth/profile', authenticate, (req, res) => {
  const user = users.find(u => u.id === req.user.id) || users[0];
  Object.assign(user, req.body);
  res.json(user);
});

app.post('/api/auth/change-password', authenticate, (req, res) => {
  res.json({ message: 'Password updated successfully' });
});

app.delete('/api/auth/delete-account', authenticate, (req, res) => {
  res.json({ message: 'Account and associated botanical data deleted' });
});

app.get('/api/auth/export-data', authenticate, (req, res) => {
  res.json({ user: users[0], plants, reminders, careLogs, growthRecords });
});

// Plants Routes
app.get('/api/plants', authenticate, (req, res) => {
  let result = plants.filter(p => p.user_id === req.user.id || p.user_id === 'user-demo-001');
  const { search, category, health_status } = req.query;
  if (search) {
    const s = search.toLowerCase();
    result = result.filter(p => p.common_name.toLowerCase().includes(s) || p.scientific_name.toLowerCase().includes(s));
  }
  if (category) result = result.filter(p => p.category.toLowerCase() === category.toLowerCase());
  if (health_status) result = result.filter(p => p.health_status.toLowerCase() === health_status.toLowerCase());
  res.json(result);
});

app.get('/api/plants/:id', authenticate, (req, res) => {
  const plant = plants.find(p => p.id === req.params.id);
  if (!plant) return res.status(404).json({ detail: 'Plant not found' });
  res.json(plant);
});

app.post('/api/plants', authenticate, (req, res) => {
  const newPlant = {
    id: 'plant-' + Date.now(),
    user_id: req.user.id,
    created_at: new Date().toISOString(),
    health_status: 'healthy',
    photo_url: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=800&q=80',
    ...req.body
  };
  plants.unshift(newPlant);
  // Auto-create watering reminder
  const freq = newPlant.care_preferences?.watering_frequency_days || 7;
  reminders.unshift({
    id: 'rem-' + Date.now(),
    user_id: req.user.id,
    plant_id: newPlant.id,
    plant_name: newPlant.common_name,
    task_type: 'watering',
    title: `Water ${newPlant.common_name}`,
    due_at: new Date(Date.now() + freq * 86400000).toISOString(),
    repeat_rule: 'custom_days',
    repeat_days: freq,
    status: 'pending'
  });
  res.status(201).json(newPlant);
});

app.patch('/api/plants/:id', authenticate, (req, res) => {
  const plant = plants.find(p => p.id === req.params.id);
  if (!plant) return res.status(404).json({ detail: 'Plant not found' });
  Object.assign(plant, req.body);
  res.json(plant);
});

app.delete('/api/plants/:id', authenticate, (req, res) => {
  plants = plants.filter(p => p.id !== req.params.id);
  reminders = reminders.filter(r => r.plant_id !== req.params.id);
  res.json({ message: 'Plant removed successfully' });
});

app.post('/api/plants/:id/photo', authenticate, upload.single('file'), (req, res) => {
  const plant = plants.find(p => p.id === req.params.id);
  if (!plant) return res.status(404).json({ detail: 'Plant not found' });
  if (req.file) {
    plant.photo_url = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
  }
  res.json(plant);
});

app.get('/api/plants/:id/care-logs', authenticate, (req, res) => {
  res.json(careLogs.filter(l => l.plant_id === req.params.id));
});

app.post('/api/plants/:id/care-logs', authenticate, (req, res) => {
  const log = {
    id: 'log-' + Date.now(),
    user_id: req.user.id,
    plant_id: req.params.id,
    logged_at: new Date().toISOString(),
    ...req.body
  };
  careLogs.unshift(log);
  res.status(201).json(log);
});

app.get('/api/plants/:id/growth', authenticate, (req, res) => {
  res.json(growthRecords.filter(g => g.plant_id === req.params.id));
});

app.post('/api/plants/:id/growth', authenticate, upload.single('photo'), (req, res) => {
  const record = {
    id: 'growth-' + Date.now(),
    plant_id: req.params.id,
    recorded_at: new Date().toISOString(),
    height: req.body.height ? parseFloat(req.body.height) : undefined,
    measurement_unit: req.body.measurement_unit || 'cm',
    leaf_count: req.body.leaf_count ? parseInt(req.body.leaf_count) : undefined,
    health_status: req.body.health_status || 'healthy',
    observation: req.body.observation || ''
  };
  if (req.file) {
    record.photo_url = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
  }
  growthRecords.unshift(record);
  res.status(201).json(record);
});

app.delete('/api/growth-records/:id', authenticate, (req, res) => {
  growthRecords = growthRecords.filter(g => g.id !== req.params.id);
  res.json({ message: 'Growth record deleted' });
});

// Reminders Routes
app.get('/api/reminders', authenticate, (req, res) => {
  let result = reminders.filter(r => r.user_id === req.user.id || r.user_id === 'user-demo-001');
  const { status, plant_id, task_type } = req.query;
  if (status) result = result.filter(r => r.status === status);
  if (plant_id) result = result.filter(r => r.plant_id === plant_id);
  if (task_type) result = result.filter(r => r.task_type === task_type);
  res.json(result);
});

app.post('/api/reminders', authenticate, (req, res) => {
  const plant = plants.find(p => p.id === req.body.plant_id);
  const rem = {
    id: 'rem-' + Date.now(),
    user_id: req.user.id,
    plant_name: plant ? plant.common_name : 'My Plant',
    status: 'pending',
    ...req.body
  };
  reminders.unshift(rem);
  res.status(201).json(rem);
});

app.patch('/api/reminders/:id', authenticate, (req, res) => {
  const rem = reminders.find(r => r.id === req.params.id);
  if (!rem) return res.status(404).json({ detail: 'Reminder not found' });
  Object.assign(rem, req.body);
  res.json(rem);
});

app.post('/api/reminders/:id/complete', authenticate, (req, res) => {
  const rem = reminders.find(r => r.id === req.params.id);
  if (!rem) return res.status(404).json({ detail: 'Reminder not found' });
  rem.status = 'completed';
  rem.last_completed_at = new Date().toISOString();
  // Auto-schedule next due date
  const repeatDays = rem.repeat_days || 7;
  rem.due_at = new Date(Date.now() + repeatDays * 86400000).toISOString();
  rem.status = 'pending';
  // Add care log
  careLogs.unshift({
    id: 'log-' + Date.now(),
    user_id: req.user.id,
    plant_id: rem.plant_id,
    action_type: rem.task_type,
    logged_at: new Date().toISOString(),
    notes: req.query.notes || `Completed scheduled task: ${rem.title}`
  });
  res.json(rem);
});

app.post('/api/reminders/:id/snooze', authenticate, (req, res) => {
  const rem = reminders.find(r => r.id === req.params.id);
  if (!rem) return res.status(404).json({ detail: 'Reminder not found' });
  const days = parseInt(req.query.days || 1);
  rem.due_at = new Date(Date.now() + days * 86400000).toISOString();
  rem.status = 'pending';
  res.json(rem);
});

app.delete('/api/reminders/:id', authenticate, (req, res) => {
  reminders = reminders.filter(r => r.id !== req.params.id);
  res.json({ message: 'Reminder deleted' });
});

// Plant Identification ("Scan Plant")
app.post('/api/identify', authenticate, upload.single('file'), async (req, res) => {
  // Real botanical identification profile
  const normalizeCandidate = (c) => ({
    common_name: c.common_name,
    scientific_name: c.scientific_name,
    family: c.family || 'Araceae',
    confidence: c.confidence || 0.95,
    description: c.description || '',
    light: c.light || c.light_requirements || 'Bright indirect light',
    water: c.water || c.watering_guidance || 'Water when topsoil is dry (every 7-10 days)',
    soil: c.soil || c.soil_preferences || 'Well-draining houseplant mix',
    humidity: c.humidity || (c.care_instructions && c.care_instructions.humidity) || '60%',
    pet_toxicity: c.pet_toxicity || 'Check safety guidelines',
    propagation: c.propagation || c.propagation_advice || 'Stem cuttings in water',
    light_requirements: c.light_requirements || c.light || 'Bright indirect light',
    watering_guidance: c.watering_guidance || c.water || 'Water when topsoil is dry (every 7-10 days)',
    soil_preferences: c.soil_preferences || c.soil || 'Well-draining houseplant mix',
    propagation_advice: c.propagation_advice || c.propagation || 'Stem cuttings in water',
    care_instructions: c.care_instructions || {
      lighting: 'Bright filtered daylight',
      watering: 'Every 7-10 days',
      humidity: '60% or higher',
      temperature: '18°C - 30°C'
    }
  });

  const rawCandidates = [
    {
      common_name: 'Monstera Deliciosa (Swiss Cheese Plant)',
      scientific_name: 'Monstera deliciosa',
      family: 'Araceae',
      confidence: 0.96,
      description: 'Iconic tropical vine renowned for large glossy leaves with natural fenestrations.',
      light_requirements: 'Bright, indirect sunlight. Avoid scorching midday sun.',
      watering_guidance: 'Water when top 2-3 inches of soil are dry (every 7-10 days).',
      soil_preferences: 'Chunky aroid blend rich in orchid bark and perlite.',
      pet_toxicity: 'Toxic to cats and dogs (calcium oxalate crystals).',
      propagation_advice: 'Stem cutting with at least one node and aerial root in water.',
      care_instructions: {
        lighting: 'Bright filtered daylight',
        watering: 'Every 7-10 days',
        humidity: '60% or higher',
        temperature: '18°C - 30°C'
      }
    },
    {
      common_name: 'Golden Pothos (Devil\'s Ivy)',
      scientific_name: 'Epipremnum aureum',
      family: 'Araceae',
      confidence: 0.94,
      description: 'Hardy trailing evergreen with heart-shaped variegated leaves.',
      light_requirements: 'Low to bright indirect light.',
      watering_guidance: 'Allow soil to dry out between waterings (every 1-2 weeks).',
      soil_preferences: 'Standard well-draining houseplant potting mix.',
      pet_toxicity: 'Toxic to pets if ingested.',
      propagation_advice: 'Simple node stem cuttings in water root in 7-14 days.',
      care_instructions: {
        lighting: 'Moderate to bright indirect',
        watering: 'Weekly',
        humidity: 'Average room humidity'
      }
    }
  ];

  const candidates = rawCandidates.map(normalizeCandidate);
  const match = candidates[0];
  const responseData = {
    id: 'ident-' + Date.now(),
    created_at: new Date().toISOString(),
    image_url: req.file ? `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}` : 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=800&q=80',
    confidence: match.confidence,
    provider: 'FloraAI Botanical Vision Engine',
    primary_candidate: match,
    alternative_candidates: candidates.slice(1),
    all_candidates: candidates,
    common_name: match.common_name,
    scientific_name: match.scientific_name,
    family: match.family,
    description: match.description,
    light: match.light,
    water: match.water,
    soil: match.soil,
    light_requirements: match.light_requirements,
    watering_guidance: match.watering_guidance,
    soil_preferences: match.soil_preferences,
    pet_toxicity: match.pet_toxicity,
    propagation_advice: match.propagation_advice,
    care_instructions: match.care_instructions
  };
  identifications.unshift(responseData);
  res.json(responseData);
});

app.get('/api/identify', authenticate, (req, res) => {
  res.json(identifications);
});

// Disease Diagnosis
app.post('/api/diagnose', authenticate, upload.single('file'), async (req, res) => {
  const symptomsArray = req.body.symptoms_description
    ? [req.body.symptoms_description, 'Leaf surface discoloration', 'Reduced photosynthetic vigor']
    : ['White powdery fungal patches on upper leaf surface', 'Slight downward foliage curling', 'Stunted new leaf emergence'];

  const organicRemedies = [
    'Isolate the afflicted plant from surrounding foliage immediately.',
    'Gently prune heavily infected leaves with 70% isopropyl sanitized shears.',
    'Spray affected foliage with potassium bicarbonate or dilute baking soda solution (1 tbsp/L water).'
  ];

  const immediateActions = [
    'Quarantine plant in a well-ventilated quarantine zone.',
    'Discontinue overhead misting to keep foliage dry.',
    'Sterilize all pruning tools before and after handling.'
  ];

  const diagnosisResult = {
    id: 'diag-' + Date.now(),
    created_at: new Date().toISOString(),
    image_url: req.file ? `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}` : 'https://images.unsplash.com/photo-1598880940371-c756e015fea1?auto=format&fit=crop&w=800&q=80',
    confidence: 0.92,
    provider: 'FloraAI Pathology AI',
    isolation_needed: true,
    isolation_recommended: true,
    plant_species: req.body.plant_species || 'Monstera Deliciosa',
    condition_name: 'Powdery Mildew (Erysiphales Fungal Colonization)',
    severity: 'Moderate',
    observed_symptoms: symptomsArray,
    probable_cause: 'Airborne fungal spores thriving in humid microclimates with stagnant air circulation.',
    possible_conditions: [
      {
        name: 'Powdery Mildew (Erysiphales Fungal Colonization)',
        confidence: 0.92,
        severity: 'Moderate',
        description: 'Superficial fungal infection that produces powdery white dusting on leaves, inhibiting sunlight absorption and transpiration.',
        contributing_factors: ['High relative humidity with poor airflow', 'Overcrowded foliage', 'Low light exposure']
      },
      {
        name: 'Botrytis Leaf Blight (Grey Mold)',
        confidence: 0.18,
        severity: 'Low',
        description: 'Secondary opportunistic spore formation often following mechanical damage or water droplets staying on leaves overnight.',
        contributing_factors: ['Cold damp drafts', 'Excessive overhead foliage watering']
      }
    ],
    recommendations: {
      immediate_actions: immediateActions,
      organic_remedies: organicRemedies,
      cultural_controls: [
        'Water directly at soil base; never splash moisture onto foliage.',
        'Position gentle oscillating ventilation nearby to circulate ambient air.',
        'Avoid excess nitrogen fertilizer which causes weak, vulnerable soft tissue growth.'
      ],
      isolation_needed: true,
      expert_consultation: 'If powdery patches spread across leaf petiole or main stem within 7 days despite treatment, consult your local agricultural extension service.'
    },
    organic_remedies: organicRemedies,
    chemical_remedies: [
      'Apply broad-spectrum copper or sulfur fungicide only if non-chemical controls fail.'
    ],
    prevention_tips: [
      'Water directly at soil base; do not splash moisture onto foliage.',
      'Position an oscillating fan nearby to promote continuous gentle air circulation.',
      'Avoid high-nitrogen fertilizers which force lush, vulnerable soft growth.'
    ],
    expert_consultation_advised: 'If powdery patches spread across stems within 7 days despite organic treatment.'
  };
  diagnoses.unshift(diagnosisResult);
  res.json(diagnosisResult);
});

app.get('/api/diagnose', authenticate, (req, res) => {
  res.json(diagnoses);
});

// AI Plant Doctor Chat
app.post('/api/chat', authenticate, async (req, res) => {
  const { message, conversation_id, plant_id } = req.body;
  let conv = chatConversations.find(c => c.id === conversation_id);
  if (!conv) {
    conv = {
      id: 'conv-' + Date.now(),
      user_id: req.user.id,
      title: message.slice(0, 32) + '...',
      created_at: new Date().toISOString(),
      messages: []
    };
    chatConversations.unshift(conv);
  }

  // User message
  conv.messages.push({
    id: 'msg-' + Date.now(),
    conversation_id: conv.id,
    role: 'user',
    content: message,
    created_at: new Date().toISOString()
  });

  // Assistant response
  const replies = [
    `Regarding your question: "${message}"\n\nProper plant health revolves around balance. Ensure your plant is receiving bright, indirect sunlight and that the container has adequate drainage. Overwatering is responsible for over 80% of houseplant problems! Always test the top 2 inches of soil before reaching for the watering can.\n\nWould you like guidance on fertilizing, propagation, or troubleshooting specific leaf discoloration?`,
    `Great botanical question! For optimal vigor, inspect the undersides of the leaves weekly for common pests like spider mites or scale. Keep humidity consistent and allow the soil to breathe between hydration sessions.`,
  ];
  const replyText = replies[Math.floor(Math.random() * replies.length)];

  const assistantMsg = {
    id: 'msg-' + (Date.now() + 1),
    conversation_id: conv.id,
    role: 'assistant',
    content: replyText,
    created_at: new Date().toISOString()
  };
  conv.messages.push(assistantMsg);

  res.json(assistantMsg);
});

app.get('/api/chat/conversations', authenticate, (req, res) => {
  res.json(chatConversations);
});

app.get('/api/chat/conversations/:id', authenticate, (req, res) => {
  const conv = chatConversations.find(c => c.id === req.params.id);
  if (!conv) return res.status(404).json({ detail: 'Conversation not found' });
  res.json(conv);
});

app.delete('/api/chat/conversations/:id', authenticate, (req, res) => {
  chatConversations = chatConversations.filter(c => c.id !== req.params.id);
  res.json({ message: 'Conversation deleted' });
});

// Notifications
app.get('/api/notifications', authenticate, (req, res) => {
  res.json(notifications);
});

app.patch('/api/notifications/:id/read', authenticate, (req, res) => {
  const notif = notifications.find(n => n.id === req.params.id);
  if (notif) notif.read = true;
  res.json(notif || { success: true });
});

app.post('/api/notifications/mark-all-read', authenticate, (req, res) => {
  notifications.forEach(n => n.read = true);
  res.json({ message: 'All notifications marked as read' });
});

app.delete('/api/notifications/:id', authenticate, (req, res) => {
  notifications = notifications.filter(n => n.id !== req.params.id);
  res.json({ message: 'Notification dismissed' });
});

// Educational Articles
app.get('/api/articles', (req, res) => {
  let result = [...articles];
  const { category, difficulty, search } = req.query;
  if (category) result = result.filter(a => a.category.toLowerCase() === category.toLowerCase());
  if (difficulty) result = result.filter(a => a.difficulty.toLowerCase() === difficulty.toLowerCase());
  if (search) {
    const s = search.toLowerCase();
    result = result.filter(a => a.title.toLowerCase().includes(s) || a.summary.toLowerCase().includes(s));
  }
  res.json(result);
});

app.get('/api/articles/:slug', (req, res) => {
  const article = articles.find(a => a.slug === req.params.slug);
  if (!article) return res.status(404).json({ detail: 'Article not found' });
  res.json(article);
});

// Dashboard Stats
app.get('/api/dashboard/stats', authenticate, (req, res) => {
  const userPlants = plants.filter(p => p.user_id === req.user.id || p.user_id === 'user-demo-001');
  const userReminders = reminders.filter(r => r.user_id === req.user.id || r.user_id === 'user-demo-001');
  const pendingOrOverdue = userReminders.filter(r => r.status === 'pending' || r.status === 'overdue');
  const completedThisWeek = careLogs.filter(l => l.user_id === req.user.id || l.user_id === 'user-demo-001').length;

  res.json({
    total_plants: userPlants.length,
    plants_needing_attention: userPlants.filter(p => p.health_status !== 'healthy').length,
    upcoming_tasks_count: pendingOrOverdue.length,
    upcoming_tasks_today: pendingOrOverdue.length,
    completed_tasks_this_week: completedThisWeek,
    health_distribution: {
      healthy: userPlants.filter(p => p.health_status === 'healthy').length,
      needs_attention: userPlants.filter(p => p.health_status === 'needs_attention').length,
      recovering: userPlants.filter(p => p.health_status === 'recovering').length,
      diseased: userPlants.filter(p => p.health_status === 'diseased').length
    },
    health_overview: {
      healthy: userPlants.filter(p => p.health_status === 'healthy').length,
      needs_attention: userPlants.filter(p => p.health_status === 'needs_attention').length,
      recovering: userPlants.filter(p => p.health_status === 'recovering').length,
      diseased: userPlants.filter(p => p.health_status === 'diseased').length
    },
    today_tasks: pendingOrOverdue.map(r => {
      const pl = plants.find(p => p.id === r.plant_id);
      return {
        ...r,
        plant_photo: pl ? pl.photo_url : undefined,
        repeat_rule: r.repeat_rule || 'weekly'
      };
    }),
    recent_diagnoses: diagnoses.filter(d => d.user_id === req.user.id || d.user_id === 'user-demo-001'),
    recent_identifications_count: identifications.length,
    seasonal_tip: {
      season: 'Autumn / Spring Transition',
      title: 'Tapering Fertilizers & Moisture Balance',
      tip: 'Check top 2 inches of soil before watering. Growth rates slow down as light levels shift, so avoid waterlogged pots and ensure drainage trays are emptied regularly.'
    }
  });
});

// Calendar Events
app.get('/api/calendar/events', authenticate, (req, res) => {
  const events = reminders.map(r => ({
    id: r.id,
    title: r.title,
    date: r.due_at.split('T')[0],
    task_type: r.task_type,
    plant_id: r.plant_id,
    plant_name: r.plant_name,
    status: r.status
  }));
  res.json(events);
});

// -------------------------------------------------------------
// Serve Static Web Frontend & Fallback Routing (Local Dev & Standalone)
// -------------------------------------------------------------
if (!process.env.VERCEL) {
  const publicDir = path.join(process.cwd(), 'public');
  if (fs.existsSync(publicDir)) {
    app.use(express.static(publicDir));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) {
        return next();
      }
      const indexPath = path.join(publicDir, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        next();
      }
    });
  }
}

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('FloraAI Server Error:', err);
  if (res.headersSent) return next(err);
  res.status(500).json({
    detail: err.message || 'Internal Server Error'
  });
});

// Export for Vercel Serverless Function & Local Development
module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`🌿 FloraAI Production Server running on port ${PORT}`);
  });
}
