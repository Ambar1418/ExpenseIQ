import tesseract from 'tesseract.js';
import fs from 'fs';

export const extractTextFromImage = async (imagePath) => {
  try {
    if (!fs.existsSync(imagePath)) {
      throw new Error('Image file not found');
    }

    // Recognize text with multi-format fallback
    let text = '';
    if (tesseract && typeof tesseract.recognize === 'function') {
      const result = await tesseract.recognize(imagePath, 'eng');
      text = result?.data?.text || '';
    } else if (tesseract && tesseract.default && typeof tesseract.default.recognize === 'function') {
      const result = await tesseract.default.recognize(imagePath, 'eng');
      text = result?.data?.text || '';
    }

    return text;
  } catch (error) {
    console.error('OCR Error:', error);
    throw new Error('Failed to extract text from image');
  }
};
