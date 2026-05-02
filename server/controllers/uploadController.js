import { extractTextFromImage } from '../services/ocrService.js';
import { parseTransactionsMultimodal } from '../services/aiService.js';
import Transaction from '../models/Transaction.js';
import fs from 'fs';

// @desc    Upload image, extract text, and parse transactions
// @route   POST /api/upload
// @access  Private
export const uploadAndProcessImage = async (req, res) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error('Please upload an image file');
    }

    const imagePath = req.file.path;

    // 1. Extract Text using OCR (Gracefully catch and log if it fails, fallback to direct image parsing)
    let rawText = '';
    try {
      rawText = await extractTextFromImage(imagePath);
    } catch (ocrError) {
      console.warn('OCR extraction error, proceeding with multimodal AI fallback:', ocrError.message);
    }

    // 2. Parse Text using AI
    const parsedData = await parseTransactionsMultimodal(rawText, imagePath);

    if (!Array.isArray(parsedData) || parsedData.length === 0) {
      // Clean up file if no transactions found
      fs.unlinkSync(imagePath);
      return res.status(200).json({ message: 'No transactions found', transactions: [] });
    }

    // 3. Save to Database
    const transactionsToSave = parsedData.map(item => ({
      userId: req.user._id,
      merchantName: item.merchantName || 'Unknown',
      amount: item.amount || 0,
      category: item.category || 'Others',
      paymentApp: item.paymentApp || 'Unknown',
      date: item.date ? new Date(item.date) : new Date(),
      rawText: rawText,
      imagePath: imagePath
    }));

    const savedTransactions = await Transaction.insertMany(transactionsToSave);

    res.status(201).json({
      message: 'Transactions extracted successfully',
      count: savedTransactions.length,
      transactions: savedTransactions
    });

  } catch (error) {
    // Attempt to clean up file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: error.message });
  }
};
