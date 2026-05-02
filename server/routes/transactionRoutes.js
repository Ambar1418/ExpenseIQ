import express from 'express';
import { protect } from '../middleware/auth.js';
import { 
  getTransactions, 
  createTransaction, 
  deleteTransaction, 
  updateTransaction, 
  deleteBulkTransactions, 
  clearTransactions 
} from '../controllers/transactionController.js';

const router = express.Router();

router.route('/')
  .get(protect, getTransactions)
  .post(protect, createTransaction)
  .delete(protect, clearTransactions);

router.route('/bulk-delete')
  .post(protect, deleteBulkTransactions);

router.route('/:id')
  .delete(protect, deleteTransaction)
  .put(protect, updateTransaction);

export default router;
