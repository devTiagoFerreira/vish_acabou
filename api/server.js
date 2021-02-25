const http = require('http');
const port = process.env.DOMAIN_PORT || 8080;
const app = require('./app');
const server = http.createServer(app);

server.listen(port);
