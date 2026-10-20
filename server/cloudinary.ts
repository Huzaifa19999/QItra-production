import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(dataUrlOrPath: string): Promise<{ secure_url?: string; error?: string }> {
  try {
    const result = await cloudinary.uploader.upload(dataUrlOrPath, { folder: 'qitra-store' });
    return { secure_url: result.secure_url };
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    return { error: error?.message || 'Failed to upload image' };
  }
}

export default cloudinary;
