const { loadDb, saveDb } = require('./dbModel');

const ServiceModel = {
  getAll() {
    const db = loadDb();
    return db.services || [];
  },

  getById(id) {
    const db = loadDb();
    return (db.services || []).find(s => String(s.id) === String(id)) || null;
  },

  create(data) {
    const db = loadDb();
    const id = data.id || (db.services?.length ? Math.max(...db.services.map(s => Number(s.id) || 0)) + 1 : 1);
    const newService = { id, ...data };
    db.services = db.services || [];
    db.services.push(newService);
    saveDb(db);
    return newService;
  },

  update(id, data) {
    const db = loadDb();
    db.services = db.services || [];
    const index = db.services.findIndex(s => String(s.id) === String(id));
    if (index === -1) return null;
    const updated = { ...db.services[index], ...data, id: db.services[index].id };
    db.services[index] = updated;
    saveDb(db);
    return updated;
  },

  delete(id) {
    const db = loadDb();
    db.services = db.services || [];
    const before = db.services.length;
    db.services = db.services.filter(s => String(s.id) !== String(id));
    if (db.services.length === before) return false;
    saveDb(db);
    return true;
  }
};

module.exports = ServiceModel;
