const http = require('http');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);
const { isDbConnected } = require('./utils/dbUtils');
app.use((req, res, next) => {
  if (!isDbConnected()) {
    res.setHeader('X-Database-Status', 'offline');
  }
  next();
});

const authRoutes = require('./routes/authRoutes');
const boardRoutes = require('./routes/boardRoutes');
const taskRoutes = require('./routes/taskRoutes');
const teamRoutes = require('./routes/teamRoutes');
const userRoutes = require('./routes/userRoutes');
const activityRoutes = require('./routes/activityRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const globalActivityRoutes = require('./routes/globalActivityRoutes');
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/boards', boardRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/teams', teamRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/boards/:boardId/activities', activityRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/activities', globalActivityRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'CollabBoard API is running',
  });
});

app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API Route not found',
  });
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  app.use((req, res) => {
    res.sendFile(path.resolve(__dirname, '../dist', 'index.html'));
  });
}
app.use(errorHandler);

const server = http.createServer(app);
const { initSocket } = require('./socket');
initSocket(server);

const startServer = async () => {
  await connectDB();

  server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`[Socket.io] WebSocket server attached`);
  });
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = app;