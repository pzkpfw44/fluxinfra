// backend/config/flux-ai.js
// CORRECT VERSION - Using real FluxAI API endpoints from ai.runonflux.com

const FLUX_AI_CONFIG = {
  // CORRECT Base URL for Flux AI API
  baseUrl: 'https://ai.runonflux.com',
  
  // Pre-configured API key (secure - not exposed to frontend)
  apiKey: 'fnhNDbQFF.NC3uGqauLilhITgcv29XUC9rxtoSTrIq',
  
  // CORRECT FluxAI API endpoints from documentation
  endpoints: {
    chat: '/v1/chat/completions',      // GPT and GPT STREAM
    files: '/v1/chat/files',           // FluxINTEL file operations
    images: '/v1/images/generations'   // FluxONE (assumed endpoint)
  },

  // CORRECT FluxAI services configuration
  services: {
    'FluxGPT': {
      name: 'FluxGPT',
      description: 'Chat with the most advanced AI models',
      endpoint: '/v1/chat/completions',
      method: 'POST',
      requiresAuth: true,
      icon: 'fas fa-comments',
      testPayload: {
        messages: [
          {
            role: 'user',
            content: 'Hello, test connection'
          }
        ]
      }
    },
    'FluxGPT Stream': {
      name: 'FluxGPT Stream',
      description: 'Streaming chat completions',
      endpoint: '/v1/chat/completions',
      method: 'POST',
      requiresAuth: true,
      icon: 'fas fa-stream',
      testPayload: {
        messages: [
          {
            role: 'user',
            content: 'Hello, test streaming'
          }
        ],
        stream: true
      }
    },
    'FluxINTEL': {
      name: 'FluxINTEL',
      description: 'Chat with Your Documents',
      endpoint: '/v1/chat/files',
      method: 'GET',
      requiresAuth: true,
      icon: 'fas fa-file-alt'
    },
    'FluxONE': {
      name: 'FluxONE',
      description: 'Create AI Images in seconds',
      endpoint: '/v1/images/generations',
      method: 'POST',
      requiresAuth: true,
      icon: 'fas fa-image',
      testPayload: {
        prompt: 'A test image',
        model: 'flux-1-schnell'
      }
    }
  }
};

// Helper functions
function getEndpointUrl(endpointKey) {
  const endpoint = FLUX_AI_CONFIG.endpoints[endpointKey];
  if (!endpoint) {
    throw new Error(`Endpoint ${endpointKey} not found`);
  }
  return `${FLUX_AI_CONFIG.baseUrl}${endpoint}`;
}

function getApiKey() {
  return FLUX_AI_CONFIG.apiKey;
}

function getServiceConfig(serviceName) {
  return FLUX_AI_CONFIG.services[serviceName];
}

function getAllServices() {
  return Object.values(FLUX_AI_CONFIG.services);
}

module.exports = {
  ...FLUX_AI_CONFIG,
  getEndpointUrl,
  getApiKey,
  getServiceConfig,
  getAllServices
};