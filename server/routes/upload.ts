import { RequestHandler } from "express";
import { ApiResponse } from "@shared/types";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
  }
});

// File filter for audio and image files
const fileFilter = (req: any, file: any, cb: any) => {
  const allowedMimes = [
    // Audio formats
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'audio/mp3',
    'audio/x-wav',
    'audio/vnd.wav',
    // Image formats
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only audio (MP3, WAV, OGG) and image (JPG, PNG, WebP) files are allowed.'), false);
  }
};

// Configure multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// POST /api/upload - Upload audio or image file
export const uploadFile: RequestHandler = (req, res) => {
  try {
    if (!req.file) {
      const response: ApiResponse<null> = {
        success: false,
        error: "No file uploaded",
      };
      return res.status(400).json(response);
    }

    // In production, you would upload to a CDN/cloud storage
    // For now, we'll create a local URL
    const fileUrl = `/uploads/${req.file.filename}`;

    const response: ApiResponse<{ url: string; filename: string; size: number }> = {
      success: true,
      data: {
        url: fileUrl,
        filename: req.file.filename,
        size: req.file.size,
      },
      message: "File uploaded successfully",
    };
    
    res.json(response);
  } catch (error) {
    console.error('Upload error:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: "File upload failed",
    };
    res.status(500).json(response);
  }
};

// GET /uploads/:filename - Serve uploaded files
export const serveFile: RequestHandler = (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(process.cwd(), 'uploads', filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: "File not found",
      });
    }

    // Set appropriate headers based on file type
    const extension = path.extname(filename).toLowerCase();
    const mimeTypes: { [key: string]: string } = {
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
      '.ogg': 'audio/ogg',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.gif': 'image/gif',
    };

    const mimeType = mimeTypes[extension] || 'application/octet-stream';
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('File serve error:', error);
    res.status(500).json({
      success: false,
      error: "Failed to serve file",
    });
  }
};

// DELETE /api/upload/:filename - Delete uploaded file
export const deleteFile: RequestHandler = (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(process.cwd(), 'uploads', filename);
    
    if (!fs.existsSync(filePath)) {
      const response: ApiResponse<null> = {
        success: false,
        error: "File not found",
      };
      return res.status(404).json(response);
    }

    fs.unlinkSync(filePath);

    const response: ApiResponse<null> = {
      success: true,
      message: "File deleted successfully",
    };
    res.json(response);
  } catch (error) {
    console.error('File delete error:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: "Failed to delete file",
    };
    res.status(500).json(response);
  }
};