const express = require('express');
const { createServer } = require('http');

const app = express();
const server = createServer(app);

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

const PORT = 5000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Minimal server running on port ${PORT}`);
});

server.on('error', (error) => {
  console.error('Server error:', error);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
  process.exit(1);
});