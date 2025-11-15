



const mongoose = require("mongoose");

const sharedFileSchema = new mongoose.Schema({
  fileKey: { type: String, required: true },      
  fileName: { type: String, required: true },     
  ownerId: { type: String, required: true },      
  sharedWith: { type: String, required: true },   
  shareId: { type: String, required: true, unique: true }, // unique per share
  owneremail: { type: String, required: true },  // no unique
  permission: { type: String, enum: ["view", "edit"], default: "view" },
  expiresAt: { type: Date },                      
  createdAt: { type: Date, default: Date.now },
});

// Compound index to prevent the same file being shared twice to the same recipient
sharedFileSchema.index({ fileKey: 1, sharedWith: 1 }, { unique: true });

module.exports = mongoose.model("SharedFile", sharedFileSchema);
