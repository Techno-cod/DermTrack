const express = require("express");
const multer = require("multer");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  uploadPhoto,
  getEntries,
  deleteEntry,
  rescoreEntry,
} = require("../controllers/entryController");

const upload = multer({ dest: "uploads/" });

router.post("/upload", authMiddleware, upload.single("photo"), uploadPhoto);
router.get("/", authMiddleware, getEntries);
router.delete("/:id", authMiddleware, deleteEntry);
router.post("/:id/rescore", authMiddleware, rescoreEntry);

module.exports = router;