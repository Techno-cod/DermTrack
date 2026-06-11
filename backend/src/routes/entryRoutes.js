const express = require("express");
const multer = require("multer");

const router = express.Router();

const {
  uploadPhoto,
} = require("../controllers/entryController");

const authMiddleware = require("../middleware/authMiddleware");

const upload = multer({
  dest: "uploads/",
});

router.post(
  "/upload",
  authMiddleware,
  upload.single("photo"),
  uploadPhoto
);

module.exports = router;