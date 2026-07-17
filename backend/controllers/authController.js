const UserModel = require('../models/userModel');
const { hashPassword, publicUser, signToken } = require('../models/dbModel');

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

const AuthController = {
  async signup(req, res) {
    try {
      const { username, email, password } = await readJson(req);
      if (!username || !email || !password) {
        return sendJson(res, 400, { message: 'Username, email, and password are required.' });
      }
      if (password.length < 8) {
        return sendJson(res, 400, { message: 'Password must be at least 8 characters.' });
      }

      // Create new user using UserModel
      const newUser = UserModel.create({
        username,
        email,
        password,
        role: 'user' // Default public user signup
      });

      return sendJson(res, 201, { message: 'Account created successfully!', user: publicUser(newUser) });
    } catch (err) {
      const isDuplicate = err.message.includes('Email already exists');
      return sendJson(res, isDuplicate ? 409 : 400, { message: err.message });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = await readJson(req);
      if (!email || !password) {
        return sendJson(res, 400, { message: 'Email and password are required.' });
      }

      const user = UserModel.getByEmail(email);
      if (!user || user.passwordHash !== hashPassword(String(password))) {
        return sendJson(res, 401, { message: 'Invalid email or password.' });
      }

      const token = signToken({ id: user.id, role: user.role || 'user' });
      return sendJson(res, 200, { message: 'Login successful.', token, user: publicUser(user) });
    } catch (err) {
      return sendJson(res, 500, { message: 'Login failed.', error: err.message });
    }
  }
};

module.exports = AuthController;
