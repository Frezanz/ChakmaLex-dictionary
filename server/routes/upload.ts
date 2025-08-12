import { RequestHandler } from "express";
import multer from "multer";
import { join } from "path";
import { existsSync, mkdirSync } from "fs";
import { ApiResponse } from "@shared/types";

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = join(process.cwd(), "uploads", file.fieldname);
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + "." + file.originalname.split(".").pop());
  },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.fieldname === "audio") {
    // Allow audio files
    if (file.mimetype.startsWith("audio/")) {
      cb(null, true);
    } else {
      cb(new Error("Only audio files are allowed"));
    }
  } else if (file.fieldname === "image") {
    // Allow image files
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  } else {
    cb(new Error("Invalid field name"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Upload audio file
export const uploadAudio: RequestHandler = (req, res) => {
  upload.single("audio")(req, res, (err) => {
    if (err) {
      console.error("Audio upload error:", err);
      return res.status(400).json({
        success: false,
        error: err.message || "Audio upload failed",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No audio file provided",
      });
    }

    // Create URL for the uploaded file
    const fileUrl = `/uploads/audio/${req.file.filename}`;

    const response: ApiResponse<{ url: string }> = {
      success: true,
      data: { url: fileUrl },
      message: "Audio uploaded successfully",
    };

    res.json(response);
  });
};

// Upload image file
export const uploadImage: RequestHandler = (req, res) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      console.error("Image upload error:", err);
      return res.status(400).json({
        success: false,
        error: err.message || "Image upload failed",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No image file provided",
      });
    }

    // Create URL for the uploaded file
    const fileUrl = `/uploads/image/${req.file.filename}`;

    const response: ApiResponse<{ url: string }> = {
      success: true,
      data: { url: fileUrl },
      message: "Image uploaded successfully",
    };

    res.json(response);
  });
};