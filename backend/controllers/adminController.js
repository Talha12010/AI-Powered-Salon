const UserModel = require('../models/userModel');
const ServiceModel = require('../models/serviceModel');
const StyleModel = require('../models/styleModel');
const BookingModel = require('../models/bookingModel');
const { publicUser } = require('../models/dbModel');

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

const AdminController = {
  async getDashboardStats(req, res) {
    try {
      const users = UserModel.getAll();
      const bookings = BookingModel.getAll();
      const services = ServiceModel.getAll();

      const revenue = bookings.reduce((total, booking) => total + Number(booking.amount || booking.price || 0), 0);
      const activeServices = services.filter(item => item.status === 'Active').length;

      const stats = {
        stats: [
          { label: 'Total Users', value: String(users.length), change: '+12.5%', icon: 'users', color: '#6366f1', bgColor: '#e0e7ff' },
          { label: 'Total Bookings', value: String(bookings.length), change: '+23.1%', icon: 'calendar', color: '#10b981', bgColor: '#d1fae5' },
          { label: 'Active Services', value: String(activeServices), change: '+2', icon: 'service', color: '#f59e0b', bgColor: '#fef3c7' },
          { label: 'Revenue', value: `$${revenue.toLocaleString()}`, change: '+18.2%', icon: 'revenue', color: '#ef4444', bgColor: '#fee2e2' }
        ],
        recentBookings: bookings.slice(0, 5),
        recentUsers: users.slice(-5).reverse().map(publicUser)
      };

      return sendJson(res, 200, stats);
    } catch (err) {
      return sendJson(res, 500, { message: 'Failed to load dashboard stats.', error: err.message });
    }
  },

  async getReportsSummary(req, res) {
    try {
      const users = UserModel.getAll();
      const bookings = BookingModel.getAll();
      const services = ServiceModel.getAll();

      const revenue = bookings.reduce((total, booking) => total + Number(booking.amount || booking.price || 0), 0);
      const activeUsers = users.filter(user => (user.status || 'Active') === 'Active').length;
      const pendingBookings = bookings.filter(booking => booking.status === 'Pending').length;
      const activeServices = services.filter(service => service.status === 'Active').length;

      const reportPayload = {
        summary: {
          totalUsers: users.length,
          activeUsers,
          totalBookings: bookings.length,
          pendingBookings,
          totalServices: services.length,
          activeServices,
          totalRevenue: revenue
        },
        topServices: services
          .map(service => ({
            name: service.name,
            bookings: Number(service.bookings || 0),
            revenue: Number(service.price || 0) * Number(service.bookings || 0),
            growth: Math.max(4, Math.min(30, Math.round(Number(service.popularity || 50) / 5)))
          }))
          .sort((a, b) => b.bookings - a.bookings)
          .slice(0, 5),
        recentBookings: bookings.slice(0, 10),
        recentUsers: users.slice(-10).reverse().map(publicUser)
      };

      return sendJson(res, 200, reportPayload);
    } catch (err) {
      return sendJson(res, 500, { message: 'Failed to load reports.', error: err.message });
    }
  },

  async getUsers(req, res) {
    try {
      const users = UserModel.getAll().map(publicUser);
      return sendJson(res, 200, { users });
    } catch (err) {
      return sendJson(res, 500, { message: 'Failed to retrieve users.', error: err.message });
    }
  },

  async createUser(req, res) {
    try {
      const body = await readJson(req);
      const newUser = UserModel.create(body);
      return sendJson(res, 201, { message: 'Created successfully.', user: publicUser(newUser) });
    } catch (err) {
      return sendJson(res, 400, { message: err.message });
    }
  },

  async updateUser(req, res, id) {
    try {
      const body = await readJson(req);
      const updated = UserModel.update(id, body);
      if (!updated) {
        return sendJson(res, 404, { message: 'User not found.' });
      }
      return sendJson(res, 200, { message: 'Updated successfully.', user: publicUser(updated) });
    } catch (err) {
      return sendJson(res, 400, { message: err.message });
    }
  },

  async deleteUser(req, res, id) {
    try {
      const success = UserModel.delete(id);
      if (!success) {
        return sendJson(res, 404, { message: 'User not found.' });
      }
      return sendJson(res, 200, { message: 'Deleted successfully.' });
    } catch (err) {
      return sendJson(res, 500, { message: 'Failed to delete user.', error: err.message });
    }
  },

  async createService(req, res) {
    try {
      const body = await readJson(req);
      const newService = ServiceModel.create(body);
      return sendJson(res, 201, { message: 'Created successfully.', service: newService });
    } catch (err) {
      return sendJson(res, 400, { message: err.message });
    }
  },

  async updateService(req, res, id) {
    try {
      const body = await readJson(req);
      const updated = ServiceModel.update(id, body);
      if (!updated) {
        return sendJson(res, 404, { message: 'Service not found.' });
      }
      return sendJson(res, 200, { message: 'Updated successfully.', service: updated });
    } catch (err) {
      return sendJson(res, 400, { message: err.message });
    }
  },

  async deleteService(req, res, id) {
    try {
      const success = ServiceModel.delete(id);
      if (!success) {
        return sendJson(res, 404, { message: 'Service not found.' });
      }
      return sendJson(res, 200, { message: 'Deleted successfully.' });
    } catch (err) {
      return sendJson(res, 500, { message: 'Failed to delete service.', error: err.message });
    }
  },

  async createStyle(req, res) {
    try {
      const body = await readJson(req);
      const newStyle = StyleModel.create(body);
      return sendJson(res, 201, { message: 'Created successfully.', style: newStyle });
    } catch (err) {
      return sendJson(res, 400, { message: err.message });
    }
  },

  async updateStyle(req, res, id) {
    try {
      const body = await readJson(req);
      const updated = StyleModel.update(id, body);
      if (!updated) {
        return sendJson(res, 404, { message: 'Style not found.' });
      }
      return sendJson(res, 200, { message: 'Updated successfully.', style: updated });
    } catch (err) {
      return sendJson(res, 400, { message: err.message });
    }
  },

  async deleteStyle(req, res, id) {
    try {
      const success = StyleModel.delete(id);
      if (!success) {
        return sendJson(res, 404, { message: 'Style not found.' });
      }
      return sendJson(res, 200, { message: 'Deleted successfully.' });
    } catch (err) {
      return sendJson(res, 500, { message: 'Failed to delete style.', error: err.message });
    }
  },

  async updateBooking(req, res, id) {
    try {
      const body = await readJson(req);
      const updated = BookingModel.update(id, body);
      if (!updated) {
        return sendJson(res, 404, { message: 'Booking not found.' });
      }
      return sendJson(res, 200, { message: 'Updated successfully.', booking: updated });
    } catch (err) {
      return sendJson(res, 400, { message: err.message });
    }
  },

  async deleteBooking(req, res, id) {
    try {
      const success = BookingModel.delete(id);
      if (!success) {
        return sendJson(res, 404, { message: 'Booking not found.' });
      }
      return sendJson(res, 200, { message: 'Deleted successfully.' });
    } catch (err) {
      return sendJson(res, 500, { message: 'Failed to delete booking.', error: err.message });
    }
  },

  async exportReport(req, res) {
    try {
      const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
      const type = parsedUrl.searchParams.get('type') || 'bookings';
      const format = parsedUrl.searchParams.get('format') || 'json';

      let data = [];
      let headers = [];

      if (type === 'bookings') {
        data = BookingModel.getAll();
        headers = ['id', 'user', 'service', 'date', 'time', 'amount', 'status', 'stylist'];
      } else if (type === 'users') {
        data = UserModel.getAll().map(publicUser);
        headers = ['id', 'username', 'email', 'role', 'status', 'joined', 'name'];
      } else if (type === 'services') {
        data = ServiceModel.getAll();
        headers = ['id', 'name', 'category', 'price', 'duration', 'status', 'bookings'];
      } else if (type === 'styles') {
        data = StyleModel.getAll();
        headers = ['id', 'name', 'category', 'gender', 'popularity', 'status', 'bookings', 'rating'];
      }

      if (format === 'csv') {
        let csvContent = headers.join(',') + '\n';
        data.forEach(item => {
          const row = headers.map(header => {
            const val = item[header] === undefined || item[header] === null ? '' : String(item[header]);
            return `"${val.replace(/"/g, '""')}"`;
          });
          csvContent += row.join(',') + '\n';
        });

        res.writeHead(200, {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename=report_${type}_${Date.now()}.csv`,
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Expose-Headers': 'Content-Disposition'
        });
        return res.end(csvContent);
      } else {
        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename=report_${type}_${Date.now()}.json`,
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Expose-Headers': 'Content-Disposition'
        });
        return res.end(JSON.stringify(data, null, 2));
      }
    } catch (err) {
      res.writeHead(500, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      return res.end(JSON.stringify({ message: 'Failed to export report.', error: err.message }));
    }
  }
};

module.exports = AdminController;
