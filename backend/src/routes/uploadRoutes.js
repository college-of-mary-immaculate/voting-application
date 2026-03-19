const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require("../middleware/authMiddleware");

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate random filename: timestamp + random string + extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

// File filter to only allow images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

// Upload endpoint
router.post('/upload/photo', auth.authMiddleware, (req, res) => {
  upload.single('photo')(req, res, function(err) {
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({
        status: 'error',
        message: err.message || 'File upload failed'
      });
    }

    try {
      if (!req.file) {
        return res.status(400).json({
          status: 'error',
          message: 'No file uploaded'
        });
      }

      // Return the public URL of the uploaded file
      const fileUrl = `/uploads/${req.file.filename}`;
      
      res.status(200).json({
        status: 'success',
        message: 'File uploaded successfully',
        data: {
          file_path: fileUrl,
          filename: req.file.filename,
          original_name: req.file.originalname,
          size: req.file.size
        }
      });
    } catch (error) {
      console.error('Upload processing error:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to process upload'
      });
    }
  });
});

module.exports = router;