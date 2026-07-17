const http = require('http');
const { router } = require('./controllers/index');

const PORT = Number(process.env.PORT || 5000);

const server = http.createServer((req, res) => {
  router(req, res).catch(error => {
    console.error(error);
    if (!res.headersSent) {
      res.writeHead(500, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
      });
    }
    res.end(JSON.stringify({ message: 'Server error.', reason: error.message }));
  });
});

server.listen(PORT, () => {
  console.log(`StyleAI backend running at http://localhost:${PORT}`);
  console.log('Default admin: admin@styleai.com / Admin@12345');
});
