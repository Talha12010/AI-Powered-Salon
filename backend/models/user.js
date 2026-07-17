const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' },
  name: { type: String },
  phone: { type: String },
  address: { type: String },
  image: { type: String }
});

module.exports = mongoose.model('User', UserSchema);
