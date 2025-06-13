// backend/routes/flux-monitoring.routes.js
// UPDATED VERSION - Now includes both Flux Network AND Flux AI monitoring

const express = require('express');
const axios = require('axios');

const router = express.Router();

console.log('🚀 [FluxMonitoring] Routes loading...');

// Import Flux AI monitoring service
const { 
  runAllFluxAiTests, 
  getAccountInfo, 
  getAvailableModels 
} = require('../services/flux-ai-monitoring.service');

// CORRECTED Flux Network API Configuration (existing code)
const FLUX_API_CONFIG = {
  // Main Flux Network APIs - CORRECTED DOMAINS
  networkApi: 'https://api.runonflux.io',           // Changed from .com to .io
  explorerApi: 'https://explorer.runonflux.io/api', // Blockchain explorer API
  statsApi: 'https://stats.runonflux.io/api',       // Network statistics API
  
  // FluxView monitoring
  fluxViewApi: 'https://fluxview.app.runonflux.io',
  
  // Test API key (for testing purposes only)
  testApiKey: 'fnhNDbQFF.NC3uGqauLilhITgcv29XUC9rxtoSTrIq',
  
  // CORRECTED Endpoints based on Flux network structure
  endpoints: {
    // Network status endpoints
    networkInfo: '/daemon/getinfo',
    blockchainInfo: '/daemon/getblockchaininfo',
    nodeCount: '/daemon/getfluxnodecount',
    benchmarks: '/daemon/getbenchmarks',
    
    // Stats API endpoints
    fluxStats: '/fluxinfo',
    networkStats: '/stats',
    
    // Explorer API endpoints
    explorerStats: '/statistics',
    
    // Alternative test endpoints
    generalStatus: '/stats',
    ping: '/ping'
  }
};

console.log('🔑 [FluxMonitoring] API Configuration:');
console.log(`   Network API: ${FLUX_API_CONFIG.networkApi}`);
console.log(`   Explorer API: ${FLUX_API_CONFIG.explorerApi}`);
console.log(`   Stats API: ${FLUX_API_CONFIG.statsApi}`);
console.log(`   API Key configured: ${FLUX_API_CONFIG.testApiKey ? 'YES' : 'NO'}`);

// UPDATED Service definitions for Flux Network monitoring (existing code)
const FLUX_NETWORK_TESTS = {
  'Network Status': {
    baseUrl: FLUX_API_CONFIG.networkApi,
    endpoint: '/daemon/getinfo',
    method: 'GET',
    requiresAuth: false,
    testFor: 'network_health',
    description: 'Flux network daemon status and info'
  },
  'Blockchain Info': {
    baseUrl: FLUX_API_CONFIG.networkApi,
    endpoint: '/daemon/getblockchaininfo',
    method: 'GET',
    requiresAuth: false,
    testFor: 'blockchain_info',
    description: 'Blockchain synchronization and status'
  },
  'FluxNode Count': {
    baseUrl: FLUX_API_CONFIG.networkApi,
    endpoint: '/daemon/getfluxnodecount',
    method: 'GET',
    requiresAuth: false,
    testFor: 'node_count',
    description: 'Active FluxNode network count'
  },
  'Network Statistics': {
    baseUrl: FLUX_API_CONFIG.statsApi,
    endpoint: '/fluxinfo',
    method: 'GET',
    requiresAuth: false,
    testFor: 'network_stats',
    description: 'Network-wide statistics and metrics'
  },
  'Explorer Stats': {
    baseUrl: FLUX_API_CONFIG.explorerApi,
    endpoint: '/statistics',
    method: 'GET',
    requiresAuth: false,
    testFor: 'explorer_stats',
    description: 'Blockchain explorer statistics'
  },
  'Benchmark Status': {
    baseUrl: FLUX_API_CONFIG.networkApi,
    endpoint: '/daemon/getbenchmarks',
    method: 'GET',
    requiresAuth: false,
    testFor: 'benchmarks',
    description: 'Node benchmark and performance data'
  }
};

console.log('📋 [FluxMonitoring] Service tests configured:', Object.keys(FLUX_NETWORK_TESTS).length);

// Cache
const cache = new Map();
const CACHE_DURATION = 30000; // 30 seconds

