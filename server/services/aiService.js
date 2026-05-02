import Groq from 'groq-sdk';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const parseTransactionsMultimodal = async (rawText, imagePath) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const prompt = `
  You are an expert financial data extraction AI.
  Analyze both the raw OCR text extracted from the payment screenshot and the screenshot image itself.
  
  Instructions:
  1. Rely on the visual screenshot as the ground truth. The OCR text is provided for additional context.
  2. Identify ONLY real, finalized transactions.
  3. Explicitly ignore ads, cashback rewards, account balances, notifications, promotional banners, and other UI elements.
  4. Correct OCR mistakes intelligently, especially Indian currency symbols/values (e.g. ₹, Rs.) and merchant names.
  5. Extract the merchant name, exact amount, transaction category, payment app name (e.g. GPay, PhonePe, Paytm, or bank app), and date.
  
  OCR Text Context:
  "${rawText}"

  Return ONLY a valid JSON array of objects with these keys. No other conversational text, explanations, or markdown.
  Keys:
  - merchantName: string
  - amount: number (float or integer, do not include symbols)
  - category: string (Must be exactly one of: "Food", "Shopping", "Bills", "Travel", "Entertainment", "Healthcare", "Recharge", "Others")
  - paymentApp: string (e.g., "GPay", "PhonePe", "Paytm", or "Bank App")
  - date: ISO 8601 string (e.g., YYYY-MM-DDTHH:mm:ss.sssZ, or current date if year/time is missing)

  If no finalized transactions are found, return an empty array: []
  `;

  try {
    const contents = [{ text: prompt }];

    if (imagePath && fs.existsSync(imagePath)) {
      const mimeType = path.extname(imagePath).toLowerCase() === '.png' ? 'image/png' : 'image/jpeg';
      const imageBase64 = fs.readFileSync(imagePath).toString('base64');
      contents.push({
        inlineData: {
          data: imageBase64,
          mimeType
        }
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents
    });

    const responseContent = response.text || '[]';
    const jsonString = responseContent.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('AI Multimodal Parsing Error:', error);
    throw new Error('Failed to parse transactions using multimodal AI');
  }
};

export const generateInsights = async (transactions) => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not configured');
  }
  
  const prompt = `
  Analyze these recent transactions and provide 4-5 bullet points of financial insights or advice.
  Keep it concise, actionable, and focus on spending patterns.
  Return only a JSON array of strings (each string is one insight).
  
  Transactions:
  ${JSON.stringify(transactions)}
  `;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.5,
    });

    const responseContent = chatCompletion.choices[0]?.message?.content || '[]';
    const jsonString = responseContent.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('AI Insights Error:', error);
    return ['Unable to generate insights at this time.'];
  }
}
