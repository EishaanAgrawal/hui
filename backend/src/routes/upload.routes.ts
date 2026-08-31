import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

const router = Router();

router.post('/', (req: Request, res: Response): void => {
  try {
    const { base64Image } = req.body;

    if (!base64Image) {
      res.status(400).json({ message: 'No image data provided' });
      return;
    }

    // Extract the base64 part, e.g. "data:image/jpeg;base64,/9j/4AAQSk..."
    const matches = base64Image.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      res.status(400).json({ message: 'Invalid base64 image format' });
      return;
    }

    const extension = matches[1];
    const imageData = matches[2];
    const buffer = Buffer.from(imageData, 'base64');

    const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${extension}`;
    const uploadDir = path.join(__dirname, '../../public/uploads');

    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, buffer);

    // Return the URL
    const fileUrl = `http://localhost:5000/uploads/${fileName}`;

    res.status(200).json({ url: fileUrl });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ message: 'Failed to upload image' });
  }
});

export default router;
