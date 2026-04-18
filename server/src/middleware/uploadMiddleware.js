import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { ApiError } from '../utils/ApiResponse.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve uploads dir: server/uploads/qurbani
const qurbaniUploadDir = path.resolve(__dirname, '../../uploads/qurbani');

// Ensure directory exists
if (!fs.existsSync(qurbaniUploadDir)) {
  fs.mkdirSync(qurbaniUploadDir, { recursive: true });
}

// ============================================
// QURBANI LISTING PHOTO UPLOAD
// ============================================

const qurbaniStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, qurbaniUploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `qurbani-${uniqueSuffix}${ext}`);
  },
});

const imageFileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith('image/')) {
    return cb(new ApiError(400, 'Only image files are allowed'), false);
  }
  cb(null, true);
};

export const uploadQurbaniPhoto = multer({
  storage: qurbaniStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
});

export default {
  uploadQurbaniPhoto,
};
