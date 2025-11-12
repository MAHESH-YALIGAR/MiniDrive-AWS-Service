import React, { useState, ChangeEvent } from "react";
import { Upload, FileText, Image as ImageIcon, Trash2 } from "lucide-react";
import axios from "axios"

interface UploadedFile {
  id: number;
  name: string;
  size: number;
  type: string;
  url: string;
}

const UploadPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [usedStorage, setUsedStorage] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError("");
      console.log("✅ File selected:", file.name);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please choose a file");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 1️⃣ Create FormData
      const formData = new FormData();
      formData.append("file", selectedFile);

      console.log("📤 Uploading file:", selectedFile.name);
      console.log("📤 File size:", selectedFile.size, "bytes");

      // 2️⃣ Get token from localStorage
      const token = localStorage.getItem('token');
      console.log("🔑 Token:", token ? "Found ✅" : "Not found ❌");

      // 3️⃣ Send to backend
      const response = await axios.post(
        'http://localhost:8000/api/file/upload',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log("✅ Upload response:", response.data);

      // 4️⃣ Get file info from backend response
      const data = response.data;

      // 5️⃣ Create file entry for display
      const newFile: UploadedFile = {
        id: Date.now(),
        name: selectedFile.name,
        size: parseFloat((selectedFile.size / (1024 * 1024)).toFixed(2)), // Convert to MB
        type: selectedFile.type,
        url: data.url || URL.createObjectURL(selectedFile),
      };

      // 6️⃣ Update UI
      setFiles((prev) => [newFile, ...prev]);
      setUsedStorage((prev) => prev + newFile.size);
      setSelectedFile(null);

      alert("✅ File uploaded successfully!");
      setLoading(false);
    } catch (error: any) {
      console.error("❌ Upload failed:", error);
      
      // Show detailed error
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col items-center py-10 px-4">
      <div className="max-w-3xl w-full bg-white p-8 rounded-2xl shadow-xl">
        <h1 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
          Mini Drive – Upload Files
        </h1>

        {/* Upload Section */}
        <div className="flex flex-col items-center border-2 border-dashed border-gray-300 rounded-xl p-10 mb-6 hover:border-purple-500 transition">
          <Upload size={40} className="text-purple-500 mb-3" />
          <p className="text-gray-600 mb-2">Drag & drop or click to upload</p>

          <input
            type="file"
            accept=".pdf,image/*"
            onChange={handleFileChange}
            className="hidden"
            id="fileInput"
          />

          <label
            htmlFor="fileInput"
            className="px-5 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg cursor-pointer hover:scale-105 transition"
          >
            Choose File
          </label>

          {selectedFile && (
            <div className="mt-4 text-sm text-gray-700 flex items-center gap-3">
              <span>
                Selected: <strong>{selectedFile.name}</strong>
              </span>
              <button
                onClick={handleUpload}
                disabled={loading}
                className={`px-3 py-1 rounded transition ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                {loading ? "Uploading..." : "Upload"}
              </button>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Storage Info */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-700">Storage Used:</h2>
          <span className="text-purple-600 font-bold">{usedStorage.toFixed(2)} MB</span>
        </div>

        {/* Uploaded Files List */}
        <div className="grid gap-4">
          {files.length === 0 ? (
            <p className="text-center text-gray-500">No files uploaded yet.</p>
          ) : (
            files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
              >
                <div className="flex items-center gap-3">
                  {file.type.includes("pdf") ? (
                    <FileText className="text-red-500" />
                  ) : (
                    <ImageIcon className="text-blue-500" />
                  )}
                  <div>
                    <p className="font-semibold text-gray-800">{file.name}</p>
                    <p className="text-sm text-gray-500">{file.size.toFixed(2)} MB</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    View
                  </a>
                  <button
                    onClick={() => handleDelete(file.id, file.size)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadPage;