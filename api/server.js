const http = require('http');

require('dotenv').config();
const port = process.env.DOMAIN_PORT || 8080;

const app = require('./app');
const server = http.createServer(app);

server.listen(port);
