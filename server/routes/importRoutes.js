import express from 'express';
import multer from 'multer';
import fs from 'fs';
import { protect } from '../middleware/auth.js';
import Transaction from '../models/Transaction.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Auto-map headers and columns from statements
const mapHeaders = (headers) => {
  const mapping = {
    date: -1,
    merchantName: -1,
    amount: -1,
    category: -1,
    paymentApp: -1
  };

  headers.forEach((h, idx) => {
    const clean = h.trim().toLowerCase();
    if (clean.includes('date')) mapping.date = idx;
    else if (clean.includes('merchant') || clean.includes('name') || clean.includes('description') || clean.includes('payee')) mapping.merchantName = idx;
    else if (clean.includes('amount') || clean.includes('value') || clean.includes('price')) mapping.amount = idx;
    else if (clean.includes('category') || clean.includes('type')) mapping.category = idx;
    else if (clean.includes('app') || clean.includes('method') || clean.includes('mode')) mapping.paymentApp = idx;
  });

  return mapping;
};

router.post('/csv', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const csvContent = fs.readFileSync(req.file.path, 'utf8');
    fs.unlinkSync(req.file.path); // clean up

    const lines = csvContent.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
    if (lines.length < 2) {
      return res.status(400).json({ message: 'Invalid or empty CSV statement' });
    }

    // Attempt to split by comma or tab or semicolon
    let delimiter = ',';
    if (lines[0].includes('\t')) delimiter = '\t';
    else if (lines[0].includes(';')) delimiter = ';';

    const parseCSVRow = (row) => {
      // Correct CSV parsing to handle quoted values containing the delimiter
      const values = [];
      let inQuotes = false;
      let currentValue = '';

      for (let i = 0; i < row.length; i++) {
        const char = row[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === delimiter && !inQuotes) {
          values.push(currentValue.trim());
          currentValue = '';
        } else {
          currentValue += char;
        }
      }
      values.push(currentValue.trim());
      return values;
    };

    const headers = parseCSVRow(lines[0]);
    const mapping = mapHeaders(headers);

    const insertedTransactions = [];

    for (let i = 1; i < lines.length; i++) {
      const rowValues = parseCSVRow(lines[i]);
      if (rowValues.length < 2) continue;

      // Extract values or use defaults
      const rawDate = mapping.date !== -1 ? rowValues[mapping.date] : null;
      const date = rawDate ? new Date(rawDate) : new Date();
      
      const merchantName = mapping.merchantName !== -1 ? rowValues[mapping.merchantName] : 'General Merchant';
      const rawAmount = mapping.amount !== -1 ? rowValues[mapping.amount] : '0';
      const amount = parseFloat(rawAmount.replace(/[^0-9.-]+/g, '')) || 0;
      
      const category = mapping.category !== -1 ? rowValues[mapping.category] : 'Others';
      const paymentApp = mapping.paymentApp !== -1 ? rowValues[mapping.paymentApp] : 'Imported';

      if (amount <= 0 || !merchantName) continue;

      const tx = await Transaction.create({
        userId: req.user._id,
        merchantName,
        amount,
        category,
        date: isNaN(date.getTime()) ? new Date() : date,
        paymentApp,
        notes: 'Bulk imported via CSV'
      });
      insertedTransactions.push(tx);
    }

    res.status(201).json({
      message: `Successfully imported ${insertedTransactions.length} transactions.`,
      count: insertedTransactions.length,
      transactions: insertedTransactions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
