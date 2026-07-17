const { loadDb, saveDb } = require('./dbModel');

const StyleModel = {
  getAll() {
    const db = loadDb();
    return db.styles || [];
  },

  getById(id) {
    const db = loadDb();
    return (db.styles || []).find(s => String(s.id) === String(id)) || null;
  },

  create(data) {
    const db = loadDb();
    const id = data.id || (db.styles?.length ? Math.max(...db.styles.map(s => Number(s.id) || 0)) + 1 : 1);
    const newStyle = { id, ...data };
    db.styles = db.styles || [];
    db.styles.push(newStyle);
    saveDb(db);
    return newStyle;
  },

  update(id, data) {
    const db = loadDb();
    db.styles = db.styles || [];
    const index = db.styles.findIndex(s => String(s.id) === String(id));
    if (index === -1) return null;
    const updated = { ...db.styles[index], ...data, id: db.styles[index].id };
    db.styles[index] = updated;
    saveDb(db);
    return updated;
  },

  delete(id) {
    const db = loadDb();
    db.styles = db.styles || [];
    const before = db.styles.length;
    db.styles = db.styles.filter(s => String(s.id) !== String(id));
    if (db.styles.length === before) return false;
    saveDb(db);
    return true;
  }
};

module.exports = StyleModel;