function getCachedData(key) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`💾 [Cache] HIT for ${key}`);
    return cached.data;
  }
  console.log(`❌ [Cache] MISS for ${key}`);
  return null;
}

function setCachedData(key, data) {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
  console.log(`💾 [Cache] SET for ${key}`);
}

// EXISTING FLUX NETWORK FUNCTIONS (keeping all existing code)
async function testFluxEndpoint(baseUrl, endpoint, method = 'GET', requiresAuth = false) {
  const url = `${baseUrl}${endpoint}`;
  console.log(`🧪 [Flux Test] Testing: ${method} ${url}`);
  console.log(`🔐 [Flux Test] Requires auth: ${requiresAuth}`);
  
  try {
    const config = {
      method,
      url,
      timeout: 15000, // Increased timeout
      validateStatus: function (status) {
        return status < 500; // Accept any status under 500
      },
      headers: {
        'User-Agent': 'FluxCockpit/1.0',
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    };

    // Add auth if required and API key available
    if (requiresAuth && FLUX_API_CONFIG.testApiKey) {
      config.headers['Authorization'] = `Bearer ${FLUX_API_CONFIG.testApiKey}`;
      console.log(`🔑 [Flux Test] Added auth header`);
    }

    const startTime = Date.now();
    console.log(`⏱️ [Flux Test] Making request...`);
    const response = await axios(config);
    const responseTime = Date.now() - startTime;

    console.log(`✅ [Flux Test] Response: ${response.status} (${responseTime}ms)`);
    
    // Log response size and type
    const dataSize = response.data ? JSON.stringify(response.data).length : 0;
    console.log(`📦 [Flux Test] Data size: ${dataSize} bytes`);

    // Analyze response
    if (response.status === 200) {
      return {
        success: true,
        functional: true,
        status: response.status,
        responseTime,
        data: response.data,
        error: null,
        dataSize
      };
    } else if (response.status === 401 || response.status === 403) {
      console.log(`🚫 [Flux Test] Authentication error: ${response.status}`);
      return {
        success: false,
        functional: requiresAuth ? 'needs_auth' : true,
        status: response.status,
        responseTime,
        data: null,
        error: 'Authentication required',
        dataSize: 0
      };
    } else if (response.status === 404) {
      console.log(`❌ [Flux Test] Endpoint not found: ${response.status}`);
      return {
        success: false,
        functional: false,
        status: response.status,
        responseTime,
        data: null,
        error: 'Endpoint not found',
        dataSize: 0
      };
    } else {
      console.log(`⚠️ [Flux Test] Unexpected status: ${response.status}`);
      return {
        success: false,
        functional: false,
        status: response.status,
        responseTime,
        data: response.data,
        error: `HTTP ${response.status}`,
        dataSize
      };
    }
  } catch (error) {
    console.log(`💥 [Flux Test] Request failed: ${error.message}`);
    console.log(`💥 [Flux Test] Error code: ${error.code}`);
    
    // Handle specific error types
    let errorMessage = error.message;
    if (error.code === 'ENOTFOUND') {
      errorMessage = 'Domain not found';
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage = 'Connection refused';
    } else if (error.code === 'ETIMEDOUT') {
      errorMessage = 'Request timeout';
    }
    
    return {
      success: false,
      functional: false,
      status: 0,
      responseTime: null,
      data: null,
      error: errorMessage,
      dataSize: 0
    };
  }
}

function analyzeFluxServiceHealth(testName, result) {
  console.log(`🔍 [Health Analysis] Analyzing ${testName}...`);
  
  if (!result.success) {
    console.log(`❌ [Health Analysis] ${testName} failed: ${result.error}`);
    return {
      status: result.functional === 'needs_auth' ? 'operational' : 'failed',
      health: result.functional === 'needs_auth' ? 'healthy' : 'unhealthy',
      message: result.error,
      details: result.status ? `HTTP ${result.status}` : null
    };
  }

  const data = result.data;
  console.log(`📊 [Health Analysis] ${testName} response size: ${result.dataSize} bytes`);
  
  // Enhanced analysis based on Flux network responses
  switch (testName) {
    case 'Network Status':
      if (data && (data.version || data.subversion || data.blocks !== undefined)) {
        console.log(`✅ [Health Analysis] Network daemon is responding`);
        return {
          status: 'operational',
          health: 'healthy',
          message: 'Network daemon is operational',
          details: data.version ? `Version: ${data.version}` : 'Network info available'
        };
      }
      break;

    case 'Blockchain Info':
      if (data && (data.blocks !== undefined || data.chain || data.difficulty !== undefined)) {
        console.log(`✅ [Health Analysis] Blockchain info available`);
        return {
          status: 'operational',
          health: 'healthy',
          message: 'Blockchain synchronized',
          details: data.blocks ? `Block height: ${data.blocks}` : 'Blockchain data available'
        };
      }
      break;

    case 'FluxNode Count':
      if (data && (data.total !== undefined || data.enabled !== undefined || typeof data === 'number')) {
        const nodeCount = data.total || data.enabled || data;
        console.log(`✅ [Health Analysis] FluxNode count: ${nodeCount}`);
        return {
          status: 'operational',
          health: 'healthy',
          message: 'FluxNode network active',
          details: `${nodeCount} nodes active`
        };
      }
      break;

    case 'Network Statistics':
      if (data && (data.nodeCount || data.stats || Array.isArray(data))) {
        console.log(`✅ [Health Analysis] Network statistics available`);
        return {
          status: 'operational',
          health: 'healthy',
          message: 'Network statistics accessible',
          details: 'Statistics data available'
        };
      }
      break;

    case 'Explorer Stats':
      if (data && (data.transactions || data.blocks || data.addresses)) {
        console.log(`✅ [Health Analysis] Explorer statistics available`);
        return {
          status: 'operational',
          health: 'healthy',
          message: 'Blockchain explorer operational',
          details: 'Explorer data accessible'
        };
      }
      break;

    case 'Benchmark Status':
      if (data && (data.status || data.bench || Array.isArray(data))) {
        console.log(`✅ [Health Analysis] Benchmark data available`);
        return {
          status: 'operational',
          health: 'healthy',
          message: 'Node benchmarking operational',
          details: 'Benchmark data available'
        };
      }
      break;
  }

  // If we have data but don't recognize the format
  if (data && Object.keys(data).length > 0) {
    console.log(`⚠️ [Health Analysis] ${testName} responding with unrecognized format`);
    return {
      status: 'degraded',
      health: 'partial',
      message: 'Service responding but data format unclear',
      details: `${Object.keys(data).length} data fields received`
    };
  }

  console.log(`⚠️ [Health Analysis] ${testName} empty or invalid response`);
  return {
    status: 'degraded',
    health: 'partial',
    message: 'Service responding but no valid data',
    details: null
  };
}

// =============================================
// NEW FLUX AI MONITORING ENDPOINTS
// =============================================

// NEW: Main Flux AI health monitoring endpoint
router.get('/flux-ai-health', async (req, res) => {
  console.log('🤖 [FluxAI Health] === STARTING FLUX AI HEALTH CHECK ===');
  console.log('🤖 [FluxAI Health] Request received from:', req.ip);
  
  try {
    const cachedData = getCachedData('flux-ai-health');
    if (cachedData) {
      console.log('🤖 [FluxAI Health] Returning cached data');
      return res.json(cachedData);
    }

    console.log('🤖 [FluxAI Health] Starting fresh Flux AI health check...');
    
    // Run comprehensive Flux AI tests
    const healthResults = await runAllFluxAiTests();
    
    if (healthResults.success) {
      console.log('✅ [FluxAI Health] Health check completed successfully');
      setCachedData('flux-ai-health', healthResults);
    } else {
      console.log('❌ [FluxAI Health] Health check failed');
    }
    
    res.json(healthResults);

  } catch (error) {
    console.error('💥 [FluxAI Health] CRITICAL ERROR:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to test Flux AI health',
      details: error.message,
      serviceType: 'flux-ai'
    });
  }
});

