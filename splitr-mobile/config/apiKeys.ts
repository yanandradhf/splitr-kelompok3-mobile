// API Configuration for OCR Services
// Replace these with your actual API keys

export const API_KEYS = {
  // Google Gemini API (Free tier available)
  // Get your key from: https://makersuite.google.com/app/apikey
  GEMINI_API_KEY: 'AIzaSyBvOyeua-uuMX4NGQxB6F09wlnwLhxtNyc',
  
  // OpenAI API (Paid service)
  // Get your key from: https://platform.openai.com/api-keys
  OPENAI_API_KEY: 'sk-your-openai-api-key-here',
  
  // OCR.space API (Free tier available)
  // Get your key from: https://ocr.space/ocrapi
  OCR_SPACE_API_KEY: 'K87899142388957',
  
  // Google Vision API (Paid service)
  // Get your key from: https://console.cloud.google.com/
  GOOGLE_VISION_API_KEY: 'your-google-vision-api-key-here'
};

export const API_ENDPOINTS = {
  GEMINI: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEYS.GEMINI_API_KEY}`,
  OPENAI: 'https://api.openai.com/v1/chat/completions',
  OCR_SPACE: 'https://api.ocr.space/parse/image',
  GOOGLE_VISION: `https://vision.googleapis.com/v1/images:annotate?key=${API_KEYS.GOOGLE_VISION_API_KEY}`
};

// Configuration for different OCR providers
export const OCR_CONFIG = {
  // Primary provider (free and powerful)
  PRIMARY_PROVIDER: 'gemini' as const,
  
  // Fallback provider (if primary fails)
  FALLBACK_PROVIDER: 'openai' as const,
  
  // Minimum confidence threshold
  MIN_CONFIDENCE: 0.5,
  
  // Maximum retries per provider
  MAX_RETRIES: 2,
  
  // Timeout for API calls (milliseconds)
  API_TIMEOUT: 30000,
  
  // Enable/disable providers
  PROVIDERS: {
    gemini: true,
    openai: false, // Set to true if you have OpenAI API key
    ocrSpace: true,
    googleVision: false // Set to true if you have Google Vision API key
  }
};

// Instructions for getting API keys
export const API_SETUP_INSTRUCTIONS = {
  gemini: {
    name: 'Google Gemini',
    url: 'https://makersuite.google.com/app/apikey',
    free: true,
    description: 'Free tier with generous limits. Best for receipt OCR.'
  },
  openai: {
    name: 'OpenAI GPT-4 Vision',
    url: 'https://platform.openai.com/api-keys',
    free: false,
    description: 'Paid service. Very accurate but costs per request.'
  },
  ocrSpace: {
    name: 'OCR.space',
    url: 'https://ocr.space/ocrapi',
    free: true,
    description: 'Free OCR API with basic text extraction.'
  },
  googleVision: {
    name: 'Google Vision API',
    url: 'https://console.cloud.google.com/',
    free: false,
    description: 'Paid OCR service. Good for text detection.'
  }
};