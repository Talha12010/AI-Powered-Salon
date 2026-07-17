const { loadDb, saveDb } = require('./dbModel');

function getNextId(bookings) {
  const numericIds = bookings
    .map(b => {
      const match = String(b.id || '').match(/^BK(\d+)$/);
      return match ? Number(match[1]) : 0;
    });
  const max = Math.max(0, ...numericIds);
  return `BK${String(max + 1).padStart(3, '0')}`;
}

const BookingModel = {
  getAll() {
    const db = loadDb();
    return db.bookings || [];
  },

  getById(id) {
    const db = loadDb();
    return (db.bookings || []).find(booking => String(booking.id) === String(id)) || null;
  },

  create(bookingData) {
    const db = loadDb();
    db.bookings = db.bookings || [];

    const newBooking = {
      id: bookingData.id || getNextId(db.bookings),
      user: bookingData.user || '',
      salon: bookingData.salon || 'Elite Cuts Studio',
      service: bookingData.service || '',
      date: bookingData.date || new Date().toISOString().slice(0, 10),
      time: bookingData.time || '10:00 AM',
      amount: Number(bookingData.amount || bookingData.price || 0),
      price: Number(bookingData.price || bookingData.amount || 0),
      status: bookingData.status || 'Pending',
      stylist: bookingData.stylist || 'John Smith',
      rating: bookingData.rating !== undefined ? bookingData.rating : null,
      image: bookingData.image || '/api/placeholder/100/100'
    };

    db.bookings.push(newBooking);
    saveDb(db);
    return newBooking;
  },

  update(id, bookingData) {
    const db = loadDb();
    db.bookings = db.bookings || [];
    const index = db.bookings.findIndex(booking => String(booking.id) === String(id));
    if (index === -1) {
      return null;
    }

    const current = db.bookings[index];
    const updated = { ...current };

    if (bookingData.user !== undefined) updated.user = bookingData.user;
    if (bookingData.salon !== undefined) updated.salon = bookingData.salon;
    if (bookingData.service !== undefined) updated.service = bookingData.service;
    if (bookingData.date !== undefined) updated.date = bookingData.date;
    if (bookingData.time !== undefined) updated.time = bookingData.time;
    if (bookingData.amount !== undefined) {
      updated.amount = Number(bookingData.amount);
      updated.price = Number(bookingData.amount);
    }
    if (bookingData.price !== undefined) {
      updated.price = Number(bookingData.price);
      updated.amount = Number(bookingData.price);
    }
    if (bookingData.status !== undefined) updated.status = bookingData.status;
    if (bookingData.stylist !== undefined) updated.stylist = bookingData.stylist;
    if (bookingData.rating !== undefined) updated.rating = bookingData.rating;
    if (bookingData.image !== undefined) updated.image = bookingData.image;

    db.bookings[index] = updated;
    saveDb(db);
    return updated;
  },

  delete(id) {
    const db = loadDb();
    db.bookings = db.bookings || [];
    const beforeLength = db.bookings.length;
    db.bookings = db.bookings.filter(booking => String(booking.id) !== String(id));
    if (db.bookings.length === beforeLength) {
      return false;
    }
    saveDb(db);
    return true;
  }
};

module.exports = BookingModel;