// NEW: Get Flux AI account information
router.get('/flux-ai-account', async (req, res) => {
  console.log('💰 [FluxAI Account] Account info requested');
  
  try {
    const accountInfo = await getAccountInfo();
    res.json(accountInfo);
  } catch (error) {
    console.error('💥 [FluxAI Account] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get account information',
      details: error.message
    });
  }
});

// NEW: Get available Flux AI models
router.get('/flux-ai-models', async (req, res) => {
  console.log('🧠 [FluxAI Models] Models requested');
  
  try {
    const modelsInfo = await getAvailableModels();
    res.json(modelsInfo);
  } catch (error) {
    console.error('💥 [FluxAI Models] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get available models',
      details: error.message
    });
  }
});

// NEW: Clear Flux AI cache
router.post('/flux-ai-refresh', async (req, res) => {
  console.log('🔄 [FluxAI Refresh] Cache refresh requested');
  
  try {
    // Clear relevant cache entries
    cache.delete('flux-ai-health');
    console.log('🗑️ [FluxAI Refresh] Cache cleared');
    
    res.json({
      success: true,
      message: 'Flux AI cache cleared - next request will fetch fresh data',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('💥 [FluxAI Refresh] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to refresh cache',
      details: error.message
    });
  }
});

// =============================================
// EXISTING FLUX NETWORK HEALTH ENDPOINTS (keeping all existing code)
// =============================================

router.get('/flux-network-health', async (req, res) => {
  console.log('🏥 [Flux Health] === STARTING FLUX NETWORK HEALTH CHECK ===');
  console.log('🏥 [Flux Health] Request received from:', req.ip);
  console.log('🏥 [Flux Health] User-Agent:', req.get('User-Agent'));
  
  try {
    const cachedData = getCachedData('flux-network-health');
    if (cachedData) {
      console.log('🏥 [Flux Health] Returning cached data');
      return res.json(cachedData);
    }

    console.log('🏥 [Flux Health] Starting fresh network health check...');
    console.log('🏥 [Flux Health] Testing', Object.keys(FLUX_NETWORK_TESTS).length, 'services');

    // Test all Flux network services in parallel
    const testPromises = Object.entries(FLUX_NETWORK_TESTS).map(async ([serviceName, testConfig]) => {
      console.log(`🧪 [Flux Health] Testing service: ${serviceName}`);
      
      const result = await testFluxEndpoint(
        testConfig.baseUrl,
        testConfig.endpoint,
        testConfig.method,
        testConfig.requiresAuth
      );
      
      const health = analyzeFluxServiceHealth(serviceName, result);
      
      console.log(`📊 [Flux Health] ${serviceName} result: ${health.status} (${health.health})`);
      
      return {
        serviceName,
        ...testConfig,
        result: {
          ...result,
          health
        }
      };
    });

    console.log('⏳ [Flux Health] Waiting for all tests to complete...');
    const testResults = await Promise.all(testPromises);
    console.log('✅ [Flux Health] All tests completed');

    // Analyze overall health
    const healthyServices = testResults.filter(t => t.result.health.health === 'healthy').length;
    const partialServices = testResults.filter(t => t.result.health.health === 'partial').length;
    const failedServices = testResults.filter(t => t.result.health.health === 'unhealthy').length;
    const authRequiredServices = testResults.filter(t => t.result.functional === 'needs_auth').length;

    console.log('📊 [Flux Health] Summary:');
    console.log(`   - Healthy: ${healthyServices}`);
    console.log(`   - Partial: ${partialServices}`);
    console.log(`   - Failed: ${failedServices}`);
    console.log(`   - Auth Required: ${authRequiredServices}`);

    let overallStatus = 'operational';
    if (failedServices > healthyServices) {
      overallStatus = 'degraded';
    } else if (failedServices > 0 || partialServices > 0) {
      overallStatus = 'partial';
    }

    console.log('🎯 [Flux Health] Overall status:', overallStatus);

    const result = {
      success: true,
      overallStatus,
      networkType: 'flux-blockchain-network',
      summary: {
        totalServices: testResults.length,
        healthyServices,
        partialServices,
        failedServices,
        authRequiredServices
      },
      services: testResults.map(test => ({
        name: test.serviceName,
        description: test.description,
        status: test.result.health.status,
        health: test.result.health.health,
        message: test.result.health.message,
        details: test.result.health.details,
        responseTime: test.result.responseTime,
        dataSize: test.result.dataSize,
        requiresAuth: test.requiresAuth,
        endpoint: test.endpoint,
        tested: true
      })),
      lastUpdated: new Date().toISOString(),
      dataSource: 'live-flux-network-testing',
      apis: {
        networkApi: FLUX_API_CONFIG.networkApi,
        explorerApi: FLUX_API_CONFIG.explorerApi,
        statsApi: FLUX_API_CONFIG.statsApi
      }
    };

    console.log('💾 [Flux Health] Caching result');
    setCachedData('flux-network-health', result);
    
    console.log('📤 [Flux Health] Sending response');
    res.json(result);

  } catch (error) {
    console.error('💥 [Flux Health] CRITICAL ERROR:', error);
    console.error('💥 [Flux Health] Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Failed to test Flux network health',
      details: error.message,
      networkType: 'flux-blockchain-network'
    });
  }
});

