const SharedFile = require("../models/sharefile");
const userSchema = require("../models/user.model")
const { v4: uuidv4 } = require("uuid");

const s3 = require("../s3")
// Controller to handle sharing a file



exports.shareFile = async (req, res) => {
  console.log("📩 You are in the share file controller");

  try {
    const { fileKey, fileName, sharedWith } = req.body;
    const ownerId = req.user.userId; 
    const owneremail = req.user.email;

    console.log("➡️ File info received:", fileKey, fileName, sharedWith);

    if (!fileKey || !sharedWith) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const getFileName = fileName || fileKey.split("/").pop();

    // Check if this file is already shared with this recipient
    const existing = await SharedFile.findOne({ fileKey, sharedWith });

    if (existing) {
      return res.status(400).json({
        message: `This file is already shared with ${sharedWith}`,
        link: `${process.env.APP_URL}/s/${existing.shareId}`,
      });
    }

    // Create a new shared file record
    const shareId = uuidv4();
    const sharedFile = await SharedFile.create({
      fileKey,
      fileName: getFileName,
      ownerId,
      sharedWith,
      shareId,
      owneremail,
    });

    const link = `${process.env.APP_URL}/s/${shareId}`;

    console.log(`✅ File shared successfully with ${sharedWith}`);

    return res.status(200).json({
      message: `File shared successfully with ${sharedWith}`,
      link,
      sharedFile,
    });

  } catch (error) {
    console.error("❌ Error sharing file:", error);

    // Handle duplicate share (compound index conflict)
    if (error.code === 11000) {
      return res.status(400).json({
        message: `This file is already shared with ${req.body.sharedWith}`,
      });
    }

    return res.status(500).json({ message: "Failed to share file" });
  }
};

//this is for the getshare

module.exports.getSharedWithMe = async (req, res) => {
  console.log("you are ni the getsharefile .....................................")
  try {
    const userId = req.user.userId;
    const owneremail = req.user.email;
    console.log("you are ni the getsharefile .....................................", owneremail)
    const sharedFiles = await SharedFile.find({ sharedWith: owneremail });
    console.log("you are ni the getsharefile .....................................", sharedFiles)

    res.status(200).json({
      message: "Files shared with you",
      files: sharedFiles,
    });
  } catch (error) {
    console.error("Error fetching shared files:", error);
    res.status(500).json({ message: "Failed to fetch shared files" });
  }
};







module.exports.openShare = async (req, res) => {
  try {
    const { shareId } = req.params;
    const userId = req.user.userId;

    console.log("📥 Opening shared file with shareId:", shareId);

    // ✅ Use `shareId` (not `_id`) and allow owner access too
    const share = await SharedFile.findOne({
      shareId,
      // $or: [{ sharedWith: userId }, { ownerId: userId }],
    });

    if (!share) {
      console.log("❌ No shared file found for:", shareId);
      return res.status(404).json({ message: "Shared file not found or no access" });
    }

    // ✅ Optional: Check expiration
    if (share.expiresAt && new Date() > share.expiresAt) {
      return res.status(410).json({ message: "Share link expired" });
    }

    // ✅ Generate signed S3 URL (valid 60 sec)
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: share.fileKey,
      Expires: 60,
    };

    const signedUrl = s3.getSignedUrl("getObject", params);

    res.status(200).json({
      message: "File ready for download",
      fileName: share.fileName,
      url: signedUrl,
      sharedBy: share.owneremail || share.ownerId,
    });
  } catch (error) {
    console.error("💥 Error opening shared file:", error);
    res.status(500).json({ message: "Failed to open shared file" });
  }
};



module.exports.getemail_advanced = async (req, res) => {
  try {
    // 🧠 Extract current logged-in user ID from token (auth middleware)
    const currentUserId = req.user?.userId || req.user?._id || req.user?.id;

    if (!currentUserId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User ID not found in token",
      });
    }

    // 🧩 Fetch all users except the current user
    const users = await userSchema.find(
      { _id: { $ne: currentUserId } }, // exclude self
      "email name" // only get these fields
    );

    if (!users || users.length === 0) {
      return res.status(200).json({
        success: true,
        emails: [],
        message: "No other users found",
      });
    }

    // 🧹 Remove duplicate emails (safety)
    const emails = [...new Set(users.map((user) => user.email))];

    return res.status(200).json({
      success: true,
      emails,
      total: emails.length,
      message: "Emails fetched successfully",
    });
  } catch (error) {
    console.error("❌ Error fetching emails:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching emails",
      error: error.message,
    });
  }
};





//this is  for the delete the file from the sharefile 
// Delete a shared file (either by owner or receiver)
module.exports.deleteSharedFile = async (req, res) => {
  try {
    const { shareId } = req.params;
    const userId = req.user.userId;
    const userEmail = req.user.email;

    console.log("Deleting shared file with shareId:", shareId);
    console.log("User:", userId, userEmail);

    // Find the file first
    const sharedFile = await SharedFile.findOne({ shareId });
    if (!sharedFile) {
      return res.status(404).json({ message: "File not found" });
    }

    let deleteQuery = {};

    // If owner deletes it
    if (sharedFile.ownerId === userId || sharedFile.owneremail === userEmail) {
      deleteQuery = { shareId };
    }
    // If the person it was shared with deletes it
    else if (sharedFile.sharedWith === userEmail) {
      deleteQuery = { shareId, sharedWith: userEmail };
    } else {
      return res.status(403).json({ message: "Not authorized to delete" });
    }

    console.log("Delete query:", deleteQuery);

    const deletedFile = await SharedFile.findOneAndDelete(deleteQuery);
    console.log("Deleted result:", deletedFile);

    if (!deletedFile) {
      return res.status(404).json({ message: "No matching file to delete" });
    }

    res.status(200).json({ message: "File deleted successfully" });
  } catch (err) {
    console.error("Error deleting shared file:", err);
    res.status(500).json({ message: "Server error" });
  }
};
