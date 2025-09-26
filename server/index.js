import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Starting FlexiPDF server...');

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3002',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
import fs from 'fs';
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Try to import PDF routes with error handling
try {
  const { default: pdfRoutes } = await import('./routes/pdfRoutes.js');
  app.use('/api/pdf', pdfRoutes);
  console.log('✅ PDF routes loaded successfully');
} catch (error) {
  console.error('❌ Error loading PDF routes:', error.message);
  // Create a fallback route
  app.use('/api/pdf', (req, res) => {
    res.status(503).json({ 
      success: false, 
      message: 'PDF services temporarily unavailable',
      error: 'PDF routes failed to load'
    });
  });
}

// Add health route for API
app.get('/api/health', (req, res) => {
  console.log('Health check requested');
  res.json({ status: 'FlexiPDF API is running', timestamp: new Date().toISOString() });
});

// Serve static files from client/dist
const clientDistPath = path.join(__dirname, '../client/dist');
console.log('Serving static files from:', clientDistPath);
console.log('Client dist exists:', fs.existsSync(clientDistPath));

if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  
  // Handle React Router - serve index.html for all non-API routes
  app.get('*', (req, res) => {
    // Don't serve index.html for API routes
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  console.warn('Client dist directory not found:', clientDistPath);
  app.get('/', (req, res) => {
    res.send('FlexiPDF API is running - Frontend build not found');
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

// Start server
const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server is running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:3001'}`);
  console.log(`📁 Static files served from: ${clientDistPath}`);
  console.log(`🚀 Visit: ${process.env.NODE_ENV === 'production' ? 'https://flexipdf-9frt.onrender.com' : `http://localhost:${PORT}`}`);
});

// Handle server errors
server.on('error', (err) => {
  console.error('❌ Server error:', err);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});