// =============================================
// LEGACY AND COMPATIBILITY ENDPOINTS
// =============================================

// Legacy endpoint for backward compatibility
router.get('/fluxai-service-health', async (req, res) => {
  console.log('🔄 [Legacy] Legacy FluxAI endpoint called - redirecting to new Flux AI health');
  // Redirect to the new Flux AI health endpoint
  req.url = '/flux-ai-health';
  return router.handle(req, res);
});

// Configuration endpoint
router.post('/flux-configure', async (req, res) => {
  console.log('⚙️ [Flux Config] Configuration request received');
  
  try {
    const { apiKey, testMode } = req.body;

    if (apiKey) {
      console.log('⚙️ [Flux Config] API key provided for testing');
      
      // Clear cache to force retest
      cache.delete('flux-network-health');
      cache.delete('flux-ai-health');
      console.log('⚙️ [Flux Config] Cache cleared');
      
      res.json({
        success: true,
        message: 'Configuration updated',
        note: 'Cache cleared - next health check will use new settings'
      });
    } else {
      console.log('⚙️ [Flux Config] No API key provided');
      res.status(400).json({
        success: false,
        error: 'No configuration changes provided'
      });
    }

  } catch (error) {
    console.error('💥 [Flux Config] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update configuration',
      details: error.message
    });
  }
});

