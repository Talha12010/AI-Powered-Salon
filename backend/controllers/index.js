const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const Stripe = require('stripe');
const stripe = new Stripe('sk_test_51TnDSNCE20vKv4iiM5PdjjABzIUwvyzwKa99GnZb9jjKFNFj8QMee9ZwNtesTzXawBD9qzcLBYLy2w8fDdROLdoP008GOpgSe6');
const {
  UPLOAD_DIR,
  loadDb,
  saveDb,
  hashPassword,
  publicUser,
  signToken,
  verifyToken
} = require('../models/dbModel');
const AdminController = require('./adminController');
const UserController = require('./userController');
const AuthController = require('./authController');
const ContactController = require('./contactController');
const ContentController = require('./contentController');

function sendJson(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  });
  res.end(JSON.stringify(data));
}

function sendBuffer(res, status, buffer, contentType) {
  res.writeHead(status, {
    'Content-Type': contentType,
    'Access-Control-Allow-Origin': '*'
  });
  res.end(buffer);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

async function readJson(req) {
  const body = await readBody(req);
  if (!body.length) return {};
  return JSON.parse(body.toString('utf8'));
}

function getCurrentUser(req) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  const payload = verifyToken(token);
  if (!payload) return null;
  const db = loadDb();
  return db.users.find(user => user.id === payload.id) || null;
}

function placeholderSvg(width, height) {
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="#e5e7eb"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#6b7280" font-family="Arial" font-size="16">${width}x${height}</text></svg>`);
}

function parseMultipart(buffer, contentType) {
  const boundaryMatch = contentType.match(/boundary=(.+)$/);
  if (!boundaryMatch) return { fields: {}, files: {} };
  const boundary = `--${boundaryMatch[1]}`;
  const parts = buffer.toString('binary').split(boundary).slice(1, -1);
  const fields = {};
  const files = {};
  for (const part of parts) {
    const trimmed = part.replace(/^\r\n/, '').replace(/\r\n$/, '');
    const separator = trimmed.indexOf('\r\n\r\n');
    if (separator === -1) continue;
    const rawHeaders = trimmed.slice(0, separator);
    const content = trimmed.slice(separator + 4);
    const nameMatch = rawHeaders.match(/name="([^"]+)"/);
    if (!nameMatch) continue;
    const filenameMatch = rawHeaders.match(/filename="([^"]*)"/);
    const contentTypeMatch = rawHeaders.match(/Content-Type:\s*([^\r\n]+)/i);
    const name = nameMatch[1];
    if (filenameMatch && filenameMatch[1]) {
      files[name] = {
        filename: filenameMatch[1],
        contentType: contentTypeMatch ? contentTypeMatch[1] : 'application/octet-stream',
        data: Buffer.from(content, 'binary')
      };
    } else {
      fields[name] = Buffer.from(content, 'binary').toString('utf8');
    }
  }
  return { fields, files };
}

async function handleSignup(req, res) {
  const { username, email, password } = await readJson(req);
  if (!username || !email || !password) return sendJson(res, 400, { message: 'Username, email, and password are required.' });
  if (password.length < 8) return sendJson(res, 400, { message: 'Password must be at least 8 characters.' });
  const db = loadDb();
  const normalizedEmail = email.trim().toLowerCase();
  if (db.users.some(user => user.email === normalizedEmail)) return sendJson(res, 409, { message: 'Email already exists.' });
  const user = { id: crypto.randomUUID(), username: username.trim(), email: normalizedEmail, passwordHash: hashPassword(password), role: 'user', name: username.trim(), phone: '', address: '', image: '' };
  db.users.push(user);
  saveDb(db);
  return sendJson(res, 201, { message: 'Account created successfully!', user: publicUser(user) });
}

async function handleLogin(req, res) {
  const { email, password } = await readJson(req);
  const db = loadDb();
  const user = db.users.find(item => item.email === String(email || '').trim().toLowerCase());
  if (!user || user.passwordHash !== hashPassword(password || '')) return sendJson(res, 401, { message: 'Invalid email or password.' });
  return sendJson(res, 200, { message: 'Login successful.', token: signToken({ id: user.id, role: user.role || 'user' }), user: publicUser(user) });
}

