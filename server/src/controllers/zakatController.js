import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import * as zakatService from '../services/zakatService.js';

// ============================================
// PAYMENT (DONOR)
// ============================================

export const createPayment = asyncHandler(async (req, res) => {
  const userId = req.session.userId;
  const payload = { ...req.body };
  if (req.file) {
    payload.paymentScreenshotUrl = `/uploads/payments/${req.file.filename}`;
  }
  const payment = await zakatService.createZakatPayment(userId, payload);
  res.status(201).json(new ApiResponse(201, { payment }, 'Zakat payment recorded'));
});

export const getMyPayments = asyncHandler(async (req, res) => {
  const userId = req.session.userId;
  const payments = await zakatService.getUserZakatPayments(userId);
  res.json(new ApiResponse(200, { payments }, 'Your zakat payments fetched'));
});

export const adminListPayments = asyncHandler(async (req, res) => {
  const payments = await zakatService.getAllZakatPayments();
  res.json(new ApiResponse(200, { payments }, 'Zakat payments fetched'));
});

export const adminUpdatePaymentStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const payment = await zakatService.updateZakatPaymentStatus(id, status);
  res.json(new ApiResponse(200, { payment }, 'Zakat payment status updated'));
});

// ============================================
// APPLICATION (BENEFICIARY)
// ============================================

export const createApplication = asyncHandler(async (req, res) => {
  const userId = req.session.userId;
  const payload = { ...req.body };
  if (req.file) {
    payload.cnicDocumentUrl = `/uploads/zakat-docs/${req.file.filename}`;
  }
  const application = await zakatService.createZakatApplication(userId, payload);
  res.status(201).json(
    new ApiResponse(201, { application }, 'Zakat application submitted')
  );
});

export const getMyApplications = asyncHandler(async (req, res) => {
  const userId = req.session.userId;
  const applications = await zakatService.getUserZakatApplications(userId);
  res.json(new ApiResponse(200, { applications }, 'Your zakat applications fetched'));
});

export const adminListApplications = asyncHandler(async (req, res) => {
  const applications = await zakatService.getAllZakatApplications();
  res.json(new ApiResponse(200, { applications }, 'Zakat applications fetched'));
});

export const adminUpdateApplicationStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const application = await zakatService.updateZakatApplicationStatus(id, status);
  res.json(new ApiResponse(200, { application }, 'Zakat application status updated'));
});
