const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { saveLog, getLogs, getTodayLog } = require("../controllers/journalController");

router.post("/", authMiddleware, saveLog);
router.get("/", authMiddleware, getLogs);
router.get("/today", authMiddleware, getTodayLog);

module.exports = router;