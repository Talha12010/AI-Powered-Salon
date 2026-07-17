const crypto = require('crypto');
const { loadDb, saveDb, hashPassword, publicUser } = require('./dbModel');

const UserModel = {
  getAll() {
    const db = loadDb();
    return db.users || [];
  },

  getById(id) {
    const db = loadDb();
    return (db.users || []).find(user => String(user.id) === String(id)) || null;
  },

  getByEmail(email) {
    const db = loadDb();
    const normalized = String(email || '').trim().toLowerCase();
    return (db.users || []).find(user => user.email === normalized) || null;
  },

  create(userData) {
    const db = loadDb();
    const username = String(userData.username || userData.name || '').trim();
    const email = String(userData.email || '').trim().toLowerCase();
    
    // Check if email already exists
    if ((db.users || []).some(u => u.email === email)) {
      throw new Error('Email already exists.');
    }

    const newUser = {
      id: userData.id || crypto.randomUUID(),
      username,
      email,
      name: String(userData.name || username).trim(),
      role: userData.role || 'Customer',
      status: userData.status || 'Active',
      joined: userData.joined || new Date().toISOString().slice(0, 10),
      phone: userData.phone || '',
      address: userData.address || '',
      image: userData.image || ''
    };

    if (userData.password) {
      newUser.passwordHash = hashPassword(String(userData.password));
    }

    db.users = db.users || [];
    db.users.push(newUser);
    saveDb(db);
    return newUser;
  },

  update(id, userData) {
    const db = loadDb();
    db.users = db.users || [];
    const index = db.users.findIndex(user => String(user.id) === String(id));
    if (index === -1) {
      return null;
    }

    const current = db.users[index];
    const updated = { ...current };

    if (userData.username !== undefined) updated.username = String(userData.username).trim();
    if (userData.name !== undefined) updated.name = String(userData.name).trim();
    if (userData.email !== undefined) {
      const email = String(userData.email).trim().toLowerCase();
      // Check if email belongs to someone else
      if (db.users.some(u => u.email === email && String(u.id) !== String(id))) {
        throw new Error('Email already exists.');
      }
      updated.email = email;
    }
    if (userData.role !== undefined) updated.role = userData.role;
    if (userData.status !== undefined) updated.status = userData.status;
    if (userData.joined !== undefined) updated.joined = userData.joined;
    if (userData.phone !== undefined) updated.phone = userData.phone;
    if (userData.address !== undefined) updated.address = userData.address;
    if (userData.image !== undefined) updated.image = userData.image;

    if (userData.password) {
      updated.passwordHash = hashPassword(String(userData.password));
    }

    db.users[index] = updated;
    saveDb(db);
    return updated;
  },

  delete(id) {
    const db = loadDb();
    db.users = db.users || [];
    const beforeLength = db.users.length;
    db.users = db.users.filter(user => String(user.id) !== String(id));
    if (db.users.length === beforeLength) {
      return false;
    }
    saveDb(db);
    return true;
  }
};

module.exports = UserModel;
