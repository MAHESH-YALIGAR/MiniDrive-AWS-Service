
const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/user.middleware");
const { uploadFolder, getallfolder,downloadFolderFile,deletefileinfolder } = require("../controller/folder.controller");
const multer = require("multer");

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 200 * 1024 * 1024,
  },
});

// Change to upload.array() for multiple files in a folder
router.post("/upload", authMiddleware, upload.array("file"), uploadFolder);
router.get("/getfolder", authMiddleware, getallfolder);
router.get("/downloadpdf",authMiddleware,downloadFolderFile);
router.post("/deletefileinfolder",authMiddleware,deletefileinfolder)
console.log("✅ Folder upload router loaded");

module.exports = router;