require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const connectDB = require('./config/db');
const { initializeSocket } = require('./socket/socket');

const app = express();
const server = http.createServer(app);

app.use(cors({
  origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map(v => v.trim()) : true,
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.get('/', (req, res) => res.status(200).json({ status: 'ok', message: 'Chat API is running' }));
app.use('/api', require('./routes/userRoutes'));
app.use('/api', require('./routes/loginRoutes'));
app.use('/api', require('./routes/profileRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));

app.use((req, res) => res.status(404).json({ message: 'Route not found' }));
app.use((err, req, res, next) => {
  console.error(err);
  const status = err instanceof require('multer').MulterError ? 400 : 500;
  res.status(status).json({ message: err.message || 'Internal server error' });
});

const startServer = async () => {
  try {
    await connectDB();
    initializeSocket(server);
    const port = Number(process.env.PORT) || 5010;
    server.listen(port, () => console.log(`Server running at http://localhost:${port}`));
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

if (require.main === module) startServer();
module.exports = { app, server, startServer };
