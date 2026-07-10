const multer = require('multer');
const path = require('path');

// Configure memory storage to hold file buffer
const storage = multer.memoryStorage();

// File filter for images, videos, and documents
const fileFilter = (req, file, cb) => {
  const allowedExtensions = /jpeg|jpg|png|webp|mp4|mkv|pdf|doc|docx/;
  const extName = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
  const mimeType = allowedExtensions.test(file.mimetype);

  if (extName && mimeType) {
    cb(null, true);
  } else {
    cb(new Error('Supported formats: JPG, PNG, WEBP, MP4, MKV, PDF, DOC, DOCX'), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20 MB max file size limit
  },
  fileFilter,
});

module.exports = upload;
