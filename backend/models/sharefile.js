const mongoose = require("mongoose");

const sharedFileSchema = new mongoose.Schema({
  fileKey: { type: String, required: true },      // S3 object key
  fileName: { type: String, required: true },     // e.g., photo.jpg
  ownerId: { type: String, required: true },      // user who shared the file
  sharedWith: { type: String, required: true },   // recipient email or userId
  shareId: { type: String, required: true, unique: true }, // unique identifier
  owneremail: { type: String, required: true, unique: true }, // unique identifier
  permission: { type: String, enum: ["view", "edit"], default: "view" },
  expiresAt: { type: Date },                      // optional expiry date
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("SharedFile", sharedFileSchema);
