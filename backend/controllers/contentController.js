const ContentModel = require('../models/contentModel');

function sendJson(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  });
  res.end(JSON.stringify(data));
}

const ContentController = {
  getHomeContent(req, res) {
    try {
      const homeContent = ContentModel.getHome();
      return sendJson(res, 200, homeContent);
    } catch (err) {
      return sendJson(res, 500, { message: 'Failed to retrieve home page content.', error: err.message });
    }
  },

  getTransformationsContent(req, res) {
    try {
      const transformations = ContentModel.getTransformations();
      return sendJson(res, 200, { transformations });
    } catch (err) {
      return sendJson(res, 500, { message: 'Failed to retrieve transformations content.', error: err.message });
    }
  },

  getPricingContent(req, res) {
    try {
      const pricingContent = ContentModel.getPricing();
      return sendJson(res, 200, pricingContent);
    } catch (err) {
      return sendJson(res, 500, { message: 'Failed to retrieve pricing content.', error: err.message });
    }
  }
};

module.exports = ContentController;
