import express from 'express';
import { protect } from '../middleware/auth.js';
import { getAiInsights } from '../controllers/insightController.js';

const router = express.Router();

router.route('/').get(protect, getAiInsights);

export default router;