// Integration examples with corrected APIs
router.get('/flux-integration-examples', (req, res) => {
  console.log('📚 [Flux Examples] Integration examples requested');
  
  try {
    const examples = {
      javascript: `// Flux Network JavaScript Integration
const FLUX_NETWORK_API = '${FLUX_API_CONFIG.networkApi}';
const FLUX_STATS_API = '${FLUX_API_CONFIG.statsApi}';

// Get network information
async function getNetworkInfo() {
  const response = await fetch(FLUX_NETWORK_API + '/daemon/getinfo');
  const data = await response.json();
  return data;
}

// Get FluxNode count
async function getFluxNodeCount() {
  const response = await fetch(FLUX_NETWORK_API + '/daemon/getfluxnodecount');
  const count = await response.json();
  return count;
}

// Get network statistics
async function getNetworkStats() {
  const response = await fetch(FLUX_STATS_API + '/fluxinfo');
  const stats = await response.json();
  return stats;
}

// Flux AI Integration
async function getFluxAIHealth() {
  const response = await fetch('/api/flux-monitoring/flux-ai-health');
  const health = await response.json();
  return health;
}`,

      python: `import requests

# Flux Network Python Integration
FLUX_NETWORK_API = "${FLUX_API_CONFIG.networkApi}"
FLUX_STATS_API = "${FLUX_API_CONFIG.statsApi}"

def get_network_info():
    """Get Flux network daemon information"""
    response = requests.get(f"{FLUX_NETWORK_API}/daemon/getinfo")
    return response.json()

def get_fluxnode_count():
    """Get active FluxNode count"""
    response = requests.get(f"{FLUX_NETWORK_API}/daemon/getfluxnodecount")
    return response.json()

def get_flux_ai_health():
    """Get Flux AI service health"""
    response = requests.get("http://localhost:16127/api/flux-monitoring/flux-ai-health")
    return response.json()`,

      curl: `# Flux Network cURL Commands

# Get network daemon information
curl ${FLUX_API_CONFIG.networkApi}/daemon/getinfo

# Get active FluxNode count
curl ${FLUX_API_CONFIG.networkApi}/daemon/getfluxnodecount

# Get Flux AI health
curl http://localhost:16127/api/flux-monitoring/flux-ai-health

# Get Flux AI account info  
curl http://localhost:16127/api/flux-monitoring/flux-ai-account`
    };

    console.log('📚 [Flux Examples] Sending updated examples');
    res.json({
      success: true,
      examples,
      apis: {
        networkApi: FLUX_API_CONFIG.networkApi,
        explorerApi: FLUX_API_CONFIG.explorerApi,
        statsApi: FLUX_API_CONFIG.statsApi,
        fluxAiApi: '/api/flux-monitoring/flux-ai-health'
      },
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('💥 [Flux Examples] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get integration examples',
      details: error.message
    });
  }
});

// =============================================
// UTILITY ENDPOINTS
// =============================================

// Health Check
router.get('/health', (req, res) => {
  console.log('❤️ [Health] Health check requested');
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cache: {
      size: cache.size,
      keys: Array.from(cache.keys())
    },
    apis: {
      networkApi: FLUX_API_CONFIG.networkApi,
      explorerApi: FLUX_API_CONFIG.explorerApi,
      statsApi: FLUX_API_CONFIG.statsApi,
      fluxAiEndpoints: [
        '/flux-ai-health',
        '/flux-ai-account', 
        '/flux-ai-models'
      ]
    }
  });
});

