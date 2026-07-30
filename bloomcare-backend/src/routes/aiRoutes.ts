import { Router } from 'express';
import aiController from '../controllers/aiController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// All AI routes require authentication
router.use(authenticate);

// Chat with AI assistant
router.post('/chat', aiController.chat);

// Get medicine information
router.post('/medicine-info', aiController.getMedicineInfo);

// Get health tips
router.get('/health-tips', aiController.getHealthTips);

export default router;