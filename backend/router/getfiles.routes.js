const express = require("express")
const router = express.Router()
const { getfiles,downloadfile,trashbin,getfiletrush,recentlyuploadedfile,deletepermently,restoreFile,totalstorage } = require("../controller/getfiles.controller");
const { authMiddleware } = require("../middleware/user.middleware")
console.log("you are in the getfile router");





router.get("/getfiles", authMiddleware, getfiles);
router.get("/download",authMiddleware,downloadfile);
router.post("/move-to-trash",authMiddleware,trashbin);
router.get("/gettrust",authMiddleware,getfiletrush);
router.get("/recently",authMiddleware,recentlyuploadedfile);
router.post("/deletepermently",authMiddleware,deletepermently);
router.post("/restorefile",authMiddleware,restoreFile);
router.get("/totalstorege",authMiddleware,totalstorage)
module.exports = router;