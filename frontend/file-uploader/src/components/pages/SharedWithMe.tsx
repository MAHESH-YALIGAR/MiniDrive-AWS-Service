import React, { useEffect, useState } from "react";
import { CheckCircle, AlertCircle, X } from "lucide-react";
import axios from "axios";

interface SharedFile {
  shareId: string;
  fileName: string;
  fileUrl: string;
  owneremail: string;
  createdAt?: string;
}

interface Toast {
  id: string;
  type: "success" | "error";
  message: string;
}

const SharedWithMe: React.FC = () => {
  const [sharedFiles, setSharedFiles] = useState<SharedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Add toast notification
  const addToast = (type: "success" | "error", message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  // ✅ Fetch files shared with this user
  useEffect(() => {
    const fetchSharedFiles = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setError("No token found. Please log in again.");
          setLoading(false);
          return;
        }

        const response = await axios.get("http://localhost:8000/api/share/shared-with-me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setSharedFiles(response.data.files || []);
      } catch (err) {
        console.error("Error fetching shared files:", err);
        setError("Failed to load shared files.");
        addToast("error", "Failed to load shared files");
      } finally {
        setLoading(false);
      }
    };

    fetchSharedFiles();
  }, []);

  // ✅ Clear/Delete shared file
  const handleClear = async (shareId: string, fileName: string) => {
    console.log("Clearing file:", shareId);
    const token = localStorage.getItem("token");
    try {
      const response = await axios.delete(`http://localhost:8000/api/share/delete/${shareId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Remove from list
      setSharedFiles(sharedFiles.filter((file) => file.shareId !== shareId));
      addToast("success", `"${fileName}" has been cleared successfully!`);
      console.log("File cleared successfully:", response.data);
    } catch (error) {
      console.log("Error clearing file:", error);
      addToast("error", `Failed to clear "${fileName}"`);
    }
  };

  // ✅ Open file
  const handleOpen = async (shareId: string, fileName: string) => {
    const token = localStorage.getItem("token");
    console.log("🔍 Calling:", `http://localhost:8000/api/share/${shareId}`);

    try {
      const res = await axios.get(
        `http://localhost:8000/api/share/${shareId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("✅ File details:", res.data.file);

      const Url = res.data.url || res.data.file.fileUrl;
      if (!Url) {
        addToast("error", "File URL missing");
        return;
      }

      window.open(Url, "_blank");
      addToast("success", `Opening "${fileName}"...`);
    } catch (error) {
      console.error("❌ Error opening shared file:", error);
      addToast("error", `Failed to open "${fileName}"`);
    }
  };

  // ✅ Download file directly
  const handleDownload = async (shareId: string, fileName: string) => {
    const token = localStorage.getItem("token");
    try {
      console.log("Downloading file for shareId:", shareId);

      const res = await axios.get(`http://localhost:8000/api/share/${shareId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const { url, fileName: backendFileName } = res.data;

      const fileResponse = await axios.get(url, { responseType: "blob" });

      const blobUrl = window.URL.createObjectURL(new Blob([fileResponse.data]));

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = backendFileName || fileName || "download.pdf";
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      addToast("success", `"${fileName}" downloaded successfully!`);
      console.log("✅ File downloaded successfully");
    } catch (error) {
      console.error("❌ Error downloading file:", error);
      addToast("error", `Failed to download "${fileName}"`);
    }
  };

  // ✅ Copy link to clipboard
  const handleCopy = (shareId: string, fileName: string) => {
    const shareUrl = `${window.location.origin}/shared/${shareId}`;

    navigator.clipboard.writeText(shareUrl);
    addToast("success", `Link copied to clipboard!`);
  };

  if (loading) return <p className="text-center text-gray-500">Loading shared files...</p>;
  if (error) return <p className="text-red-500 text-center">{error}</p>;

  return (
    <div className="max-w-4xl mx-auto mt-8 p-4 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl text-red-400 font-semibold mb-4 text-center">📂 Files Shared With Me</h2>

      {sharedFiles.length === 0 ? (
        <p className="text-gray-500 text-center">No files shared with you yet.</p>
      ) : (
        <ul className="space-y-4">
          {sharedFiles.map((file) => (
            <li
              key={file.shareId}
              className="flex justify-between items-center border rounded-lg p-3 hover:bg-gray-50 transition"
            >
              <div>
                <p className="font-medium">{file.fileName}</p>
                <p className="text-sm text-gray-500">
                  Shared by: {file.owneremail}
                  {file.createdAt && ` • ${new Date(file.createdAt).toLocaleString()}`}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleOpen(file.shareId, file.fileName)}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Open
                </button>
                <button
                  onClick={() => handleDownload(file.shareId, file.fileName)}
                  className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Download
                </button>
                <button
                  onClick={() => handleCopy(file.shareId, file.fileName)}
                  className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Copy
                </button>
                <button
                  onClick={() => handleClear(file.shareId, file.fileName)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Clear
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

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

export default SharedWithMe;