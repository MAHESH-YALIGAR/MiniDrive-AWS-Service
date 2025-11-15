


const s3 = require("../s3");
const { GetObjectCommand, CopyObjectCommand, DeleteObjectCommand, S3Client } = require("@aws-sdk/client-s3")

exports.uploadFolder = async (req, res) => {
  try {
    const userId = req.user.userId;
    const files = req.files;
    const filePaths = req.body.filePaths;
    const rootFolderName = req.body.rootFolderName;

    console.log("this is the filepath", filePaths);
    console.log("\n🚀 ============ FOLDER UPLOAD START ============");
    console.log(`📤 Files received: ${files.length}`);
    console.log(`📂 Root Folder Name: ${rootFolderName}`);
    console.log(`👤 User ID: ${userId}`);

    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const uploadedFiles = [];

    const pathsArray = Array.isArray(filePaths) ? filePaths : [filePaths];

    console.log(`\n📁 Processing ${files.length} files...\n`);

    for (let i = 0; i < files.length; i++) {
      try {
        const file = files[i];

        const relativePath = pathsArray[i] || file.originalname;

        console.log(`\n📄 File ${i + 1}:`);
        console.log(`   Original Name: ${file.originalname}`);
        console.log(`   📂 Full Path: ${relativePath}`);
        console.log(`   Size: ${(file.size / 1024).toFixed(2)} KB`);

        const pathParts = relativePath.split("/");
        const fileName = pathParts[pathParts.length - 1];
        const folderHierarchy = pathParts.slice(0, -1);

        console.log(`   🗂️ Folder Hierarchy: ${folderHierarchy.join(" > ") || "root"}`);
        console.log(`   📝 Filename: ${fileName}`);

        // This variable holds the S3 key where the file will be stored
        const fileKey = `fileuploader/minidrive/${userId}/folders/${relativePath}`;

        console.log(`   📍 S3 Key: ${fileKey}`);

        const params = {
          Bucket: process.env.S3_BUCKET_NAME,
          Key: fileKey,
          Body: file.buffer,
          ContentType: file.mimetype,
        };

        const uploadResult = await s3.upload(params).promise();

        uploadedFiles.push({
          filename: file.originalname,
          relativePath: relativePath,
          folderHierarchy: folderHierarchy,
          parentFolders: folderHierarchy.join("/"),
          rootFolder: rootFolderName,
          fileName: fileName,
          size: file.size,
          mimeType: file.mimetype,
          s3Url: uploadResult.Location,
          s3Key: fileKey,
        });

        // Fix here: Log 'fileKey' instead of undefined 's3Key'
        console.log("key", fileKey);
        console.log(`   ✅ Uploaded to S3: ${uploadResult.Location}`);
      } catch (fileError) {
        console.error(`❌ Error uploading ${files[i].originalname}:`, fileError);
      }
    }

    console.log(`\n📊 Upload Summary:`);
    console.log(`   Total Files: ${files.length}`);
    console.log(`   Successfully Uploaded: ${uploadedFiles.length}`);

    return res.status(200).json({
      message: "Folder uploaded successfully",
      uploadedCount: uploadedFiles.length,
      totalFiles: files.length,
      rootFolderName: rootFolderName,
      files: uploadedFiles,
      userId: userId,
    });
  } catch (error) {
    console.error("❌ Folder upload error:", error);
    return res.status(500).json({ message: "Error uploading folder" });
  }
};


function buildTreeFromS3Keys(prefix, files) {
  const tree = {};

  files.forEach(({ key, size }) => {
    if (!key) return;

    const relative = key.replace(prefix, "");
    if (!relative) return;

    const parts = relative.split("/");
    let current = tree;

    parts.forEach((part, index) => {
      if (!part) return;

      if (index === parts.length - 1) {
        // FILE
        if (!current.files) current.files = [];
        current.files.push({
          name: part,
          key: key,
          size: size
        });
      } else {
        // FOLDER
        if (!current[part]) current[part] = {};
        current = current[part];
      }
    });
  });

  return tree;
}

module.exports.getallfolder = async (req, res) => {
  const userId = req.user.userId;

  try {
    const fileKey = `fileuploader/minidrive/${userId}/folders/`;

    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Prefix: fileKey,
    };

    const getresult = await s3.listObjectsV2(params).promise();
    console.log("all folders are .................", getresult);

    const allKeys = getresult.Contents.map(obj => ({
      key: obj.Key,      // full s3 key
      size: obj.Size     // file size
    }));

    const folderTree = buildTreeFromS3Keys(fileKey, allKeys);

    return res.status(200).json({
      success: true,
      folderTree: folderTree
    });

  } catch (error) {
    console.log("error in the getfolder", error);
    return res.status(500).json({ Message: "error in the getfolder" });
  }
};







