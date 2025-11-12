// ==========================================
// 📁 controller/uploader.controller.js (FIXED)
// ==========================================

const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");

// ✅ AWS S3 setup
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION,
});

module.exports.uploadfile = async (req, res) => {
  try {
    console.log("📤 Upload controller hit");

    // ✅ Get user from auth middleware
    const userId = req.user?.userId;
    const file = req.file;

    console.log("👤 User ID:", userId);
    console.log("📁 File:", file ? file.originalname : "❌ NO FILE");

    // ✅ Validate file
    if (!file) {
      console.log("❌ No file received");
      return res.status(400).json({ message: "No file uploaded" });
    }

    // ✅ Validate user
    if (!userId) {
      console.log("❌ No user ID from auth middleware");
      return res.status(401).json({ message: "User not authenticated" });
    }

    console.log("📊 File size:", file.size, "bytes");
    console.log("🏷️ File type:", file.mimetype);

    // ✅ Create S3 key
    const fileKey = `fileuploader/minidrive/${userId}/uploads/${uuidv4()}-${file.originalname}`;
    console.log("🔑 S3 Key:", fileKey);

    // ✅ Upload to S3
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME || "mahesh-new1fortest",
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    console.log("⏳ Uploading to S3...");
    const uploadResult = await s3.upload(params).promise();
    console.log("✅ S3 upload successful!");

    // ✅ Send response with file URL
    res.json({
      message: "✅ File uploaded successfully",
      fileKey: fileKey,
      fileName: file.originalname,
      fileSize: file.size,
      url: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`,
      uploadedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error("❌ Upload error:", error.message);
    console.error("Stack:", error.stack);
    res.status(500).json({
      message: "Server Error",
      error: error.message
    });
  }
};