function handleProfile(req, res) {
  const user = getCurrentUser(req);
  if (!user) return sendJson(res, 401, { message: 'Unauthorized. Please login again.' });
  return sendJson(res, 200, publicUser(user));
}

async function handleUpdateProfile(req, res) {
  const currentUser = getCurrentUser(req);
  if (!currentUser) return sendJson(res, 401, { message: 'Unauthorized. Please login again.' });
  const body = await readBody(req);
  const { fields, files } = parseMultipart(body, req.headers['content-type'] || '');
  const db = loadDb();
  const user = db.users.find(item => item.id === currentUser.id);
  if (!user) return sendJson(res, 404, { message: 'User not found' });
  user.name = fields.name || user.name || user.username;
  user.phone = fields.phone || '';
  user.address = fields.address || '';
  if (files.image) {
    const extension = path.extname(files.image.filename) || '.jpg';
    const filename = `${user.id}-${Date.now()}${extension}`;
    fs.writeFileSync(path.join(UPLOAD_DIR, filename), files.image.data);
    user.image = `/uploads/${filename}`;
  }
  saveDb(db);
  return sendJson(res, 200, { message: 'Profile updated successfully.', user: publicUser(user) });
}

function requireAdmin(req) {
  const user = getCurrentUser(req);
  return user && (user.role || 'user') === 'admin';
}

function dashboardStats() {
  const db = loadDb();
  const revenue = db.bookings.reduce((total, booking) => total + Number(booking.amount || booking.price || 0), 0);
  return {
    stats: [
      { label: 'Total Users', value: String(db.users.length), change: '+12.5%', icon: 'users', color: '#6366f1', bgColor: '#e0e7ff' },
      { label: 'Total Bookings', value: String(db.bookings.length), change: '+23.1%', icon: 'calendar', color: '#10b981', bgColor: '#d1fae5' },
      { label: 'Active Services', value: String(db.services.filter(item => item.status === 'Active').length), change: '+2', icon: 'service', color: '#f59e0b', bgColor: '#fef3c7' },
      { label: 'Revenue', value: `$${revenue.toLocaleString()}`, change: '+18.2%', icon: 'revenue', color: '#ef4444', bgColor: '#fee2e2' }
    ],
    recentBookings: db.bookings.slice(0, 5),
    recentUsers: db.users.slice(-5).reverse().map(publicUser)
  };
}

function adminReportPayload() {
  const db = loadDb();
  const revenue = db.bookings.reduce((total, booking) => total + Number(booking.amount || booking.price || 0), 0);
  const activeUsers = db.users.filter(user => (user.status || 'Active') === 'Active').length;
  const pendingBookings = db.bookings.filter(booking => booking.status === 'Pending').length;

  return {
    summary: {
      totalUsers: db.users.length,
      activeUsers,
      totalBookings: db.bookings.length,
      pendingBookings,
      totalServices: db.services.length,
      activeServices: db.services.filter(service => service.status === 'Active').length,
      totalRevenue: revenue
    },
    topServices: db.services
      .map(service => ({
        name: service.name,
        bookings: Number(service.bookings || 0),
        revenue: Number(service.price || 0) * Number(service.bookings || 0),
        growth: Math.max(4, Math.min(30, Math.round(Number(service.popularity || 50) / 5)))
      }))
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 5),
    recentBookings: db.bookings.slice(0, 10),
    recentUsers: db.users.slice(-10).reverse().map(publicUser)
  };
}

function getNextId(items) {
  return items.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
}

function handleAnalytics(req, res) {
  const user = getCurrentUser(req);
  if (!user) return sendJson(res, 401, { message: 'Unauthorized. Please login again.' });
  const db = loadDb();
  const completed = db.bookings.filter(item => item.status === 'Completed').length;
  const avgAccuracy = db.tryOns.length ? Math.round(db.tryOns.reduce((sum, item) => sum + Number(item.accuracy || 0), 0) / db.tryOns.length) : 0;
  return sendJson(res, 200, { analytics: { totalTryOns: db.tryOns.length, totalBookings: db.bookings.length, favorites: db.favorites.length, completedBookings: completed, averageAccuracy: avgAccuracy, plan: user.role === 'admin' ? 'Admin' : 'Premium' } });
}

