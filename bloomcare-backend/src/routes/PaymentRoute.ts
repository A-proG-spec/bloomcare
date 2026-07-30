// src/routes/PaymentRoute.ts
import { Router } from 'express';
import paymentController from '../controllers/paymentController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = Router();

// ===== Webhook (no authentication, raw body handled in app.ts) =====
router.post('/stripe-webhook', paymentController.webhook);

// ===== All other routes require authentication =====
router.use(authenticate);

// Initialize Stripe payment
router.post('/initialize', paymentController.initializePayment);

// Verify payment
router.get('/verify', paymentController.verifyPayment);

// Get payment status
router.get('/status/:orderId', paymentController.getPaymentStatus);

// ===== Admin only routes =====
router.get('/stats', authorize('admin'), paymentController.getPaymentStats);

export default router;