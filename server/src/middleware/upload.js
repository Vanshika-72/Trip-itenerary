import multer from 'multer';
import path from 'path';
import fs from 'fs';
import cloudinary, { isCloudinaryConfigured } from '../config/cloudinary.js';

// Multer memory storage so we can stream to Cloudinary or write to local disk
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'), false);
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter,
});

/**
 * Uploads buffer to Cloudinary if credentials exist, otherwise saves to local /uploads directory
 */
export const processImageUpload = async (file) => {
  if (!file) return null;

  // 1. If Cloudinary is configured, upload via Cloudinary stream
  if (isCloudinaryConfigured()) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'tripmate',
          resource_type: 'image',
          transformation: [{ width: 1200, height: 600, crop: 'limit', quality: 'auto' }],
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            return reject(new Error('Image upload failed to Cloudinary.'));
          }
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        }
      );
      uploadStream.end(file.buffer);
    });
  }

  // 2. Fallback: Save to local uploads folder
  const uploadsDir = path.resolve(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const ext = path.extname(file.originalname) || '.jpg';
  const filename = `trip-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
  const filepath = path.join(uploadsDir, filename);

  fs.writeFileSync(filepath, file.buffer);

  // Return local server URL path
  return {
    url: `/uploads/${filename}`,
    publicId: filename,
    isLocal: true,
  };
};
