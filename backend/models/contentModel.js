const { loadDb } = require('./dbModel');

const ContentModel = {
  getHome() {
    const db = loadDb();
    return db.home || {};
  },

  getTransformations() {
    const db = loadDb();
    return db.transformations || [];
  },

  getPricing() {
    const db = loadDb();
    return db.pricing || {};
  }
};

module.exports = ContentModel;