async function handleContact(req, res) {
  const body = await readJson(req);
  const required = ['firstName', 'lastName', 'email', 'subject', 'message'];
  const missing = required.filter(field => !String(body[field] || '').trim());
  if (missing.length) return sendJson(res, 400, { message: `${missing.join(', ')} required.` });
  const db = loadDb();
  const contact = { id: crypto.randomUUID(), ...body, status: 'new', createdAt: new Date().toISOString() };
  db.contacts.push(contact);
  saveDb(db);
  return sendJson(res, 201, { message: 'Message sent successfully.', contact });
}

function handleGetSettings(req, res) {
  const user = getCurrentUser(req);
  if (!user) return sendJson(res, 401, { message: 'Unauthorized. Please login again.' });
  const db = loadDb();
  return sendJson(res, 200, { settings: db.settings });
}

async function handleUpdateSettings(req, res) {
  const user = getCurrentUser(req);
  if (!user) return sendJson(res, 401, { message: 'Unauthorized. Please login again.' });
  const body = await readJson(req);
  const db = loadDb();
  db.settings = {
    notifications: { ...(db.settings?.notifications || {}), ...(body.notifications || {}) },
    privacy: { ...(db.settings?.privacy || {}), ...(body.privacy || {}) }
  };
  saveDb(db);
  return sendJson(res, 200, { message: 'Settings updated successfully.', settings: db.settings });
}

async function handleAdminCreate(req, res, collection) {
  const db = loadDb();
  const body = await readJson(req);
  const list = db[collection] || [];
  const item = {
    id: body.id || (collection === 'users' ? crypto.randomUUID() : getNextId(list)),
    ...body
  };

  if (collection === 'users') {
    item.username = String(item.username || '').trim();
    item.email = String(item.email || '').trim().toLowerCase();
    item.role = item.role || 'Customer';
    item.status = item.status || 'Active';
    item.joined = item.joined || new Date().toISOString().slice(0, 10);
    if (!item.passwordHash && item.password) item.passwordHash = hashPassword(String(item.password));
    delete item.password;
  }

  db[collection] = list;
  db[collection].push(item);
  saveDb(db);
  return sendJson(res, 201, { message: 'Created successfully.', [collection.slice(0, -1)]: collection === 'users' ? publicUser(item) : item });
}

async function handleAdminUpdate(req, res, collection, id) {
  const db = loadDb();
  const body = await readJson(req);
  const list = db[collection] || [];
  const index = list.findIndex(item => String(item.id) === String(id));
  if (index === -1) return sendJson(res, 404, { message: 'Item not found.' });

  const next = { ...list[index], ...body, id: list[index].id };
  if (collection === 'users') {
    if (body.email !== undefined) next.email = String(body.email).trim().toLowerCase();
    if (body.username !== undefined) next.username = String(body.username).trim();
    if (body.role !== undefined) next.role = body.role;
    if (body.status !== undefined) next.status = body.status;
    if (body.joined !== undefined) next.joined = body.joined;
    if (body.password) next.passwordHash = hashPassword(String(body.password));
    delete next.password;
  }

  list[index] = next;
  saveDb(db);
  return sendJson(res, 200, { message: 'Updated successfully.', [collection.slice(0, -1)]: collection === 'users' ? publicUser(next) : next });
}

async function handleTryOnAnalyze(req, res) {
  const user = getCurrentUser(req);
  if (!user) return sendJson(res, 401, { message: 'Unauthorized. Please login again.' });
  const body = await readJson(req);
  const db = loadDb();
  const styles = db.styles || [];
  const matched = styles
    .filter(style => {
      const gender = String(body.gender || '').toLowerCase();
      const selectedStyle = String(body.style || '').toLowerCase();
      const matchesGender = !gender || String(style.gender || '').toLowerCase() === gender || String(style.gender || '').toLowerCase() === 'unisex';
      const matchesStyle = !selectedStyle || String(style.category || '').toLowerCase().includes(selectedStyle) || String(style.name || '').toLowerCase().includes(selectedStyle);
      return matchesGender && matchesStyle;
    })
    .sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0))
    .slice(0, 6)
    .map((style, index) => ({
      id: style.id,
      name: style.name,
      image: style.image || '/api/placeholder/300/300',
      confidence: Math.max(80, 96 - index * 3),
      description: style.description || `${style.category} hairstyle recommendation`,
      category: style.category || 'Recommended'
    }));
  return sendJson(res, 200, { message: 'Analysis complete.', recommendations: matched.length ? matched : styles.slice(0, 6).map((style, index) => ({ id: style.id, name: style.name, image: style.image || '/api/placeholder/300/300', confidence: Math.max(75, 92 - index * 2), description: style.description || `${style.category} hairstyle recommendation`, category: style.category || 'Recommended' })) });
}

