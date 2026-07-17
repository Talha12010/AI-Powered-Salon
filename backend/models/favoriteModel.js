const { loadDb, saveDb } = require('./dbModel');

function getNextId(items) {
  return items.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
}

const FavoriteModel = {
  getAll() {
    const db = loadDb();
    return db.favorites || [];
  },

  getById(id) {
    const db = loadDb();
    return (db.favorites || []).find(item => String(item.id) === String(id)) || null;
  },

  create(favoriteData) {
    const db = loadDb();
    db.favorites = db.favorites || [];

    const newFavorite = {
      id: favoriteData.id || getNextId(db.favorites),
      styleName: favoriteData.styleName || '',
      category: favoriteData.category || 'Trending',
      image: favoriteData.image || '/api/placeholder/300/300',
      savedDate: favoriteData.savedDate || new Date().toISOString().slice(0, 10),
      matchRate: Number(favoriteData.matchRate || favoriteData.confidence || 90),
      notes: favoriteData.notes || ''
    };

    db.favorites.push(newFavorite);
    saveDb(db);
    return newFavorite;
  },

  delete(id) {
    const db = loadDb();
    db.favorites = db.favorites || [];
    const beforeLength = db.favorites.length;
    db.favorites = db.favorites.filter(item => String(item.id) !== String(id));
    if (db.favorites.length === beforeLength) {
      return false;
    }
    saveDb(db);
    return true;
  }
};

module.exports = FavoriteModel;
