import { Router, Request, Response } from 'express';
import { uploadImage } from '../cloudinary';

const router = Router();

// POST /api/upload
router.post('/', async (req: Request, res: Response) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    const result = await uploadImage(image);

    if (result.error || !result.secure_url) {
      return res.status(500).json({ error: result.error || 'Failed to upload image' });
    }

    return res.json({ url: result.secure_url });
  } catch (error: any) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: error?.message || 'Failed to upload file' });
  }
});

export default router;
