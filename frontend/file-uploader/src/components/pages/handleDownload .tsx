import React, { useEffect, useState } from "react";
import axios from "axios";

interface SharedFile {
  _id: string;
  shareId: string;
  fileName: string;
  fileSize: number;
  sharedBy: string;
  sharedAt: string;
  expiresAt: string;
}

const formatSize = (bytes: number) =>
  bytes < 1024
    ? `${bytes} B`
    : bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(2)} KB`
      : `${(bytes / (1024 * 1024)).toFixed(2)} MB`;

const getFileIcon = (filename: string): string => {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  const icons: Record<string, string> = {
    pdf: "📄", doc: "📘", docx: "📘", txt: "📝",
    jpg: "🖼️", jpeg: "🖼️", png: "🖼️", gif: "🖼️",
    zip: "📦", rar: "📦", mp4: "🎬", mp3: "🎵",
    xlsx: "📊", csv: "📊",
  };
  return icons[ext] || "📁";
};

const SharedFilesPage: React.FC = () => {
  const [sharedFiles, setSharedFiles] = useState<SharedFile[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<SharedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [downloading, setDownloading] = useState<string | null>(null);

  const API_BASE_URL = "http://localhost:8000";

  // Fetch shared files
  const fetchSharedFiles = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("❌ Please login first");
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `${API_BASE_URL}/api/share/shared-with-me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("✅ Shared files fetched:", response.data);

      if (response.data.success && Array.isArray(response.data.files)) {
        setSharedFiles(response.data.files);
        setFilteredFiles(response.data.files);
      } else if (Array.isArray(response.data)) {
        setSharedFiles(response.data);
        setFilteredFiles(response.data);
      }
    } catch (err) {
      console.error("❌ Error fetching shared files:", err);
      setError("Failed to load shared files");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSharedFiles();
  }, []);

  // Filter files based on search
  useEffect(() => {
    const filtered = sharedFiles.filter(
      (file) =>
        file.fileName.toLowerCase().includes(search.toLowerCase()) ||
        file.sharedBy.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredFiles(filtered);
  }, [search, sharedFiles]);

  // Handle open/view file
  const handleOpenFile = async (shareId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_BASE_URL}/api/share/s/${shareId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("✅ File opened:", response.data);

      if (response.data.url) {
        window.open(response.data.url, "_blank");
      }
    } catch (error) {
      console.error("❌ Error opening file:", error);
      alert("Failed to open file");
    }
  };

  // Handle download
  const handleDownload = async (shareId: string, fileName: string) => {
    setDownloading(shareId);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_BASE_URL}/api/share/s/${shareId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.url) {
        const link = document.createElement("a");
        link.href = response.data.url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error("❌ Download error:", error);
      alert("Failed to download file");
    } finally {
      setDownloading(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  // Loading State
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading shared files...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-sm">
          <p className="text-3xl mb-4">⚠️</p>
          <p className="text-gray-600 font-medium">{error}</p>
          <button
            onClick={fetchSharedFiles}
            className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
          >
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-slate-900">📤 Shared with Me</h1>
              <p className="text-slate-600 mt-2">Access files shared by others</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("list")}
                className={`px-4 py-2 rounded-lg transition-all ${
                  viewMode === "list"
                    ? "bg-blue-500 text-white shadow-lg"
                    : "bg-white text-slate-600 border border-slate-200 hover:border-blue-300"
                }`}
              >
                📋 List
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`px-4 py-2 rounded-lg transition-all ${
                  viewMode === "grid"
                    ? "bg-blue-500 text-white shadow-lg"
                    : "bg-white text-slate-600 border border-slate-200 hover:border-blue-300"
                }`}
              >
                🔲 Grid
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">🔍</span>
            <input
              type="text"
              placeholder="Search files or people..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
            />
          </div>
        </div>

        {/* Empty State */}
        {filteredFiles.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-6xl mb-4">📭</p>
            <p className="text-2xl text-slate-900 font-medium mb-2">
              {search ? "No files found" : "No shared files yet"}
            </p>
            <p className="text-slate-600">
              {search
                ? "Try searching with different keywords"
                : "Files shared with you will appear here"}
            </p>
          </div>
        ) : viewMode === "grid" ? (
          // Grid View
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredFiles.map((file) => (
              <div
                key={file._id}
                className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100 hover:border-blue-300"
              >
                {/* File Icon Header */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 flex items-center justify-center border-b border-slate-100">
                  <span className="text-6xl group-hover:scale-110 transition-transform">
                    {getFileIcon(file.fileName)}
                  </span>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                      {file.fileName.split(".").pop()?.toUpperCase()}
                    </span>
                    {isExpired(file.expiresAt) && (
                      <span className="inline-block px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded">
                        ⏰ Expired
                      </span>
                    )}
                  </div>

                  <h3 className="font-semibold text-slate-900 text-sm mb-2 line-clamp-2 group-hover:text-blue-600">
                    {file.fileName}
                  </h3>

                  <div className="space-y-2 text-xs text-slate-600 mb-4">
                    <div>👤 From: {file.sharedBy}</div>
                    <div>📅 {formatDate(file.sharedAt)}</div>
                    <div>💾 {formatSize(file.fileSize)}</div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenFile(file.shareId)}
                      disabled={isExpired(file.expiresAt)}
                      className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    >
                      👁️ View
                    </button>
                    <button
                      onClick={() => handleDownload(file.shareId, file.fileName)}
                      disabled={downloading === file.shareId || isExpired(file.expiresAt)}
                      className="flex-1 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    >
                      {downloading === file.shareId ? "⏳" : "⬇️"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // List View
          <div className="space-y-3">
            {filteredFiles.map((file) => (
              <div
                key={file._id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all border border-slate-100 hover:border-blue-300 p-4 flex items-center justify-between group"
              >
                <div className="flex items-center gap-4 flex-1">
                  <span className="text-3xl">{getFileIcon(file.fileName)}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 truncate">
                      {file.fileName}
                    </h3>
                    <div className="flex items-center gap-4 text-xs text-slate-600 mt-1">
                      <span>👤 {file.sharedBy}</span>
                      <span>📅 {formatDate(file.sharedAt)}</span>
                      <span>💾 {formatSize(file.fileSize)}</span>
                      {isExpired(file.expiresAt) && (
                        <span className="text-red-600 font-semibold">⏰ Expired</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleOpenFile(file.shareId)}
                    disabled={isExpired(file.expiresAt)}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition disabled:opacity-50 text-sm font-medium"
                  >
                    👁️ View
                  </button>
                  <button
                    onClick={() => handleDownload(file.shareId, file.fileName)}
                    disabled={downloading === file.shareId || isExpired(file.expiresAt)}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition disabled:opacity-50 text-sm font-medium"
                  >
                    {downloading === file.shareId ? "⏳" : "⬇️"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        {filteredFiles.length > 0 && (
          <div className="mt-8 p-4 bg-white rounded-lg border border-slate-200">
            <p className="text-sm text-slate-600">
              📊 Showing <span className="font-semibold">{filteredFiles.length}</span> of{" "}
              <span className="font-semibold">{sharedFiles.length}</span> shared files
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SharedFilesPage;