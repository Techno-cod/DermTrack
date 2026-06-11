const cloudinary = require("../services/cloudinaryService");

const uploadPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No image uploaded",
      });
    }

    const result = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: "dermtrack",
      }
    );

    return res.status(201).json({
      message: "Photo uploaded successfully",
      imageUrl: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Upload failed",
    });
  }
};

module.exports = {
  uploadPhoto,
};