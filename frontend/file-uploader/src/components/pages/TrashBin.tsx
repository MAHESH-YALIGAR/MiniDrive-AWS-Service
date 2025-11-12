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

  // Restore a file
  const handleRestore = async (file: TrashFile) => {
    const fileId = file.key;
    if (!fileId) {
      console.error("Restore failed: file ID is missing");
      addToast("error", "Restore failed: file ID is missing");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8000/api/getfiles/restorefile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ filekey: fileId }),
      });

      if (!res.ok) throw new Error("Restore failed");

      setTrashFiles(trashFiles.filter((f) => (f._id || f.id || f.key) !== fileId));
      addToast("success", `"${file.name}" has been restored successfully!`);
      await fetchTrash();
    } catch (err) {
      console.error("Failed to restore file:", err);
      addToast("error", `Failed to restore "${file.name}"`);
    }
  };

  // Delete permanently
  const handleDelete = async (file: TrashFile) => {
    const fileId = file._id || file.id || file.key;
    console.log("you frontend id is", fileId);
    if (!fileId) {
      console.error("Delete failed: file ID is missing");
      addToast("error", "Delete failed: file ID is missing");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this file permanently?")) return;

    try {
      const token = localStorage.getItem("token");
      console.log("Deleting file with ID:", fileId);

      const res = await fetch("http://localhost:8000/api/getfiles/deletepermently", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ filekey: fileId }),
      });

      if (!res.ok) throw new Error("Delete failed");

      const data = await res.json();
      console.log("Delete response:", data);

      setTrashFiles(trashFiles.filter((f) => (f._id || f.id || f.key) !== fileId));
      addToast("success", `"${file.name}" has been permanently deleted!`);
    } catch (err) {
      console.error("Failed to delete file permanently:", err);
      addToast("error", `Failed to delete "${file.name}"`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin text-blue-600 w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Trash2 className="text-red-600" /> Trash Bin
        </h1>

        {trashFiles.length === 0 ? (
          <div className="text-center text-gray-500 mt-20">
            <Trash2 className="mx-auto text-gray-400 w-16 h-16 mb-4" />
            <p className="text-lg">Your trash is empty!</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {trashFiles.map((file) => {
              const fileId = file._id || file.id || file.key;
              return (
                <div
                  key={fileId}
                  className="bg-white shadow-md rounded-2xl p-4 flex flex-col items-center justify-between hover:shadow-lg transition-all"
                >
                  <div className="text-center">
                    <p className="font-medium text-gray-800">{file.name}</p>
                    <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Deleted: {new Date(file.lastModified
).toLocaleString()}
                    </p>

                    <p className="text-xs text-red-900 mt-1">
                      {(() => {
                        const daysPassed = Math.floor((Date.now() - new Date(file.deletedAt)) / (1000 * 60 * 60 * 24));
                        const daysLeft = Math.max(5 - daysPassed, 0);
                        return daysLeft > 0
                          ? `🗓️ ${daysLeft} day${daysLeft > 1 ? "s" : ""} left before permanent deletion`
                          : "⚠️ File will be deleted soon";
                      })()}
                    </p>
                  </div>

                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => handleRestore(file)}
                      className="px-3 py-2 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 flex items-center gap-1"
                    >
                      <RotateCcw size={16} /> Restore
                    </button>
                    <button
                      onClick={() => handleDelete(file)}
                      className="px-3 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 flex items-center gap-1"
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

      {/* Toast Notifications */}
      <div className="fixed top-6 right-6 space-y-3 z-50">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white animate-in fade-in slide-in-from-top-2 ${
              toast.type === "success" ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle size={20} />
            ) : (
              <AlertCircle size={20} />
            )}
            <span className="flex-1">{toast.message}</span>
            <button
              onClick={() => setToasts(toasts.filter((t) => t.id !== toast.id))}
              className="hover:opacity-80"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrashBin;