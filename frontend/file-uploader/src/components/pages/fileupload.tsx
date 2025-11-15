import React, { useState, ChangeEvent } from "react";
import { Upload, FileText, Image as ImageIcon, Trash2, Folder, Video, X, File as FileIcon } from "lucide-react";
import axios from "axios"

interface UploadedFile {
  id: number;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadType: "file" | "photo" | "folder" | "video";
}

interface FolderNode {
  name: string;
  children?: FolderNode[];
  files?: File[];
}

type UploadType = "file" | "photo" | "folder" | "video";

const UploadPage: React.FC = () => {
  const [uploadType, setUploadType] = useState<UploadType | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [usedStorage, setUsedStorage] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [folderStructure, setFolderStructure] = useState<FolderNode | null>(null);

  const uploadConfig: Record<UploadType, { accept: string; icon: React.ReactNode; label: string; color: string }> = {
    file: { accept: ".pdf,.doc,.docx,.txt,.xls,.xlsx", icon: <FileIcon size={32} />, label: "Upload File", color: "from-orange-500 to-red-500" },
    photo: { accept: "image/*", icon: <ImageIcon size={32} />, label: "Upload Photos", color: "from-blue-500 to-cyan-500" },
    video: { accept: "video/*", icon: <Video size={32} />, label: "Upload Videos", color: "from-purple-500 to-pink-500" },
    folder: { accept: "*", icon: <Folder size={32} />, label: "Upload Folder", color: "from-yellow-500 to-orange-500" },
  };

  
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newFiles = e.target.files;
    if (newFiles) {
      const filesArray = Array.from(newFiles);
      setSelectedFiles(filesArray);
      setError("");
      console.log("✅ Files selected:", newFiles.length);

      // Build folder structure if it's a folder upload
      if (uploadType === "folder" && filesArray.length > 0) {
        // ✅ Get the root folder name from the first file's path
        const firstFilePath = filesArray[0].webkitRelativePath;
        const rootFolderName = firstFilePath.split("/")[0];

        // Create root node with the actual folder name
        const root: FolderNode = { name: rootFolderName, children: [], files: [] };

        filesArray.forEach((file) => {
          const pathParts = file.webkitRelativePath.split("/");
          let current = root;

          // Skip the first part (root folder) and process from index 1
          for (let i = 1; i < pathParts.length; i++) {
            const part = pathParts[i];
            if (i === pathParts.length - 1) {
              // Last part = the actual file
              if (!current.files) current.files = [];
              current.files.push(file);
            } else {
              // Folder part
              if (!current.children) current.children = [];
              let folder = current.children.find((c) => c.name === part);
              if (!folder) {
                folder = { name: part, children: [], files: [] };
                current.children.push(folder);
              }
              current = folder;
            }
          }
        });

        setFolderStructure(root);
        console.log("📂 Folder structure built:", root);
      }
    }
  };
  
  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError("Please choose files");
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("\n🚀 Starting upload...");
      console.log(`📊 Total files to upload: ${selectedFiles.length}`);

      // ✅ Check if files have webkitRelativePath
      const hasRelativePaths = selectedFiles.some(f => f.webkitRelativePath);
      console.log(`📂 Has webkitRelativePath: ${hasRelativePaths ? "✅ YES" : "❌ NO"}`);

      if (!hasRelativePaths && uploadType === "folder") {
        setError("❌ Folder structure not detected. Make sure you selected a folder, not individual files.");
        setLoading(false);
        return;
      }

      // Determine endpoint based on uploadType
      const uploadUrl = uploadType === "folder"
        ? "http://localhost:8000/api/uploadfolder/upload"
        : "http://localhost:8000/api/file/upload";

      // ✅ Create ONE FormData for all files
      const formData = new FormData();

      console.log(`\n📤 Preparing files for endpoint: ${uploadUrl}`);

      // ✅ Get root folder name from first file's path
      let rootFolderName = "";
      if (uploadType === "folder" && selectedFiles.length > 0) {
        const firstFilePath = selectedFiles[0].webkitRelativePath;
        rootFolderName = firstFilePath.split("/")[0];
        console.log(`📁 Root Folder Name: ${rootFolderName}`);
      }

      // ✅ Add each file WITH its COMPLETE folder path
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const relativePath = file.webkitRelativePath || file.name;

        formData.append("file", file);
        formData.append("filePaths", relativePath);

        console.log(`   📄 File ${i + 1}: ${relativePath}`);
      }

      formData.append("uploadType", uploadType || "file");
      formData.append("rootFolderName", rootFolderName);

      const token = localStorage.getItem("token");
      console.log("\n🔑 Token:", token ? "Found ✅" : "Not found ❌");
      console.log("📍 Upload endpoint:", uploadUrl);

      const response = await axios.post(uploadUrl, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("✅ Upload response:", response.data);

      // Store uploaded files
      if (response.data.files) {
        response.data.files.forEach((uploadedFile: any) => {
          const newFile: UploadedFile = {
            id: Date.now() + Math.random(),
            name: uploadedFile.filename,
            size: uploadedFile.size / (1024 * 1024),
            type: uploadedFile.mimeType || "file",
            url: uploadedFile.s3Url,
            uploadType: uploadType as UploadType,
          };
          setFiles((prev) => [newFile, ...prev]);
          setUsedStorage((prev) => prev + newFile.size);
        });
      }

      setSelectedFiles([]);
      setUploadType(null);
      setFolderStructure(null);
      alert("✅ Files uploaded successfully!");
      setLoading(false);
    } catch (error: any) {
      console.error("❌ Upload failed:", error);
      const errorMsg = error.response?.data?.message || error.message || "Upload failed";
      setError(errorMsg);
      alert("❌ " + errorMsg);
      setLoading(false);
    }
  };
  const handleDelete = (id: number, size: number) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    setUsedStorage((prev) => prev - size);
    console.log("🗑️ File deleted");
  };

  const getFileIcon = (uploadType: UploadType, fileType: string) => {
    if (uploadType === "photo") return <ImageIcon className="text-blue-500" />;
    if (uploadType === "video") return <Video className="text-purple-500" />;
    if (uploadType === "folder") return <Folder className="text-yellow-600" />;
    if (fileType.includes("pdf")) return <FileText className="text-red-500" />;
    return <FileIcon className="text-gray-500" />;
  };

  const renderFolderStructure = (node: FolderNode, isRoot: boolean = false) => (
    <div style={{ marginLeft: isRoot ? 0 : 20 }}>
      {!isRoot && <strong className="text-blue-600">📁 {node.name}</strong>}
      {node.files && node.files.length > 0 && (
        <div style={{ marginLeft: 10 }}>
          {node.files.map((f) => (
            <div key={f.name} className="text-sm text-gray-700 py-1">
              📄 {f.name} - {(f.size / (1024 * 1024)).toFixed(2)} MB
            </div>
          ))}
        </div>
      )}
      {node.children && node.children.length > 0 && (
        <div>
          {node.children.map((child) => (
            <div key={child.name}>
              {renderFolderStructure(child)}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col items-center py-10 px-4">
      <div className="max-w-4xl w-full bg-white p-8 rounded-2xl shadow-xl">
        <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
          Mini Drive – Upload Everything
        </h1>

        {/* Upload Type Selection */}
        {!uploadType ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {(Object.keys(uploadConfig) as UploadType[]).map((type) => (
              <button
                key={type}
                onClick={() => setUploadType(type)}
                className={`flex flex-col items-center justify-center p-8 rounded-xl border-2 border-gray-200 hover:border-purple-500 transition transform hover:scale-105 bg-gradient-to-br ${uploadConfig[type].color} hover:shadow-lg`}
              >
                <div className="text-white mb-3">{uploadConfig[type].icon}</div>
                <span className="text-white font-semibold capitalize">{type}</span>
              </button>
            ))}
          </div>
        ) : (
          <>
            {/* Back Button */}
            <div className="flex items-center mb-6 gap-3">
              <button
                onClick={() => {
                  setUploadType(null);
                  setSelectedFiles([]);
                  setError("");
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                <X size={20} />
                Back
              </button>
              <h2 className={`text-2xl font-bold capitalize bg-gradient-to-r ${uploadConfig[uploadType].color} text-transparent bg-clip-text`}>
                {uploadConfig[uploadType].label}
              </h2>
            </div>

            {/* Upload Section */}
            <div className="flex flex-col items-center border-2 border-dashed border-gray-300 rounded-xl p-10 mb-6 hover:border-purple-500 transition bg-gray-50">
              <div className={`text-transparent bg-gradient-to-r ${uploadConfig[uploadType].color} bg-clip-text mb-3`}>
                {uploadConfig[uploadType].icon}
              </div>
              <p className="text-gray-600 mb-2">Drag & drop or click to upload</p>

              <input
                type="file"
                accept={uploadType !== "folder" ? uploadConfig[uploadType].accept : undefined}
                onChange={handleFileChange}
                className="hidden"
                id="fileInput"
                multiple
                {...(uploadType === "folder" ? { webkitdirectory: "", mozdirectory: "", directory: "" } : {})}
              />

              <label
                htmlFor="fileInput"
                className={`px-5 py-2 bg-gradient-to-r ${uploadConfig[uploadType].color} text-white rounded-lg cursor-pointer hover:scale-105 transition`}
              >
                Choose {uploadType === "folder" ? "Folder" : "Files"}
              </label>

              {selectedFiles.length > 0 && (
                <div className="mt-6 w-full">
                  <div className="mb-4 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-white">
                    {uploadType === "folder" && folderStructure ? (
                      <div>
                        <p className="font-semibold text-gray-800 mb-2">📂 Folder Structure:</p>
                        {renderFolderStructure(folderStructure, true)}
                      </div>
                    ) : (
                      selectedFiles.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between py-2 border-b last:border-b-0">
                          <span className="text-sm text-gray-700 truncate">{file.name}</span>
                          <span className="text-xs text-gray-500 ml-2">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                  <button
                    onClick={handleUpload}
                    disabled={loading}
                    className={`w-full px-4 py-2 rounded-lg font-semibold transition ${loading
                      ? "bg-gray-400 cursor-not-allowed text-gray-600"
                      : `bg-gradient-to-r ${uploadConfig[uploadType].color} text-white hover:shadow-lg`
                      }`}
                  >
                    {loading ? "Uploading..." : `Upload ${selectedFiles.length} ${uploadType}`}
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Storage Info */}
        {files.length > 0 && (
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-700">Storage Used:</h2>
            <span className="text-purple-600 font-bold">{usedStorage.toFixed(2)} MB</span>
          </div>
        )}

        {/* Uploaded Files List */}
        {files.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Uploaded Files ({files.length})</h3>
            <div className="grid gap-3">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between border border-gray-200 rounded-lg p-4 hover:shadow-md transition bg-gray-50"
                >
                  <div className="flex items-center gap-3 flex-1">
                    {getFileIcon(file.uploadType, file.type)}
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 truncate">{file.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{file.uploadType} • {file.size.toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(file.id, file.size)}
                    className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {files.length === 0 && uploadType === null && (
          <p className="text-center text-gray-500 py-8">No files uploaded yet. Choose a type to get started!</p>
        )}
      </div>
    </div>
  );
};

export default UploadPage;