exports.downloadFolderFile = async (req, res) => {
  try {
    const { key } = req.query; // S3 key

    if (!key) {
      return res.status(400).json({ message: "Missing file key" });
    }

    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
    };

    const fileStream = s3.getObject(params).createReadStream();

    res.attachment(key.split("/").pop()); // filename
    fileStream.pipe(res);

  } catch (error) {
    console.log("Download error:", error);
    res.status(500).json({ message: "Unable to download file" });
  }
};


//this is for the delete the file 


// module.exports.deletefileinfolder = async (req, res) => {
//   try {
//     const userId = req.user.userId;
//     const { key } = req.body;
//     const bucket = process.env.S3_BUCKET_NAME;

//     if (!key) {
//       return res.status(400).json({ message: "Missing file key" });
//     }

//     const oldkey = key;

//     // 🔥 FIX HERE: folder trash instead of allfiles or uploads
//     const fileName = key.split("/").pop();
//     const encodedPath = key.replace(/\//g, "~");

//     const newkey = `fileuploader/minidrive/${userId}/trash/folders/${encodedPath}`;

//     // Copy file to trash
//     await s3.copyObject({
//       Bucket: bucket,
//       CopySource: `${bucket}/${oldkey}`,
//       Key: newkey, 
//     }).promise();

//     // Delete original
//     await s3.deleteObject({
//       Bucket: bucket,
//       Key: oldkey,
//     }).promise();

//     return res.status(200).json({
//       success: true,
//       message: "File deleted and moved to trash (folder trash)",
//       deletedKey: key,
//       trashKey: newkey
//     });

//   } catch (error) {
//     console.log("Error deleting file:", error);
//     return res.status(500).json({ message: "Error deleting file", error: error.message });
//   }
// };
module.exports.deletefileinfolder = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { key } = req.body;  
    const bucket = process.env.S3_BUCKET_NAME;

    if (!key) {
      return res.status(400).json({ message: "Missing file key" });
    }

    const oldKey = key;

    /*
      ✔ Convert original folder path into SAFE format
      Example:
      folders/text folder/NewA/file1.txt

      becomes:
      folders~text folder~NewA~file1.txt
    */
    const encodedPath = key
      .replace(`fileuploader/minidrive/${userId}/`, "")
      .replace(/\//g, "~");

    // 🔥 STORE IN ONE TRASH BIN
    const trashKey = `fileuploader/minidrive/${userId}/trash/uploads/${encodedPath}`;

    // Copy file to trash bin
    await s3.copyObject({
      Bucket: bucket,
      CopySource: `${bucket}/${oldKey}`,
      Key: trashKey
    }).promise();

    // Delete original file
    await s3.deleteObject({
      Bucket: bucket,
      Key: oldKey
    }).promise();

    return res.status(200).json({
      success: true,
      message: "Folder file moved to trash",
      originalKey: oldKey,
      trashKey: trashKey
    });

  } catch (error) {
    console.log("Error deleting folder file:", error);
    return res.status(500).json({
      message: "Error deleting file",
      error: error.message
    });
  }
};




//this is the delete folder ................

// module.exports.gotofoldertrushbin = async (req, res) => {
//   const userId = req.user.userId;
//   const { folderKey } = req.body;
//   bucket = process.env.S3_BUCKET_NAME;
//   try {
//     const params = {
//       Bucket: process.env.S3_BUCKET_NAME,
//       Key: folderKey,
//     }
//     const listobject = await s3.listObjectsV2(params()).promise();
//     if (!listedObjects.Contents.length) {
//       return res.status(400).json({ message: "Folder is empty or does not exist" });
//     }

//     for (const obj of listobject.Contents) {
//       const oldPrefix = obj.key;
//       const trashPrefix = `fileuploader/minidrive/${userId}/trash/trushfolder`;
//       const newKey = key.replace(oldPrefix, trashPrefix);
//       await s3.copyObject({
//         Bucket: process.env.S3_BUCKET_NAME,
//         CopySource: `${bucket}/${oldPrefix}`,
//         key: newKey
//       }).promise();
//     }

//     await s3.deleteObject({
//       Bucket: process.env.S3_BUCKET_NAME,
//       key: oldPrefix
//     }).promise();

//     return res.status(200).json({
//       success: true,
//       message: "Folder moved to trash successfully",
//       deletedFolder: folderKey
//     });
//   } catch (error) {
//     console.log("the error is the gotofoldertrushbin", error);
//     return res.status(500).json({ message: "error in the gototrushbin controller" });
//   }
// }

// 