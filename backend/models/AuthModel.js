// model/EmailEvent.js
const mongoose = require("mongoose");

// Define schema for storing email webhook data
const emailEventSchema = new mongoose.Schema({
  emailId: { type: String, required: true, unique: true },
  subject: { type: String },
  recipient: { type: String },
  status: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// Create model
const EmailEvent = mongoose.model("EmailEvent", emailEventSchema);

// Export helper function to create an entry
async function createEmailEvent(data) {
  try {
    const event = new EmailEvent(data);
    await event.save();
    console.log("✅ Email event stored successfully:", data.emailId);
    return event;
  } catch (err) {
    console.error("❌ Failed to store email event:", err.message);
    throw err;
  }
}

module.exports = { createEmailEvent, EmailEvent };
