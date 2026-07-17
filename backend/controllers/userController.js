const fs = require('fs');
const path = require('path');
const UserModel = require('../models/userModel');
const BookingModel = require('../models/bookingModel');
const TryOnModel = require('../models/tryOnModel');
const FavoriteModel = require('../models/favoriteModel');
const { verifyToken, loadDb, saveDb, publicUser, UPLOAD_DIR, hashPassword } = require('../models/dbModel');
const { predictFaceShape } = require('../services/faceShapeClient');

function sendJson(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  });
  res.end(JSON.stringify(data));
}

async function readBody(req) {
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

const UserController = {
  getProfile(req, res) {
    const user = getCurrentUser(req);
    if (!user) return sendJson(res, 401, { message: 'Unauthorized. Please login again.' });
    return sendJson(res, 200, publicUser(user));
  },

  async updateProfile(req, res) {
    const currentUser = getCurrentUser(req);
    if (!currentUser) return sendJson(res, 401, { message: 'Unauthorized. Please login again.' });
    
    try {
      const body = await readBody(req);
      const { fields, files } = parseMultipart(body, req.headers['content-type'] || '');
      
      const updateData = {
        name: fields.name,
        phone: fields.phone,
        address: fields.address
      };

      if (files.image) {
        const extension = path.extname(files.image.filename) || '.jpg';
        const filename = `${currentUser.id}-${Date.now()}${extension}`;
        fs.writeFileSync(path.join(UPLOAD_DIR, filename), files.image.data);
        updateData.image = `/uploads/${filename}`;
      }

      const updated = UserModel.update(currentUser.id, updateData);
      if (!updated) {
        return sendJson(res, 404, { message: 'User not found' });
      }

      return sendJson(res, 200, { message: 'Profile updated successfully.', user: publicUser(updated) });
    } catch (err) {
      return sendJson(res, 400, { message: 'Failed to update profile.', error: err.message });
    }
  },

  getAnalytics(req, res) {
    const user = getCurrentUser(req);
    if (!user) return sendJson(res, 401, { message: 'Unauthorized. Please login again.' });

    try {
      const tryOns = TryOnModel.getAll();
      const bookings = BookingModel.getAll();
      const favorites = FavoriteModel.getAll();
      const completed = bookings.filter(item => item.status === 'Completed').length;
      const avgAccuracy = tryOns.length ? Math.round(tryOns.reduce((sum, item) => sum + Number(item.accuracy || 0), 0) / tryOns.length) : 0;
      
      return sendJson(res, 200, {
        analytics: {
          totalTryOns: tryOns.length,
          totalBookings: bookings.length,
          favorites: favorites.length,
          completedBookings: completed,
          averageAccuracy: avgAccuracy,
          plan: user.role === 'admin' ? 'Admin' : 'Premium'
        }
      });
    } catch (err) {
      return sendJson(res, 500, { message: 'Failed to load analytics.', error: err.message });
    }
  },

  getSettings(req, res) {
    const user = getCurrentUser(req);
    if (!user) return sendJson(res, 401, { message: 'Unauthorized. Please login again.' });
    
    try {
      const db = loadDb();
      return sendJson(res, 200, { settings: db.settings });
    } catch (err) {
      return sendJson(res, 500, { message: 'Failed to load settings.', error: err.message });
    }
  },

  async updateSettings(req, res) {
    const user = getCurrentUser(req);
    if (!user) return sendJson(res, 401, { message: 'Unauthorized. Please login again.' });

    try {
      const body = await readJson(req);
      const db = loadDb();
      db.settings = {
        notifications: { ...(db.settings?.notifications || {}), ...(body.notifications || {}) },
        privacy: { ...(db.settings?.privacy || {}), ...(body.privacy || {}) }
      };
      saveDb(db);
      return sendJson(res, 200, { message: 'Settings updated successfully.', settings: db.settings });
    } catch (err) {
      return sendJson(res, 400, { message: 'Failed to update settings.', error: err.message });
    }
  },

  getBookings(req, res) {
    const user = getCurrentUser(req);
    if (!user) return sendJson(res, 401, { message: 'Unauthorized. Please login again.' });

    try {
      const bookings = BookingModel.getAll();
      const userBookings = (bookings || []).filter(booking => String(booking.userId || '') === String(user.id));
      return sendJson(res, 200, { bookings: userBookings });
    } catch (err) {
      return sendJson(res, 500, { message: 'Failed to retrieve bookings.', error: err.message });
    }
  },

  getFavorites(req, res) {
    try {
      const favorites = FavoriteModel.getAll();
      return sendJson(res, 200, { favorites });
    } catch (err) {
      return sendJson(res, 500, { message: 'Failed to retrieve favorites.', error: err.message });
    }
  },

  async createFavorite(req, res) {
    try {
      const body = await readJson(req);
      const favorite = FavoriteModel.create(body);
      return sendJson(res, 201, { message: 'Created successfully.', favorite });
    } catch (err) {
      return sendJson(res, 400, { message: err.message });
    }
  },

  deleteFavorite(req, res, id) {
    try {
      const success = FavoriteModel.delete(id);
      if (!success) {
        return sendJson(res, 404, { message: 'Favorite not found.' });
      }
      return sendJson(res, 200, { message: 'Deleted successfully.' });
    } catch (err) {
      return sendJson(res, 500, { message: 'Failed to delete favorite.', error: err.message });
    }
  },

  getTryOns(req, res) {
    const user = getCurrentUser(req);
    if (!user) return sendJson(res, 401, { message: 'Unauthorized. Please login again.' });

    try {
      const tryOns = TryOnModel.getAll();
      const userTryOns = (tryOns || []).filter(t => String(t.userId || '') === String(user.id));
      return sendJson(res, 200, { tryOns: userTryOns });
    } catch (err) {
      return sendJson(res, 500, { message: 'Failed to retrieve try-ons.', error: err.message });
    }
  },

  async createTryOn(req, res) {
    const user = getCurrentUser(req);
    if (!user) return sendJson(res, 401, { message: 'Unauthorized. Please login again.' });

    try {
      const body = await readJson(req);
      const payload = { ...body, userId: user.id, userName: user.name || user.username || user.email };
      const tryOn = TryOnModel.create(payload);
      return sendJson(res, 201, { message: 'Created successfully.', tryOn });
    } catch (err) {
      return sendJson(res, 400, { message: err.message });
    }
  },

  deleteTryOn(req, res, id) {
    const user = getCurrentUser(req);
    if (!user) return sendJson(res, 401, { message: 'Unauthorized. Please login again.' });

    try {
      const existing = TryOnModel.getById(id);
      if (!existing) return sendJson(res, 404, { message: 'Try-on not found.' });
      if (existing.userId && String(existing.userId) !== String(user.id) && user.role !== 'admin') {
        return sendJson(res, 403, { message: 'Not authorized to delete this try-on.' });
      }
      const success = TryOnModel.delete(id);
      if (!success) {
        return sendJson(res, 404, { message: 'Try-on not found.' });
      }
      return sendJson(res, 200, { message: 'Deleted successfully.' });
    } catch (err) {
      return sendJson(res, 500, { message: 'Failed to delete try-on.', error: err.message });
    }
  },


  async analyzeTryOn(req, res) {
    const user = getCurrentUser(req);
    if (!user) return sendJson(res, 401, { message: 'Unauthorized. Please login again.' });
    
    try {
      const body = await readJson(req);
      if (!body.image) {
        return sendJson(res, 400, { message: 'No image provided.' });
      }

      const prediction = await predictFaceShape(body.image);
      return sendJson(res, 200, { message: 'Analysis complete.', ...prediction });
    } catch (err) {
      return sendJson(res, 400, { message: 'Analysis failed.', error: err.message });
    }
  }
};

// Change password: requires currentPassword and newPassword in JSON body
UserController.changePassword = async function (req, res) {
  const currentUser = getCurrentUser(req);
  if (!currentUser) return sendJson(res, 401, { message: 'Unauthorized. Please login again.' });

  try {
    const body = await readJson(req);
    const { currentPassword, newPassword } = body;
    if (!currentPassword || !newPassword) return sendJson(res, 400, { message: 'currentPassword and newPassword are required.' });
    if (hashPassword(String(currentPassword)) !== currentUser.passwordHash) return sendJson(res, 401, { message: 'Current password is incorrect.' });
    if (String(newPassword).length < 8) return sendJson(res, 400, { message: 'New password must be at least 8 characters.' });

    const updated = UserModel.update(currentUser.id, { password: String(newPassword) });
    return sendJson(res, 200, { message: 'Password updated successfully.' });
  } catch (err) {
    return sendJson(res, 400, { message: 'Failed to change password.', error: err.message });
  }
};

// Change email: requires currentPassword and newEmail in JSON body
UserController.changeEmail = async function (req, res) {
  const currentUser = getCurrentUser(req);
  if (!currentUser) return sendJson(res, 401, { message: 'Unauthorized. Please login again.' });

  try {
    const body = await readJson(req);
    const { currentPassword, newEmail } = body;
    if (!currentPassword || !newEmail) return sendJson(res, 400, { message: 'currentPassword and newEmail are required.' });
    if (hashPassword(String(currentPassword)) !== currentUser.passwordHash) return sendJson(res, 401, { message: 'Current password is incorrect.' });

    // Attempt update; UserModel.update will throw if email already exists
    const updated = UserModel.update(currentUser.id, { email: String(newEmail).trim().toLowerCase() });
    return sendJson(res, 200, { message: 'Email updated successfully.', user: publicUser(updated) });
  } catch (err) {
    return sendJson(res, 400, { message: err.message });
  }
};

module.exports = UserController;
