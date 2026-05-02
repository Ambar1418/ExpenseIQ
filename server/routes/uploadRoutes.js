import express from 'express';
import upload from '../middleware/upload.js';
import { protect } from '../middleware/auth.js';
import { uploadAndProcessImage } from '../controllers/uploadController.js';

const router = express.Router();

router.post('/', protect, upload.single('image'), uploadAndProcessImage);

export default router;
