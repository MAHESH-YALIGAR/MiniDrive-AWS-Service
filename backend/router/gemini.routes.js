const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/user.middleware");
const { gemini } = require("../controller/gemini.controller");

router.post("/rag", gemini);

module.exports = router;
