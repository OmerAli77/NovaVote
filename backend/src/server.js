const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Trust proxy for correct IP detection
app.set('trust proxy', true);

// CORS Configuration for network access
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Import routes
const electionRoutes = require('./routes/elections');
const voteRoutes = require('./routes/votes');
const authRoutes = require('./routes/auth');
const auditRoutes = require('./routes/audit');
const adminRoutes = require('./routes/admin');

// Use routes
app.use('/api/elections', electionRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'NovaVote Backend API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      message: 'Route not found',
      status: 404
    }
  });
});

// Start server
app.listen(PORT, HOST, () => {
  console.log(`🚀 NovaVote Backend Server running on http://${HOST}:${PORT}`);
  console.log(`📡 API endpoint: http://localhost:${PORT}/api`);
  console.log(`🌐 Network access: http://<your-ip>:${PORT}/api`);
  console.log(`🔗 Blockchain RPC: ${process.env.BLOCKCHAIN_RPC_URL}`);
  console.log(`\n💡 To access from other devices, use your computer's IP address`);
});

module.exports = app;
