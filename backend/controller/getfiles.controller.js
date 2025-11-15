// selectedfile.controller.js - AWS SDK v2
const s3 = require("../s3"); // Your existing S3 instance
const { GetObjectCommand, CopyObjectCommand, DeleteObjectCommand, S3Client } = require("@aws-sdk/client-s3")
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");


// this for the download the file 

module.exports.getfiles = async (req, res) => {
  console.log("📂 You are in getfiles controller (AWS SDK v2)");

  try {
    const userId = req.user.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "User ID not found" });
    }

    const criteria = req.query.criteria || "";
    const prefix = `fileuploader/minidrive/${userId}/uploads`;

    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Prefix: prefix,
      MaxKeys: 100,
    };

    console.log("🪣 Bucket:", params.Bucket);
    console.log("📁 Prefix:", prefix);

    const data = await new Promise((resolve, reject) => {
      s3.listObjectsV2(params, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });

    if (!data.Contents || data.Contents.length === 0) {
      return res.status(200).json({
        success: true,
        files: [],
        message: "No files found for this user",
      });
    }

    // ✅ Generate signed URLs using Promise.all for reliability
    const files = await Promise.all(
      data.Contents
        .filter((obj) => obj.Key.split("/").pop().toLowerCase().includes(criteria.toLowerCase()))
        .map(async (obj) => {
          try {
            const fileUrl = s3.getSignedUrl("getObject", {
              Bucket: process.env.S3_BUCKET_NAME,
              Key: obj.Key,
              Expires: 3600,
            });

            return {
              Key: obj.Key,
              Size: obj.Size,
              LastModified: obj.LastModified,
              url: fileUrl, // ✅ now guaranteed to exist
            };
          } catch (err) {
            console.error("❌ Error generating signed URL for:", obj.Key, err);
            return {
              Key: obj.Key,
              Size: obj.Size,
              LastModified: obj.LastModified,
              url: null,
            };
          }
        })
    );

    console.log(`✅ Successfully generated ${files.length} URLs`);
    console.log("🧾 Sample:", files[0]);

    return res.status(200).json({
      success: true,
      files,
      count: files.length,
      message: `Found ${files.length} files`,
    });
  } catch (error) {
    console.error("❌ Error in getfiles:", error);
    return res.status(500).json({
      success: false,
      message: "Error listing files from S3",
      error: error.message,
    });
  }
};



module.exports.downloadfile = async (req, res) => {
  try {
    const { key } = req.query;
    if (!key) return res.status(400).json({ message: "File key missing" });

    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Expires: 300, // 5 minutes
    };

    // v2 uses getSignedUrl directly on s3
    const url = s3.getSignedUrl("getObject", params);

    return res.json({ success: true, url });
  } catch (error) {
    console.error("Presign error:", error);
    res.status(500).json({ message: "Error generating presigned URL", error });
  }
};


//this is for the trush bin 




module.exports.trashbin = async (req, res) => {
  const userId = req.user.userId;
  console.log("You are in the trashbin backend");

  try {
    const { key } = req.body; // Use req.body for POST
    if (!key) {
      return res.status(400).json({ message: "File key missing" });
    }

    const bucket = process.env.S3_BUCKET_NAME;

    // Old and new paths
    const oldPrefix = `fileuploader/minidrive/${userId}/`;
    const trashPrefix = `fileuploader/minidrive/${userId}/trash/`;
    const newKey = key.replace(oldPrefix, trashPrefix);

    // 1️⃣ Copy file to trash folder
    await s3.copyObject({
      Bucket: bucket,
      CopySource: `${bucket}/${key}`,
      Key: newKey,
    }).promise();

    // 2️⃣ Delete original file
    await s3.deleteObject({
      Bucket: bucket,
      Key: key,
    }).promise();

    // 3️⃣ Save to MongoDB with deletedAt timestamp
    // await TrashFileModel.create({
    //   userId,
    //   originalKey: key,
    //   trashKey: newKey,
    //   deletedAt: new Date(), // timestamp for 5 days auto-delete
    // });

    console.log(`File moved to trash: ${key} → ${newKey}`);

    return res.status(200).json({
      success: true,
      message: "File moved to trash successfully",
      oldKey: key,
      trashKey: newKey,
    });
  } catch (error) {
    console.error("Error in trashbin backend:", error);
    return res.status(500).json({
      success: false,
      message: "Error moving file to trash",
      error: error.message,
    });
  }
};




module.exports.getfiletrush = async (req, res) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "User ID not found in token",
    });
  }

  // ✅ Correct prefix path (matches your S3 folder)
  const prefix = `fileuploader/minidrive/${userId}/trash/uploads/`;

  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Prefix: prefix,
    MaxKeys: 100,
  };

  try {
    const data = await s3.listObjectsV2(params).promise();

    // ✅ Filter and map all trash files
    const files =
      data.Contents?.filter((f) => !f.Key.endsWith("/")).map((file) => ({
        key: file.Key,
        name: file.Key.split("/").pop(),
        size: file.Size,
        lastModified: file.LastModified,
        url: s3.getSignedUrl("getObject", {
          Bucket: process.env.S3_BUCKET_NAME,
          Key: file.Key,
          Expires: 3600, // 1 hour temporary URL
        }),
      })) || [];

    return res.status(200).json({
      success: true,
      files,
    });
  } catch (error) {
    console.error("❌ Error fetching trash files:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch trash files",
      error: error.message,
    });
  }
};




