const crypto = require('crypto');
const { loadDb, saveDb } = require('./dbModel');

const ContactModel = {
  getAll() {
    const db = loadDb();
    return db.contacts || [];
  },

  create(contactData) {
    const db = loadDb();
    db.contacts = db.contacts || [];

    const newContact = {
      id: contactData.id || crypto.randomUUID(),
      firstName: contactData.firstName || '',
      lastName: contactData.lastName || '',
      email: contactData.email || '',
      phone: contactData.phone || '',
      subject: contactData.subject || '',
      message: contactData.message || '',
      inquiryType: contactData.inquiryType || 'general',
      status: contactData.status || 'new',
      createdAt: contactData.createdAt || new Date().toISOString()
    };

    db.contacts.push(newContact);
    saveDb(db);
    return newContact;
  }
};

module.exports = ContactModel;
