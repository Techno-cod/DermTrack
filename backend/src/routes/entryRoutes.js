const express = require("express");
const multer = require("multer");

const router = express.Router();

const {
  uploadPhoto,
  getEntries,
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
router.get(
  "/",
  authMiddleware,
  getEntries
);

module.exports = router;