// Debug endpoint
router.get('/debug/config', (req, res) => {
  console.log('🐛 [Debug] Configuration debug requested');
  res.json({
    success: true,
    config: {
      apis: {
        networkApi: FLUX_API_CONFIG.networkApi,
        explorerApi: FLUX_API_CONFIG.explorerApi,
        statsApi: FLUX_API_CONFIG.statsApi,
        fluxViewApi: FLUX_API_CONFIG.fluxViewApi
      },
      endpoints: FLUX_API_CONFIG.endpoints,
      testServices: Object.keys(FLUX_NETWORK_TESTS),
      fluxAiEndpoints: [
        '/flux-ai-health',
        '/flux-ai-account',
        '/flux-ai-models', 
        '/flux-ai-refresh'
      ],
      cache: {
        size: cache.size,
        duration: CACHE_DURATION,
        keys: Array.from(cache.keys())
      }
    },
    timestamp: new Date().toISOString()
  });
});

// Legacy compatibility endpoints
router.get('/ai-status', async (req, res) => {
  console.log('🤖 [Legacy] Legacy AI status endpoint called');
  res.json({
    success: true,
    status: 'redirected',
    message: 'This endpoint has been updated. Use /flux-ai-health for Flux AI monitoring.',
    redirect: '/api/flux-monitoring/flux-ai-health',
    lastUpdated: new Date().toISOString()
  });
});

// Catch-all debug endpoint
router.all('*', (req, res) => {
  console.log(`🐛 [Debug] Unmatched route: ${req.method} ${req.path}`);
  console.log(`🐛 [Debug] Available routes:`);
  console.log(`   - GET  /flux-ai-health (NEW - Flux AI monitoring)`);
  console.log(`   - GET  /flux-ai-account (NEW - Account info)`);
  console.log(`   - GET  /flux-ai-models (NEW - Available models)`);
  console.log(`   - POST /flux-ai-refresh (NEW - Refresh cache)`);
  console.log(`   - GET  /flux-network-health (Flux Network monitoring)`);
  console.log(`   - GET  /fluxai-service-health (legacy compatibility)`);
  console.log(`   - POST /flux-configure`);
  console.log(`   - GET  /flux-integration-examples`);
  console.log(`   - GET  /health`);
  console.log(`   - GET  /debug/config`);
  
  res.status(404).json({
    success: false,
    error: 'Route not found',
    method: req.method,
    path: req.path,
    availableRoutes: [
      'GET /flux-ai-health (NEW)',
      'GET /flux-ai-account (NEW)',
      'GET /flux-ai-models (NEW)',
      'POST /flux-ai-refresh (NEW)',
      'GET /flux-network-health',
      'GET /fluxai-service-health (legacy)',
      'POST /flux-configure',
      'GET /flux-integration-examples',
      'GET /health',
      'GET /debug/config'
    ],
    note: 'New Flux AI endpoints available alongside existing Flux Network monitoring'
  });
});

console.log('✅ [FluxMonitoring] Routes configured successfully');
console.log('📡 [FluxMonitoring] Flux AI endpoints: /flux-ai-health, /flux-ai-account, /flux-ai-models');
console.log('📡 [FluxMonitoring] Flux Network endpoint: /flux-network-health');
console.log('🔄 [FluxMonitoring] Legacy compatibility: /fluxai-service-health');

module.exports = router;