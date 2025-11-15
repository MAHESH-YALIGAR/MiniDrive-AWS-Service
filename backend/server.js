const express = require("express");
const mongoose = require("mongoose");
const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");
const multer = require("multer");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const path = require("path");
const cron = require("node-cron");


dotenv.config();

const app = express();

// ✅ Cookie parser must come before routes
app.use(cookieParser());

// ✅ CORS configuration (don’t call app.use(cors()) again below)
app.use(cors({
  origin: " http://localhost:5173", // ⚠️ remove trailing slash
  credentials: true, // ✅ allow cookies from frontend
}));

// ✅ JSON parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ MongoDB connection
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch((err) => console.error("❌ MongoDB connection error:", err));



// Runs every day at midnight
// cron.schedule("0 0 * * *", async () => {
//   console.log("Checking trash for files older than 5 days...");

//   const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);

//   const oldFiles = await TrashFileModel.find({
//     deletedAt: { $lte: fiveDaysAgo },
//   });

//   for (const file of oldFiles) {
//     try {
//       await s3.deleteObject({
//         Bucket: process.env.S3_BUCKET_NAME,
//         Key: file.trashKey,
//       }).promise();

//       await file.deleteOne(); // remove from DB
//       console.log("Deleted old trash file:", file.trashKey);
//     } catch (err) {
//       console.error("Error deleting trash file:", file.trashKey, err);
//     }
//   }
// });


// ✅ Multer setup
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ Example route
app.get("/", (req, res) => {
  res.send("🚀 MiniDrive Server is running!");
});

// ✅ Import routes
const userRouter = require("./router/user.routes");
const uploadRouter = require("./router/upload.routes");
const getfilerouter=require("./router/getfiles.routes");
const sharerouter=require("./router/share.routes");
// const geminirouter=require("./router/gemini.routes");
const geminiRouter = require("./router/gemini.routes");
const folderrouter=require("./router/folderupdate.routes")

// ✅ Use routes
app.use("/api/Auth", userRouter);
app.use("/api/file", uploadRouter);
app.use("/api/getfiles",getfilerouter)
// app.use("/api/share",sharerouter);
app.use("/api/share", sharerouter);
app.use("/api/gemini", geminiRouter);
app.use("/api/uploadfolder",folderrouter)


// ✅ Server listening
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`🌍 Server running at http://localhost:${PORT}`));
