
const express = require("express");
const multer = require("multer");
const router = express.Router();
const { authMiddleware } = require("../middleware/user.middleware");
const { uploadfile } = require("../controller/uploader.controller");

// ✅ Multer setup
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ Route with auth middleware and multer
router.post("/upload", authMiddleware, upload.single("file"), uploadfile);

module.exports = router;
