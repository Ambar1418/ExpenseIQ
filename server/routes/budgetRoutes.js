import express from 'express';
import { protect } from '../middleware/auth.js';
import { getBudgets, setBudget } from '../controllers/budgetController.js';

const router = express.Router();

router.route('/')
  .get(protect, getBudgets)
  .post(protect, setBudget);

export default router;
