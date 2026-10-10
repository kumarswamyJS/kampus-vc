import fs from 'fs';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env';

export interface UploadedFileResult {
  url: string;
  publicId: string;
  mediaType: 'image' | 'video';
  storageProvider: 'cloudinary' | 'local';
}

// Configure Cloudinary if credentials present
const isCloudinaryConfigured = Boolean(
  env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  });
  console.log('✅ Cloudinary Storage Service configured.');
} else {
  console.log('ℹ️ Cloudinary credentials omitted. Using local filesystem storage fallback (/uploads).');
}

export const processUploadedFile = async (
  file: Express.Multer.File
): Promise<UploadedFileResult> => {
  const isVideo = file.mimetype.startsWith('video/');
  const mediaType: 'image' | 'video' = isVideo ? 'video' : 'image';

  // Production Cloudinary Upload if configured
  if (isCloudinaryConfigured) {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'kampus-vc-portfolios',
        resource_type: isVideo ? 'video' : 'image',
      });
      // Cleanup temp local file after successful upload to Cloudinary
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);

      return {
        url: result.secure_url,
        publicId: result.public_id,
        mediaType,
        storageProvider: 'cloudinary',
      };
    } catch (err) {
      console.error('❌ Cloudinary upload failed, falling back to local storage:', err);
    }
  }

  // Local Storage Fallback
  const filename = path.basename(file.path);
  const relativeUrl = `/uploads/${filename}`;

  return {
    url: relativeUrl,
    publicId: filename,
    mediaType,
    storageProvider: 'local',
  };
};

export const deleteStoredMedia = async (publicIdOrPath: string): Promise<void> => {
  if (!publicIdOrPath) return;

  if (isCloudinaryConfigured && !publicIdOrPath.startsWith('/uploads/')) {
    try {
      await cloudinary.uploader.destroy(publicIdOrPath);
    } catch (err) {
      console.warn('⚠️ Cloudinary media deletion failed:', err);
    }
    return;
  }

  // Delete local file
  const localFilename = path.basename(publicIdOrPath);
  const localPath = path.resolve(process.cwd(), env.UPLOAD_DIR, localFilename);
  if (fs.existsSync(localPath)) {
    try {
      fs.unlinkSync(localPath);
    } catch (err) {
      console.warn('⚠️ Local media file cleanup error:', err);
    }
  }
};
