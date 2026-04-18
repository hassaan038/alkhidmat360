import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { ApiError } from '../utils/ApiResponse.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve uploads dir: server/uploads/qurbani
const qurbaniUploadDir = path.resolve(__dirname, '../../uploads/qurbani');
const skinPickupUploadDir = path.resolve(__dirname, '../../uploads/skin-pickup');
const paymentUploadDir = path.resolve(__dirname, '../../uploads/payments');

// Ensure directories exist
for (const dir of [qurbaniUploadDir, skinPickupUploadDir, paymentUploadDir]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
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

// ============================================
// SKIN PICKUP HOUSE PHOTO UPLOAD
// ============================================

const skinPickupStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, skinPickupUploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `skin-pickup-${uniqueSuffix}${ext}`);
  },
});

export const uploadSkinPickupPhoto = multer({
  storage: skinPickupStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
});

// ============================================
// PAYMENT SCREENSHOT UPLOAD (qurbani booking, fitrana, mark-paid)
// ============================================

const paymentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, paymentUploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `payment-${uniqueSuffix}${ext}`);
  },
});

export const uploadPaymentScreenshot = multer({
  storage: paymentStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
});

export default {
  uploadQurbaniPhoto,
  uploadSkinPickupPhoto,
  uploadPaymentScreenshot,
};