function handleUpload(req, res, pathname) {
  const filename = path.basename(pathname.replace('/uploads/', ''));
  const file = path.join(UPLOAD_DIR, filename);
  if (!fs.existsSync(file)) return sendJson(res, 404, { message: 'File not found.' });
  const extension = path.extname(file).toLowerCase();
  const contentType = extension === '.png' ? 'image/png' : extension === '.gif' ? 'image/gif' : 'image/jpeg';
  return sendBuffer(res, 200, fs.readFileSync(file), contentType);
}

function handleList(res, key) {
  const db = loadDb();
  return sendJson(res, 200, { [key]: db[key] || [] });
}

async function handleCreate(req, res, key) {
  const db = loadDb();
  const body = await readJson(req);
  const item = { id: body.id || (db[key].reduce((max, entry) => Math.max(max, Number(entry.id) || 0), 0) + 1), ...body };
  db[key].push(item);
  saveDb(db);
  return sendJson(res, 201, { message: 'Created successfully.', [key.slice(0, -1)]: item });
}

async function handleUpdate(req, res, key, id) {
  const db = loadDb();
  const body = await readJson(req);
  const items = db[key] || [];
  const index = items.findIndex(item => String(item.id) === String(id));
  if (index === -1) return sendJson(res, 404, { message: 'Item not found.' });
  items[index] = { ...items[index], ...body, id: items[index].id };
  saveDb(db);
  return sendJson(res, 200, { message: 'Updated successfully.', [key.slice(0, -1)]: items[index] });
}

function handleDelete(res, key, id) {
  const db = loadDb();
  const before = (db[key] || []).length;
  db[key] = (db[key] || []).filter(item => String(item.id) !== String(id));
  if (db[key].length === before) return sendJson(res, 404, { message: 'Item not found.' });
  saveDb(db);
  return sendJson(res, 200, { message: 'Deleted successfully.' });
}

function handleAdminDelete(res, collection, id) {
  return handleDelete(res, collection, id);
}

async function handleCreatePaymentIntent(req, res) {
  try {
    const { amount, currency = 'usd' } = await readJson(req);
    if (!amount) {
      return sendJson(res, 400, { message: 'Amount is required.' });
    }
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(amount) * 100),
      currency,
      automatic_payment_methods: { enabled: true },
    });
    return sendJson(res, 200, { clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Stripe PaymentIntent Error:', error);
    return sendJson(res, 500, { message: 'Failed to create payment intent.', error: error.message });
  }
}

async function handleConfirmBooking(req, res) {
  try {
    const user = getCurrentUser(req);
    const body = await readJson(req);
    const db = loadDb();
    const bookings = db.bookings || [];
    const newId = `BK${String(bookings.reduce((max, b) => {
      const m = String(b.id || '').match(/^BK(\d+)$/);
      return m ? Math.max(max, Number(m[1])) : max;
    }, 0) + 1).padStart(3, '0')}`;
    const booking = {
      id: newId,
      userId: user ? user.id : null,
      user: user ? (user.name || user.username || user.email) : (body.name || 'Guest'),
      email: user ? user.email : (body.email || ''),
      salon: 'StyleAI Studio',
      service: body.service || '',
      date: body.date || new Date().toISOString().slice(0, 10),
      time: body.time || '10:00 AM',
      amount: Number(body.amount || 0),
      price: Number(body.amount || 0),
      status: 'Pending',
      stylist: body.stylist || 'StyleAI Stylist',
      paymentId: body.paymentIntentId || '',
      image: '/api/placeholder/100/100',
      createdAt: new Date().toISOString()
    };
    db.bookings = [...bookings, booking];
    saveDb(db);
    return sendJson(res, 201, { message: 'Booking confirmed!', booking });
  } catch (error) {
    console.error('Confirm Booking Error:', error);
    return sendJson(res, 500, { message: 'Failed to save booking.', error: error.message });
  }
}

