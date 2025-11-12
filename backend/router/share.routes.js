const express = require("express")
const router = express.Router()
const SharedFile = require("../models/sharefile")
const { shareFile, getSharedWithMe, openShare, getemail_advanced,deleteSharedFile } = require("../controller/share.controller")


const { authMiddleware } = require("../middleware/user.middleware");

router.post("/shareing", authMiddleware, shareFile);
router.get("/shared-with-me", authMiddleware, getSharedWithMe);
// router.get("/:shareId",authMiddleware,openShare);
// router.get("/:shareId", authMiddleware, openShare);
console.log("this is the router file ")
router.get("/getemail", authMiddleware, getemail_advanced)

router.get("/:shareId", authMiddleware,openShare);
router.delete("/delete/:shareId", authMiddleware, deleteSharedFile);

 

module.exports = router;