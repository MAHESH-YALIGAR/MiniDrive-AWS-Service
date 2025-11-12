const { Webhook } = require("svix");
const { createEmailEvent } = require("../models/AuthModel");
require("dotenv").config();

const handleWebhook = async (req, res) => {
  console.log("📩 Clerk webhook triggered...");

  const webhookSecret = process.env.WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("❌ Missing WEBHOOK_SECRET in environment variables");
    return res.status(500).send("Missing WEBHOOK_SECRET");
  }

  const headers = req.headers;
  let payload = req.body;

  console.log("📦 Payload type:", typeof payload);
  console.log("📦 Is Buffer?:", Buffer.isBuffer(payload));

  if (!payload || (Buffer.isBuffer(payload) && payload.length === 0)) {
    console.error("❌ No payload received");
    return res.status(400).json({ error: "No payload received" });
  }

  const wh = new Webhook(webhookSecret);
  let msg;

  try {
    const payloadString = Buffer.isBuffer(payload) 
      ? payload.toString("utf8") 
      : typeof payload === "string" 
      ? payload 
      : JSON.stringify(payload);

    msg = wh.verify(payloadString, headers);
  } catch (err) {
    console.error("❌ Webhook verification failed:", err.message);
    return res.status(400).json({ error: "Invalid webhook signature" });
  }

  console.log("✅ Verified webhook event:", msg.type);

  try {
    // Handle user.created event (when user signs up)
    if (msg.type === "user.created") {
      const { id, email_addresses, username, created_at } = msg.data;
      const email = email_addresses?.[0]?.email_address;

      console.log("👤 New user created!");
      console.log("🆔 User ID:", id);
      console.log("📧 Email:", email);
      console.log("👥 Username:", username);

      await createEmailEvent({
        emailId: id,
        subject: "User Signup",
        recipient: email,
        status: "user_created",
        createdAt: created_at || new Date(),
      });

      return res.status(200).json({ success: true, message: "User signup event stored" });
    }

    // Handle email.created event (emails sent)
    if (msg.type === "email.created") {
      const { id, subject, to_email_address, status, created_at } = msg.data;

      console.log("📧 Email created!");
      console.log("🧾 ID:", id);
      console.log("📨 To:", to_email_address);
      console.log("📝 Subject:", subject);
      console.log("📊 Status:", status);

      await createEmailEvent({
        emailId: id,
        subject,
        recipient: to_email_address,
        status,
        createdAt: created_at || new Date(),
      });

      return res.status(200).json({ success: true, message: "Email event stored" });
    }

    console.log(`ℹ️ Ignored event type: ${msg.type}`);
    res.status(200).json({ success: true, message: "Event ignored" });

  } catch (error) {
    console.error("❌ Error handling webhook:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { handleWebhook };