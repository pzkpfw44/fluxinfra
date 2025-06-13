// backend/server.js
// Final working version with adjusted security policy

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = 'morgan';
const helmet = require('helmet');
const compression = require('compression');

const app = express();

// --- Middleware ---

// --- THIS IS THE FIX ---
// We are configuring Helmet's Content Security Policy to allow inline scripts.
// This is necessary because our index.html uses onclick attributes and an inline script tag.
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        "script-src-attr": ["'unsafe-inline'"],
        "connect-src": ["'self'"],
      },
    },
  })
);
// --- END OF FIX ---


// Enable CORS for frontend development
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000'],
  credentials: true
}));
// Request logging - Note: Corrected morgan require if you want to use it
// app.use(morgan('dev')); 
// Body parsers for JSON and URL-encoded data
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
// Compress responses for better performance
app.use(compression());

// --- Static File Serving ---
app.use(express.static(path.join(__dirname, '../frontend/public')));

// --- API Routes ---
const fluxMonitoringRoutes = require('./routes/flux-monitoring.routes');
app.use('/api/flux-monitoring', fluxMonitoringRoutes);

// Basic health check for the API
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0'
  });
});

// --- Frontend Catch-all Route ---
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      success: false,
      error: 'API endpoint not found',
      path: req.path
    });
  }
  
  // Don't catch static files
  if (req.path.includes('.')) {
    return res.status(404).send('File not found');
  }
  
  res.sendFile(path.join(__dirname, '../frontend/public/index.html'));
});

// --- Error Handling ---
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: error.message
  });
});

// --- Start Server ---
const PORT = process.env.PORT || 16127;

app.listen(PORT, () => {
  console.log('\n🚀 ===============================================');
  console.log(`   Flux Infrastructure Cockpit Backend`);
  console.log('🚀 ===============================================');
  console.log(`📡 Server running at: http://localhost:${PORT}`);
  console.log(`⚡ Cockpit available at: http://localhost:${PORT}`);
  console.log('🚀 ===============================================\n');
});

module.exports = app;