//this is for the recentlyupload  file

module.exports.recentlyuploadedfile = async (req, res) => {
  const userId = req.user?.userId;
  if (!userId) {
    return res.status(401).json({ message: "User not logged in" });
  }

  console.log("You are in the recently uploaded file controller");

  const BUCKET = process.env.S3_BUCKET_NAME;
  const prefix = `fileuploader/minidrive/${userId}/uploads/`;
  const limit = 10; // get last 10 uploads

  const params = {
    Bucket: BUCKET,
    Prefix: prefix, // ✅ uppercase P
  };

  try {
    const data = await s3.listObjectsV2(params).promise();

    const sortedFiles = (data.Contents || [])
      .filter((f) => !f.Key.endsWith("/")) // ✅ uppercase Key
      .sort((a, b) => b.LastModified.getTime() - a.LastModified.getTime())
      .slice(0, limit)
      .map((file) => ({
        key: file.Key,
        name: file.Key.split("/").pop(),
        size: file.Size,
        lastModified: file.LastModified,
        url: s3.getSignedUrl("getObject", {
          Bucket: BUCKET,
          Key: file.Key, // ✅ uppercase Key
          Expires: 3600, // 1 hour
        }),
      }));
    console.log("this is ", sortedFiles.map(f => f.url))
    return res.status(200).json(sortedFiles);
  } catch (error) {
    console.log("Error in getting recently uploaded files:", error);
    return res.status(500).json({
      message: "Error in the backend for getting recently uploaded files",
    });
  }
};




//this is for the delete permanently from the aws..

module.exports.deletepermently = async (req, res) => {
  const userId = req.user.userId;
  console.log("You are in the delete permanently backend");

  // Extract filekey from req.body
  const { filekey } = req.body;
  console.log("filekey:", filekey);

  if (!filekey) {
    return res.status(400).json({ message: "filekey is required" });
  }

  try {
    // Delete from S3 using the full key directly
    await s3.deleteObject({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: filekey  // Use the full key as is
    }).promise();

    console.log("File deleted successfully:", filekey);
    return res.status(200).json({ message: "File is deleted permanently" });
  } catch (error) {
    console.log("Error in delete permanently:", error);
    return res.status(500).json({ message: "Error deleting file" });
  }
};





module.exports.restoreFile = async (req, res) => {
  const userId = req.user.userId;
  const { filekey } = req.body;

  console.log("You are in the restore file backend", filekey);

  if (!filekey) {
    return res.status(400).json({ message: "Missing file key" });
  }

  const bucket = process.env.S3_BUCKET_NAME;

  // 🔥 Extract filename part
  const fileName = filekey.split("/").pop();

  // 🔥 Detect if the file contains the special key "~"
  const isFolderFile = fileName.includes("~");

  let destinationKey;

  if (isFolderFile) {
    // ⭐ FOLDER FILE CASE — decode "~" → "/"  
    const decodedPath = fileName.replace(/~/g, "/");

    // 👇 Final correct folder restore path
    destinationKey = `fileuploader/minidrive/${userId}/${decodedPath}`;

  } else {
    // ⭐ NORMAL UPLOAD FILE CASE 
    destinationKey = filekey.replace("/trash/uploads", "/uploads");
  }

  console.log("this is the destinaction key.......", destinationKey);

  try {
    // ⭐ Copy back the file to correct path
    await s3.copyObject({
      Bucket: bucket,
      CopySource: `${bucket}/${filekey}`,
      Key: destinationKey,
    }).promise();

    // ⭐ Remove from trash
    await s3.deleteObject({
      Bucket: bucket,
      Key: filekey,
    }).promise();

    res.status(200).json({
      message: isFolderFile
        ? "Folder file restored successfully"
        : "File restored successfully",
      restoredTo: destinationKey
    });

  } catch (error) {
    console.log("The error from restoreFile:", error);
    return res.status(500).json({ message: "Error in restoreFile" });
  }
};



module.exports.totalstorage = async (req, res) => {
  const userId = req.user.userId;
  const prefix = `fileuploader/minidrive/${userId}/`; // ✅ match your upload path

  let totalSize = 0;
  try {
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Prefix: prefix,
    };

    let continuationToken = null;
    do {
      const response = await s3
        .listObjectsV2({
          ...params,
          ContinuationToken: continuationToken,
        })
        .promise();

      if (response.Contents) {
        totalSize += response.Contents.reduce((sum, file) => sum + file.Size, 0);
        console.log("this totalsize..................................", totalSize)
      }

      continuationToken = response.IsTruncated ? response.NextContinuationToken : null;
    } while (continuationToken);

    const sizeInMB = (totalSize / (1024 * 1024)).toFixed(2);
    console.log("this the size in mb........", sizeInMB)
    res.json({
      userId,
      totalBytes: totalSize,
      totalMB: sizeInMB,
      message: `User ${userId} has used ${sizeInMB} MB of storage`,
    });
  } catch (error) {
    console.error("Error in total storage:", error);
    res.status(500).json({ message: "Failed to fetch total storage" });
  }
};





