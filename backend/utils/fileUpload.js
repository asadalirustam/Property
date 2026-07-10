const fs = require('fs');
const path = require('path');
const { uploadToCloudinary, isCloudinaryConfigured } = require('../config/cloudinary');

// Ensure local uploads directory exists
const localUploadsDir = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(localUploadsDir)) {
  fs.mkdirSync(localUploadsDir, { recursive: true });
}

/**
 * Uploads a file (from multer memoryStorage buffer)
 * @param {Object} file - Multer file object
 * @param {String} folder - Subfolder name
 * @returns {Promise<String>} - URL of uploaded file
 */
const uploadFile = async (file, folder = 'properties') => {
  if (!file) return null;

  try {
    if (isCloudinaryConfigured) {
      const result = await uploadToCloudinary(file.buffer, folder);
      return result.secure_url;
    } else {
      // Fallback: Save file locally in backend/public/uploads
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const fileExt = path.extname(file.originalname).toLowerCase();
      const fileName = `${file.fieldname}-${uniqueSuffix}${fileExt}`;
      const filePath = path.join(localUploadsDir, fileName);

      fs.writeFileSync(filePath, file.buffer);
      
      const serverUrl = process.env.BACKEND_URL || 'http://localhost:5000';
      return `${serverUrl}/uploads/${fileName}`;
    }
  } catch (error) {
    console.error(`File upload helper error: ${error.message}`);
    throw error;
  }
};

module.exports = { uploadFile };
