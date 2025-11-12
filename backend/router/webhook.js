// router/webhook.js
const express = require("express");
const router = express.Router();
const { handleWebhook } = require("../controller/webhooking.js");

// 👇 Correct way to use an array of middlewares
router.post("/hook", handleWebhook);

module.exports = router;
