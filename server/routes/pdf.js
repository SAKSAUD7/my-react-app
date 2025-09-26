import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'image/jpeg',
      'image/png'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, Word, Excel, PowerPoint, and image files are allowed.'));
    }
  }
});

// Helper function to delete file after 10 minutes
const scheduleFileDeletion = (filePath) => {
  setTimeout(() => {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }, 10 * 60 * 1000); // 10 minutes
};

// PDF to Word conversion
router.post('/to-word', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // TODO: Implement PDF to Word conversion using Cloudmersive API
    // For now, just return the uploaded file info
    scheduleFileDeletion(req.file.path);
    
    res.json({
      success: true,
      message: 'File uploaded successfully',
      file: {
        originalname: req.file.originalname,
        filename: req.file.filename,
        path: req.file.path
      }
    });
  } catch (error) {
    console.error('Error in PDF to Word conversion:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Merge PDFs
router.post('/merge', upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length < 2) {
      return res.status(400).json({ success: false, message: 'At least 2 PDF files are required' });
    }

    // TODO: Implement PDF merging using Cloudmersive API
    // For now, just return the uploaded files info
    req.files.forEach(file => scheduleFileDeletion(file.path));
    
    res.json({
      success: true,
      message: 'Files uploaded successfully',
      files: req.files.map(file => ({
        originalname: file.originalname,
        filename: file.filename,
        path: file.path
      }))
    });
  } catch (error) {
    console.error('Error in PDF merge:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add more routes for other PDF operations...

export default router; 