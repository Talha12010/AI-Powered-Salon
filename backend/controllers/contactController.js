const ContactModel = require('../models/contactModel');

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

const ContactController = {
  async createContact(req, res) {
    try {
      const body = await readJson(req);
      const required = ['firstName', 'lastName', 'email', 'subject', 'message'];
      const missing = required.filter(field => !String(body[field] || '').trim());
      
      if (missing.length) {
        return sendJson(res, 400, { message: `${missing.join(', ')} required.` });
      }

      const newContact = ContactModel.create(body);
      return sendJson(res, 201, { message: 'Message sent successfully.', contact: newContact });
    } catch (err) {
      return sendJson(res, 500, { message: 'Failed to send message.', error: err.message });
    }
  }
};

module.exports = ContactController;
