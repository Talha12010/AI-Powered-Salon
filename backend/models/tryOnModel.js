const { loadDb, saveDb } = require('./dbModel');

function getNextId(items) {
  return items.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
}

const TryOnModel = {
  getAll() {
    const db = loadDb();
    return db.tryOns || [];
  },

  getById(id) {
    const db = loadDb();
    return (db.tryOns || []).find(item => String(item.id) === String(id)) || null;
  },

  create(tryOnData) {
    const db = loadDb();
    db.tryOns = db.tryOns || [];

    const newTryOn = {
      id: tryOnData.id || getNextId(db.tryOns),
      userId: tryOnData.userId || null,
      userName: tryOnData.userName || '',
      styleName: tryOnData.styleName || '',
      date: tryOnData.date || new Date().toISOString().slice(0, 10),
      image: tryOnData.image || tryOnData.originalImage || tryOnData.resultImage || '/api/placeholder/300/400',
      originalImage: tryOnData.originalImage || tryOnData.image || '/api/placeholder/300/400',
      resultImage: tryOnData.resultImage || tryOnData.image || '/api/placeholder/300/400',
      accuracy: Number(tryOnData.accuracy || tryOnData.faceShapeConfidence || 90),
      category: tryOnData.category || tryOnData.faceShape || 'Modern',
      faceShape: tryOnData.faceShape || tryOnData.category || '',
      faceShapeConfidence: Number(tryOnData.faceShapeConfidence || tryOnData.accuracy || 0),
      recommendations: Array.isArray(tryOnData.recommendations) ? tryOnData.recommendations : []
    };

    db.tryOns.push(newTryOn);
    saveDb(db);
    return newTryOn;
  },

  delete(id) {
    const db = loadDb();
    db.tryOns = db.tryOns || [];
    const beforeLength = db.tryOns.length;
    db.tryOns = db.tryOns.filter(item => String(item.id) !== String(id));
    if (db.tryOns.length === beforeLength) {
      return false;
    }
    saveDb(db);
    return true;
  }
};

module.exports = TryOnModel;
