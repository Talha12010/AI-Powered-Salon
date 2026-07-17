const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'styleai-local-secret';
const DATA_DIR = path.join(__dirname, '..', 'data');
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
const DB_FILE = path.join(DATA_DIR, 'db.json');

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

const seedUsers = [
  {
    id: crypto.randomUUID(),
    username: 'Admin',
    email: 'admin@styleai.com',
    passwordHash: hashPassword('Admin@12345'),
    role: 'admin',
    status: 'Active',
    joined: '2024-01-01',
    name: 'Admin User',
    phone: '',
    address: '',
    image: ''
  }
];

const seedServices = [
  { id: 1, name: 'Haircut & Style', category: 'Haircut', price: 85, duration: '45 min', status: 'Active', bookings: 234, description: 'Complete haircut and styling session.' },
  { id: 2, name: 'Beard Trim', category: 'Grooming', price: 45, duration: '30 min', status: 'Active', bookings: 156, description: 'Detailed beard trim and shape.' },
  { id: 3, name: 'Full Transformation', category: 'Styling', price: 120, duration: '90 min', status: 'Active', bookings: 89, description: 'Full style consultation and transformation.' },
  { id: 4, name: 'Hair Coloring', category: 'Color', price: 95, duration: '60 min', status: 'Active', bookings: 198, description: 'Color refresh or complete hair coloring.' },
  { id: 5, name: 'Hair Treatment', category: 'Treatment', price: 65, duration: '45 min', status: 'Inactive', bookings: 67, description: 'Deep conditioning and repair treatment.' },
  { id: 6, name: 'Kids Haircut', category: 'Haircut', price: 35, duration: '30 min', status: 'Active', bookings: 312, description: 'Quick haircut for children.' }
];

const seedStyles = [];

const seedBookings = [];

const seedFavorites = [];

const seedTryOns = [];

const seedTransformations = [];

const seedSettings = {
  notifications: {
    emailAlerts: true,
    pushNotifications: true,
    weeklyNewsletter: false,
    styleRecommendations: true,
    bookingReminders: true,
    promotionalOffers: false
  },
  privacy: {
    profileVisibility: 'public',
    showTryOns: true,
    shareAnalytics: false,
    allowMessages: true
  }
};

function defaultDb() {
  return {
    users: seedUsers,
    services: seedServices,
    styles: seedStyles,
    bookings: seedBookings,
    favorites: seedFavorites,
    tryOns: seedTryOns,
    transformations: seedTransformations,
    settings: seedSettings,
    contacts: [],
    home: {
      testimonials: [
        { name: 'Sarah Johnson', role: 'Marketing Manager', image: '/api/placeholder/80/80', text: 'StyleAI completely transformed my look! The AI recommendations were spot-on.', rating: 5 },
        { name: 'Michael Chen', role: 'Software Developer', image: '/api/placeholder/80/80', text: 'The AI analysis is incredibly accurate. It suggested a style I would never have considered.', rating: 5 },
        { name: 'Emily Rodriguez', role: 'Fashion Blogger', image: '/api/placeholder/80/80', text: 'The virtual try-on feature is amazing. I can experiment without commitment.', rating: 5 }
      ],
      features: [
        { icon: '🤖', title: 'AI-Powered Analysis', description: 'Advanced machine learning analyzes your face shape, features, and hair texture for personalized recommendations.' },
        { icon: '📸', title: 'Virtual Try-On', description: 'See how different hairstyles look on you before making any changes. Realistic previews in seconds.' },
        { icon: '🎯', title: '98% Accuracy', description: 'Our AI has been trained on millions of images to provide highly accurate style suggestions.' },
        { icon: '⚡', title: 'Instant Results', description: 'Get personalized hairstyle recommendations in under 30 seconds. No waiting, no hassle.' }
      ],
      stats: [
        { number: '50K+', label: 'Happy Users' },
        { number: '1000+', label: 'Hairstyles' },
        { number: '98%', label: 'Satisfaction' },
        { number: '4.9', label: 'Avg Rating' }
      ],
      popularStyles: []
    },
    pricing: {
      faqs: [
        { question: 'How does the AI analysis work?', answer: 'Our AI analyzes your face shape, features, hair texture, and personal style preferences.' },
        { question: 'Can I cancel my subscription anytime?', answer: 'Yes. You can cancel at any time and keep access until the billing period ends.' },
        { question: 'Is my photo data secure?', answer: 'Yes. Your photos and personal data are protected and can be deleted anytime.' },
        { question: 'What is the difference between plans?', answer: 'Professional includes unlimited recommendations and full style history.' },
        { question: 'Do you offer refunds?', answer: 'We offer a 14-day money-back guarantee on all plans.' },
        { question: 'Can I use this for my salon business?', answer: 'Yes. The Enterprise plan is designed for salons and professionals.' }
      ]
    }
  };
}

function loadDb() {
  if (!fs.existsSync(DB_FILE)) {
    const initial = defaultDb();
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
  const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  const merged = { ...defaultDb(), ...db };
  if (!Array.isArray(merged.users) || merged.users.length === 0) merged.users = seedUsers;
  return merged;
}

function saveDb(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

function publicUser(user) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role || 'user',
    status: user.status || 'Active',
    joined: user.joined || '2024-01-01',
    name: user.name || user.username,
    phone: user.phone || '',
    address: user.address || '',
    image: user.image || ''
  };
}

function signToken(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 })).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

function verifyToken(token) {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [header, body, signature] = parts;
  const expected = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  if (signature !== expected) return null;

  const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
  if (payload.exp < Date.now()) return null;
  return payload;
}

module.exports = {
  DATA_DIR,
  DB_FILE,
  UPLOAD_DIR,
  defaultDb,
  hashPassword,
  loadDb,
  saveDb,
  publicUser,
  signToken,
  verifyToken
};