async function router(req, res) {
  const { pathname } = new URL(req.url, `http://${req.headers.host}`);
  const pathParts = pathname.split('/').filter(Boolean);
  if (req.method === 'OPTIONS') return sendJson(res, 204, {});
  if (req.method === 'GET' && pathname === '/') return sendJson(res, 200, { message: 'StyleAI backend is running.' });
  if (req.method === 'GET' && pathname === '/api/content/home') return ContentController.getHomeContent(req, res);
  if (req.method === 'GET' && pathname === '/api/content/transformations') return ContentController.getTransformationsContent(req, res);
  if (req.method === 'GET' && pathname === '/api/content/pricing') return ContentController.getPricingContent(req, res);
  if (req.method === 'GET' && pathname.startsWith('/api/placeholder/')) {
    const [, , , width = '300', height = '300'] = pathname.split('/');
    return sendBuffer(res, 200, placeholderSvg(width, height), 'image/svg+xml');
  }
  if (req.method === 'GET' && pathname.startsWith('/uploads/')) return handleUpload(req, res, pathname);
  if (req.method === 'POST' && pathname === '/api/auth/signup') return AuthController.signup(req, res);
  if (req.method === 'POST' && pathname === '/api/auth/login') return AuthController.login(req, res);
  if (req.method === 'POST' && pathname === '/api/auth/change-password') return UserController.changePassword(req, res);
  if (req.method === 'POST' && pathname === '/api/auth/change-email') return UserController.changeEmail(req, res);
  if (req.method === 'POST' && pathname === '/api/create-payment-intent') return handleCreatePaymentIntent(req, res);
  if (req.method === 'POST' && pathname === '/api/bookings/confirm') return handleConfirmBooking(req, res);
  if (req.method === 'GET' && pathname === '/api/auth/profile') return UserController.getProfile(req, res);
  if (req.method === 'PUT' && pathname === '/api/auth/update-profile') return UserController.updateProfile(req, res);
  if (req.method === 'GET' && pathname === '/api/admin/users') {
    if (!requireAdmin(req)) return sendJson(res, 403, { message: 'Admin access required.' });
    return AdminController.getUsers(req, res);
  }
  if (req.method === 'GET' && pathname === '/api/admin/dashboard') {
    if (!requireAdmin(req)) return sendJson(res, 403, { message: 'Admin access required.' });
    return AdminController.getDashboardStats(req, res);
  }
  if (req.method === 'GET' && pathname === '/api/admin/reports') {
    if (!requireAdmin(req)) return sendJson(res, 403, { message: 'Admin access required.' });
    return AdminController.getReportsSummary(req, res);
  }
  if (req.method === 'GET' && pathname === '/api/admin/reports/summary') {
    if (!requireAdmin(req)) return sendJson(res, 403, { message: 'Admin access required.' });
    return AdminController.getReportsSummary(req, res);
  }
  if (req.method === 'GET' && pathname === '/api/admin/reports/export') {
    if (!requireAdmin(req)) return sendJson(res, 403, { message: 'Admin access required.' });
    return AdminController.exportReport(req, res);
  }
  if (req.method === 'POST' && pathname === '/api/admin/styles/upload-image') {
    if (!requireAdmin(req)) return sendJson(res, 403, { message: 'Admin access required.' });
    const body = await readBody(req);
    const { files } = parseMultipart(body, req.headers['content-type'] || '');
    if (!files.image) return sendJson(res, 400, { message: 'No image file provided.' });
    const extension = path.extname(files.image.filename || '.jpg') || '.jpg';
    const filename = `style-${crypto.randomUUID()}${extension}`;
    fs.writeFileSync(path.join(UPLOAD_DIR, filename), files.image.data);
    return sendJson(res, 200, { imageUrl: `/uploads/${filename}` });
  }
  if (req.method === 'POST' && pathname === '/api/contact') return ContactController.createContact(req, res);
  if (req.method === 'GET' && pathname === '/api/analytics') return UserController.getAnalytics(req, res);
  if (req.method === 'GET' && pathname === '/api/settings') return UserController.getSettings(req, res);
  if (req.method === 'PUT' && pathname === '/api/settings') return UserController.updateSettings(req, res);
  if (req.method === 'POST' && pathname === '/api/tryon/analyze') return UserController.analyzeTryOn(req, res);

  const collectionRoutes = {
    services: 'services',
    styles: 'styles',
    bookings: 'bookings',
    favorites: 'favorites',
    tryons: 'tryOns',
    contacts: 'contacts',
    transformations: 'transformations'
  };

  const collection = pathParts[1] && collectionRoutes[pathParts[1]];
  const id = pathParts[2];
  if (pathParts[0] === 'api' && collection) {
    if (collection === 'bookings') {
      if (req.method === 'GET' && !id) return UserController.getBookings(req, res);
    }
    
    if (collection === 'favorites') {
      if (req.method === 'GET' && !id) return UserController.getFavorites(req, res);
      if (req.method === 'POST' && !id) return UserController.createFavorite(req, res);
      if (req.method === 'DELETE' && id) return UserController.deleteFavorite(req, res, id);
    }

    if (collection === 'tryOns') {
      if (req.method === 'GET' && !id) return UserController.getTryOns(req, res);
      if (req.method === 'POST' && !id) return UserController.createTryOn(req, res);
      if (req.method === 'DELETE' && id) return UserController.deleteTryOn(req, res, id);
    }

    if (req.method === 'GET' && !id) return handleList(res, collection);
    if (['contacts', 'services', 'styles', 'bookings', 'favorites', 'tryOns', 'transformations'].includes(collection)) {
      if (req.method === 'POST' && !id) return handleCreate(req, res, collection);
      if (req.method === 'PUT' && id) return handleUpdate(req, res, collection, id);
      if (req.method === 'DELETE' && id) return handleDelete(res, collection, id);
    }
  }

  const adminCollections = {
    users: 'users',
    services: 'services',
    styles: 'styles',
    bookings: 'bookings'
  };

  if (pathParts[0] === 'api' && pathParts[1] === 'admin' && adminCollections[pathParts[2]]) {
    const collection = adminCollections[pathParts[2]];
    const id = pathParts[3];
    if (!requireAdmin(req)) return sendJson(res, 403, { message: 'Admin access required.' });
    
    if (collection === 'users') {
      if (req.method === 'GET' && !id) return AdminController.getUsers(req, res);
      if (req.method === 'POST' && !id) return AdminController.createUser(req, res);
      if (req.method === 'PUT' && id) return AdminController.updateUser(req, res, id);
      if (req.method === 'DELETE' && id) return AdminController.deleteUser(req, res, id);
    }
    
    if (collection === 'services') {
      if (req.method === 'GET' && !id) return handleList(res, collection);
      if (req.method === 'POST' && !id) return AdminController.createService(req, res);
      if (req.method === 'PUT' && id) return AdminController.updateService(req, res, id);
      if (req.method === 'DELETE' && id) return AdminController.deleteService(req, res, id);
    }

    if (collection === 'styles') {
      if (req.method === 'GET' && !id) return handleList(res, collection);
      if (req.method === 'POST' && !id) return AdminController.createStyle(req, res);
      if (req.method === 'PUT' && id) return AdminController.updateStyle(req, res, id);
      if (req.method === 'DELETE' && id) return AdminController.deleteStyle(req, res, id);
    }

    if (collection === 'bookings') {
      if (req.method === 'GET' && !id) return handleList(res, collection);
      if (req.method === 'PUT' && id) return AdminController.updateBooking(req, res, id);
      if (req.method === 'DELETE' && id) return AdminController.deleteBooking(req, res, id);
    }
  }

  return sendJson(res, 404, { message: 'Route not found.' });
}

module.exports = { router, sendJson, getCurrentUser, publicUser, signToken, verifyToken };
