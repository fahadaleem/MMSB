const multer = require("multer");
const AWS = require("aws-sdk");
const dotenv = require("dotenv");
const express = require("express");
const router = express.Router();

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// Configure Multer
const storage = multer.memoryStorage(); // Store file in memory temporarily
const upload = multer({ storage });

// Upload File to S3
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded!" });
    }

    // Configure S3 upload parameters
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `${Date.now()}_${file.originalname}`, // Unique file name
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    // Upload file to S3
    const result = await s3.upload(params).promise();

    res.status(200).json({
      message: "File uploaded successfully",
      url: result.Location,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "File upload failed", error: error.message });
  }
});

module.exports = router;
