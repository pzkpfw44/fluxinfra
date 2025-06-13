// backend/server.js
// Complete server setup with Flux monitoring integration

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files (for serving HTML test files)
app.use(express.static(path.join(__dirname, '../frontend/public')));

// Import routes
const fluxMonitoringRoutes = require('./routes/flux-monitoring.routes');

// Your existing routes (if any)
try {
  // Try to load your existing routes if they exist
  const existingRoutes = [
    './routes/ai-configuration.routes',
    './routes/ai-content-studio.routes',
    './routes/analytics.routes',
    './routes/branding-settings.routes',
    './routes/clarity-engine.routes',
    './routes/company-library.routes',
    './routes/dashboard-analytics.routes',
    './routes/data-connections.routes',
    './routes/data-source-analysis.routes',
    './routes/enhanced-chat.routes',
    './routes/knowledge-feed.routes',
    './routes/pulse-one.routes',
    './routes/secure-upload.routes',
    './routes/security-test.routes',
    './routes/settings.routes',
    './routes/smart-rag.routes'
  ];

  existingRoutes.forEach(routePath => {
    try {
      const route = require(routePath);
      const routeName = path.basename(routePath, '.routes.js');
      app.use(`/api/${routeName}`, route);
      console.log(`✅ Loaded route: /api/${routeName}`);
    } catch (err) {
      // Route doesn't exist, skip it
      console.log(`⚠️  Route not found: ${routePath}`);
    }
  });
} catch (error) {
  console.log('ℹ️  Loading existing routes (some may not exist yet)');
}

// Flux monitoring routes (NEW)
app.use('/api/flux-monitoring', fluxMonitoringRoutes);

// Basic health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// Serve HTML test files
app.get('/test', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/flux-test.html'));
});

app.get('/cockpit', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/flux-cockpit.html'));
});

// Catch-all for frontend routing (if using React Router)
app.get('*', (req, res) => {
  // If this is an API request, return 404
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      success: false,
      error: 'API endpoint not found',
      path: req.path
    });
  }
  
  // For non-API requests, you might want to serve your React app
  // res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
  res.json({
    message: 'Flux Infrastructure Cockpit Backend',
    endpoints: {
      health: '/api/health',
      fluxMonitoring: '/api/flux-monitoring/*',
      test: '/test',
      cockpit: '/cockpit'
    }
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not found',
    path: req.path
  });
});

// Start server
const PORT = process.env.PORT || 16127;

app.listen(PORT, () => {
  console.log('\n🚀 ===============================================');
  console.log(`   Flux Infrastructure Cockpit Backend`);
  console.log('🚀 ===============================================');
  console.log(`📡 Server running on: http://localhost:${PORT}`);
  console.log(`🔧 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📊 Flux monitoring: http://localhost:${PORT}/api/flux-monitoring/health`);
  console.log(`🧪 Test page: http://localhost:${PORT}/test`);
  console.log(`⚡ Cockpit: http://localhost:${PORT}/cockpit`);
  console.log('🚀 ===============================================\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

module.exports = app;