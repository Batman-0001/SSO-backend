const express = require("express");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const auth = require("../middleware/auth");

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check if file is an image
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

// @route   POST /api/upload/image
// @desc    Upload a single image to Cloudinary
// @access  Private
router.post("/image", auth, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload_stream(
      {
        resource_type: "image",
        folder: "hse-management/safety-observations",
        transformation: [
          { width: 1200, height: 1200, crop: "limit" },
          { quality: "auto" },
        ],
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          return res.status(500).json({
            message: "Failed to upload image",
            error: error.message,
          });
        }

        res.json({
          message: "Image uploaded successfully",
          data: {
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
            size: result.bytes,
          },
        });
      }
    );

    // Send the buffer to Cloudinary
    cloudinary.uploader
      .upload_stream(
        {
          resource_type: "image",
          folder: "hse-management/safety-observations",
          transformation: [
            { width: 1200, height: 1200, crop: "limit" },
            { quality: "auto" },
          ],
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            return res.status(500).json({
              message: "Failed to upload image",
              error: error.message,
            });
          }

          res.json({
            message: "Image uploaded successfully",
            data: {
              url: result.secure_url,
              publicId: result.public_id,
              width: result.width,
              height: result.height,
              format: result.format,
              size: result.bytes,
            },
          });
        }
      )
      .end(req.file.buffer);
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      message: "Server error during upload",
      error: error.message,
    });
  }
});

// @route   POST /api/upload/images
// @desc    Upload multiple images to Cloudinary
// @access  Private
router.post("/images", auth, upload.array("images", 6), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No image files provided" });
    }

    if (req.files.length > 6) {
      return res.status(400).json({ message: "Maximum 6 images allowed" });
    }

    const uploadPromises = req.files.map((file) => {
      return new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              resource_type: "image",
              folder: "hse-management/safety-observations",
              transformation: [
                { width: 1200, height: 1200, crop: "limit" },
                { quality: "auto" },
              ],
            },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve({
                  url: result.secure_url,
                  publicId: result.public_id,
                  width: result.width,
                  height: result.height,
                  format: result.format,
                  size: result.bytes,
                });
              }
            }
          )
          .end(file.buffer);
      });
    });

    const results = await Promise.all(uploadPromises);

    res.json({
      message: "Images uploaded successfully",
      data: results,
    });
  } catch (error) {
    console.error("Bulk upload error:", error);
    res.status(500).json({
      message: "Server error during bulk upload",
      error: error.message,
    });
  }
});

// @route   POST /api/upload/signature
// @desc    Upload signature image to Cloudinary
// @access  Private
router.post(
  "/signature",
  auth,
  upload.single("signature"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No signature file provided" });
      }

      // Upload signature to Cloudinary
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              resource_type: "image",
              folder: "hse-management/signatures",
              transformation: [
                { width: 400, height: 200, crop: "limit" },
                { quality: "auto" },
              ],
            },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result);
              }
            }
          )
          .end(req.file.buffer);
      });

      res.json({
        message: "Signature uploaded successfully",
        data: {
          url: result.secure_url,
          publicId: result.public_id,
        },
      });
    } catch (error) {
      console.error("Signature upload error:", error);
      res.status(500).json({
        message: "Server error during signature upload",
        error: error.message,
      });
    }
  }
);

// @route   DELETE /api/upload/:publicId
// @desc    Delete an image from Cloudinary
// @access  Private
router.delete("/:publicId", auth, async (req, res) => {
  try {
    const { publicId } = req.params;

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === "ok") {
      res.json({ message: "Image deleted successfully" });
    } else {
      res.status(404).json({ message: "Image not found or already deleted" });
    }
  } catch (error) {
    console.error("Delete image error:", error);
    res.status(500).json({
      message: "Server error during image deletion",
      error: error.message,
    });
  }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ message: "File too large. Maximum size is 10MB." });
    }
    if (error.code === "LIMIT_FILE_COUNT") {
      return res
        .status(400)
        .json({ message: "Too many files. Maximum 6 files allowed." });
    }
  }

  if (error.message === "Only image files are allowed") {
    return res.status(400).json({ message: error.message });
  }

  next(error);
});

module.exports = router;

