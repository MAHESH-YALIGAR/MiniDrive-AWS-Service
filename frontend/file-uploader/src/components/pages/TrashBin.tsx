import React, { useEffect, useState } from "react";
import { Trash2, RotateCcw, Loader2, CheckCircle, AlertCircle, X } from "lucide-react";

interface TrashFile {
  _id?: string;
  id?: string;
  key?: string;
  name: string;
  size: number;
  deletedAt: string;
  fileUrl: string;
}

interface Toast {
  id: string;
  type: "success" | "error";
  message: string;
}

const TrashBin: React.FC = () => {
  const [trashFiles, setTrashFiles] = useState<TrashFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Add toast notification
  const addToast = (type: "success" | "error", message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  // Get display name by removing UUID prefix
  // const getDisplayName = (filename: string) => {
  //   const match = filename.match(/^[a-f0-9\-]+-(.+)$/);
  //   return match ? match[1] : filename;
  // };

  const getDisplayName = (filename: string) => {
  // 1️⃣ If it is a folder file encoded with "~"
  if (filename.includes("~")) {
    return filename.split("~").pop() || filename;
  }

  // 2️⃣ If it is a normal uuid-prefixed file
  const uuidMatch = filename.match(/^[a-f0-9\-]+-(.+)$/);
  if (uuidMatch) {
    return uuidMatch[1];
  }

  // 3️⃣ Default - return the same name
  return filename;
};


  // Fetch trashed files
  const fetchTrash = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:8000/api/getfiles/gettrust", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      const files = Array.isArray(data) ? data : data.files;
      console.log("Fetched trash files:", files);
      setTrashFiles(files || []);
    } catch (err) {
      console.error("❌ Failed to load trash:", err);
      addToast("error", "Failed to load trash files");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrash();
  }, []);

  // ✅ FIXED: Restore a file
  const handleRestore = async (file: TrashFile) => {
    const fileKey = file.key;
    
    console.log("🔍 Restore debug:", { file, fileKey });

    if (!fileKey) {
      console.error("❌ Restore failed: file key is missing");
      addToast("error", "Restore failed: file key is missing");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        addToast("error", "No authentication token found");
        return;
      }

      console.log("📤 Sending restore request with key:", fileKey);

      const res = await fetch("http://localhost:8000/api/getfiles/restorefile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ filekey: fileKey }),
      });

      console.log("Response status:", res.status);
      const responseData = await res.json();
      console.log("Response data:", responseData);

      if (!res.ok) {
        throw new Error(responseData.message || "Restore failed");
      }

      // Remove from trash list
      setTrashFiles(trashFiles.filter((f) => f.key !== fileKey));
      addToast("success", `"${getDisplayName(file.name)}" restored successfully!`);
      
    } catch (err) {
      console.error("❌ Restore error:", err);
      addToast("error", `Failed to restore: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  };

  // ✅ FIXED: Delete permanently
  const handleDelete = async (file: TrashFile) => {
    const fileKey = file.key;

    console.log("🔍 Delete debug:", { file, fileKey });

    if (!fileKey) {
      console.error("❌ Delete failed: file key is missing");
      addToast("error", "Delete failed: file key is missing");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this file permanently?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        addToast("error", "No authentication token found");
        return;
      }

      console.log("🗑️ Sending delete request with key:", fileKey);

      const res = await fetch("http://localhost:8000/api/getfiles/deletepermently", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ filekey: fileKey }),
      });

      console.log("Response status:", res.status);
      const responseData = await res.json();
      console.log("Response data:", responseData);

      if (!res.ok) {
        throw new Error(responseData.message || "Delete failed");
      }

      // Remove from trash list
      setTrashFiles(trashFiles.filter((f) => f.key !== fileKey));
      addToast("success", `"${getDisplayName(file.name)}" deleted permanently!`);

    } catch (err) {
      console.error("❌ Delete error:", err);
      addToast("error", `Failed to delete: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin text-blue-600 w-8 h-8" />
      </div>
    );
  }

  function formatFileSize(bytes?: number | null): string {
    if (bytes === undefined || bytes === null || isNaN(bytes as any)) return "Unknown size";
    if (bytes === 0) return "0 Bytes";
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const value = bytes / Math.pow(1024, i);
    return `${value.toFixed(2)} ${sizes[i]}`;
  }

  const getFileIcon = (filename = "") => {
    const ext = filename.split(".").pop()?.toLowerCase();
    if (!ext || !filename.includes(".")) return "📁";

    const icons: { [key: string]: string } = {
      pdf: "📄", doc: "📘", docx: "📘", txt: "📝", csv: "📊",
      xls: "📗", xlsx: "📗", ppt: "📕", pptx: "📕",
      jpg: "🖼️", jpeg: "🖼️", png: "🖼️", gif: "🎞️", svg: "🎨", webp: "🌄",
      mp4: "🎬", mov: "🎥", avi: "📹", mkv: "📼",
      mp3: "🎵", wav: "🔊", ogg: "🎶",
      js: "🟨", jsx: "⚛️", ts: "🟦", tsx: "💠", html: "🌐", css: "🎨", json: "🧾",
      py: "🐍", java: "☕", cpp: "💻", c: "💽", php: "🐘",
      zip: "🗜️", rar: "📦", tar: "🧰", gz: "🧳",
    };

    return icons[ext] || "📦";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-3">
            <Trash2 className="text-red-600" /> Trash Bin
          </h1>
          <p className="text-gray-600 mt-2">Files here will be permanently deleted after 30 days</p>
        </div>

        {/* Toast Notifications */}
        <div className="fixed top-4 right-4 space-y-2 z-50">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${
                toast.type === "success"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {toast.type === "success" ? (
                <CheckCircle size={20} />
              ) : (
                <AlertCircle size={20} />
              )}
              <span>{toast.message}</span>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {trashFiles.length === 0 ? (
          <div className="text-center py-20">
            <Trash2 className="mx-auto text-gray-400 w-16 h-16 mb-4" />
            <p className="text-xl text-gray-600 font-semibold">Your trash is empty!</p>
            <p className="text-gray-500 mt-2">Deleted files will appear here</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {trashFiles.map((file) => {
              const fileId = file._id || file.id || file.key;
              const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name);
              const isVideo = /\.(mp4|mov|avi|webm)$/i.test(file.name);
              const daysPassed = Math.floor(
                (Date.now() - new Date(file.deletedAt)) / (1000 * 60 * 60 * 24)
              );
              const daysLeft = Math.max(30 - daysPassed, 0);

              return (
                <div
                  key={fileId}
                  className="relative group bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-2xl hover:border-blue-200 transition-all duration-300 overflow-hidden flex flex-col"
                >
                  {/* File Preview */}
                  <div className="relative flex justify-center items-center h-40 bg-gray-50 overflow-hidden">
                    {isImage ? (
                      <img
                        src={file.url || file.name}
                        alt={file.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : isVideo ? (
                      <video
                        src={file.url || file.name}
                        className="w-full h-full object-cover"
                        muted
                      />
                    ) : (
                      <div className="text-6xl text-gray-500 group-hover:text-blue-600 transition-transform duration-300">
                        {getFileIcon(file.name)}
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="p-4 flex flex-col flex-grow text-center">
                    <p className="font-semibold text-gray-800 truncate mb-1">
                      {getDisplayName(file.name)}
                    </p>
                    <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Deleted: {new Date(file.lastModified).toLocaleString()}
                    </p>
                    <p
                      className={`text-xs mt-2 font-medium ${
                        daysLeft > 0 ? "text-red-600" : "text-red-800"
                      }`}
                    >
                      {daysLeft > 0
                        ? `🗓️ ${daysLeft} day${daysLeft > 1 ? "s" : ""} left`
                        : "⚠️ Deleting soon"}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-between items-center p-3 border-t border-gray-100 bg-gray-50">
                    <button
                      onClick={() => handleRestore(file)}
                      className="px-3 py-2 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 flex items-center gap-1 text-sm font-medium transition"
                    >
                      <RotateCcw size={16} /> Restore
                    </button>
                    <button
                      onClick={() => handleDelete(file)}
                      className="px-3 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 flex items-center gap-1 text-sm font-medium transition"
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrashBin;





