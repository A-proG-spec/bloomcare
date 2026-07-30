import { Request, Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middleware/authMiddleware';
import aiService from '../services/aiService';
import { logger } from '../config/logger';

const chatSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  history: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string(),
    })
  ).optional().default([]),
});

const medicineInfoSchema = z.object({
  medicineName: z.string().min(1, 'Medicine name is required'),
});

class AIController {
  /**
   * Chat with AI assistant
   * POST /api/ai/chat
   */
  async chat(req: AuthRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
      }

      const validatedData = chatSchema.parse((req as Request).body);
      const { message, history } = validatedData;

      // Build messages array
      const messages = [
        ...history.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        })),
        { role: 'user' as const, content: message },
      ];

      const response = await aiService.generateResponse(messages);

      return res.status(200).json({
        success: true,
        data: {
          response,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          errors: error.issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }

      logger.error('Error in AI chat:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to process chat request',
        error: error.message,
      });
    }
  }

  /**
   * Get medicine information
   * POST /api/ai/medicine-info
   */
  async getMedicineInfo(req: AuthRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
      }

      const validatedData = medicineInfoSchema.parse((req as Request).body);
      const { medicineName } = validatedData;

      const response = await aiService.getMedicineInfo(medicineName);

      return res.status(200).json({
        success: true,
        data: {
          medicineName,
          response,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          errors: error.issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }

      logger.error('Error getting medicine info:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get medicine information',
        error: error.message,
      });
    }
  }

  /**
   * Get health tips
   * GET /api/ai/health-tips
   */
  async getHealthTips(req: AuthRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
      }

      const messages = [
        { role: 'user' as const, content: 'Give me some general health and wellness tips for maintaining a healthy lifestyle.' },
      ];

      const response = await aiService.generateResponse(messages);

      return res.status(200).json({
        success: true,
        data: {
          tips: response,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error: any) {
      logger.error('Error getting health tips:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get health tips',
        error: error.message,
      });
    }
  }
}

export default new AIController();