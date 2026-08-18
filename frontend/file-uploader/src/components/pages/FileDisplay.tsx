
import axios from 'axios';
import React, { useEffect, useState } from "react";
const bucketName = import.meta.env.VITE_AWS_BUCKET;


interface FileItem {
  Key: string;
  Size: number;
  LastModified: string;
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





const FileManager: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filteredFiles, setFilteredFiles] = useState<FileItem[]>([]);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedFileForShare, setSelectedFileForShare] = useState<string | null>(null);
  const [shareEmail, setShareEmail] = useState("");
  const [sharing, setSharing] = useState(false);
  const [availableEmails, setAvailableEmails] = useState<string[]>([]);
  const [emailsLoading, setEmailsLoading] = useState(false);
  const [emailSearch, setEmailSearch] = useState("");

  const API_URL = import.meta.env.VITE_BACKEND_API + "/api/getfiles/getfiles";

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(API_URL, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch files");
      const data = await response.json();
      // console.log("data.url.................",file.url)
      if (data.success && data.files) {
        setFiles(data.files);
        setFilteredFiles(data.files);
        console.log("✅ Files fetched successfully");
      }
    } catch (err) {
      console.error("❌ Error fetching files:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  useEffect(() => {
    const filtered = files.filter((file) =>
      file.Key.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredFiles(filtered);
  }, [search, files]);

  const handleDownload = async (key: string) => {
    const token = localStorage.getItem("token");
    setDownloading(key);

    try {
      const backendApi = import.meta.env.VITE_BACKEND_API;
      const res = await axios.get(`${backendApi}/api/getfiles/download`, {
        params: { key },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const downloadUrl = res.data.url;

      if (downloadUrl) {
        window.open(downloadUrl, "_blank");
      } else {
        alert("❌ Download URL not found");
      }
    } catch (error) {
      console.error("❌ Error in download:", error);
      alert("Failed to download file");
    } finally {
      setDownloading(null);
    }
  };

  const handleShare = async (key: string) => {
    const token = localStorage.getItem("token");

    try {
      const backendApi = import.meta.env.VITE_BACKEND_API;
      const res = await axios.post(
        `${backendApi}/api/presign/download-url`,
        { key, expires: 3600 * 24 },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const shareUrl = res.data.url;

      if (shareUrl) {
        await navigator.clipboard.writeText(shareUrl);
        alert("✅ Share link copied to clipboard!");
      } else {
        alert("❌ Failed to generate share link");
      }
    } catch (error) {
      console.error("❌ Share error:", error);
      alert("Failed to share file");
    }
  };

  const handleDelete = async (key: string) => {
    if (!confirm(`🗑️ Are you sure you want to delete this file?\n\n${getFileName(key)}`)) {
      return;
    }

    const token = localStorage.getItem("token");
    setDeleting(key);

    try {
      console.log("🗑️ Deleting file:", key);

      const backendApi = import.meta.env.VITE_BACKEND_API;
      const res = await axios.post(
        `${backendApi}/api/getfiles/move-to-trash`,
        { key },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("✅ Delete response:", res.data);
      alert("✅ File moved to trash successfully!");

      // Remove from local state immediately
      const updatedFiles = files.filter(file => file.Key !== key);
      setFiles(updatedFiles);
      setFilteredFiles(updatedFiles.filter(f => f.Key.toLowerCase().includes(search.toLowerCase())));

      // Fetch fresh data after a short delay
      setTimeout(() => {
        fetchFiles();
      }, 500);

    } catch (error) {
      console.error("❌ Error deleting file:", error);
      alert("❌ Failed to delete file");
    } finally {
      setDeleting(null);
    }
  };

  const getFileName = (key: string) => {
    const fullPath = key.split("/").pop() || key;

    // Remove UUID prefix (format: uuid-filename)
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-(.+)$/i;
    const match = fullPath.match(uuidPattern);

    return match ? match[1] : fullPath;
  };
  const openShareModal = (key: string) => {
    setSelectedFileForShare(key);
    setShareEmail("");
    setEmailSearch("");
    setShowShareModal(true);
    fetchEmails();
  };

  const fetchEmails = async () => {
    const token = localStorage.getItem("token");
    setEmailsLoading(true);

    try {
      const backendApi = import.meta.env.VITE_BACKEND_API;
      const res = await axios.get(`${backendApi}/api/share/getemail`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("📧 Emails fetched:", res.data);

      if (res.data.success && Array.isArray(res.data.emails)) {
        setAvailableEmails(res.data.emails);
      } else if (Array.isArray(res.data)) {
        setAvailableEmails(res.data);
      } else if (res.data.data && Array.isArray(res.data.data)) {
        setAvailableEmails(res.data.data);
      }
    } catch (error) {
      console.error("❌ Error fetching emails:", error);
    } finally {
      setEmailsLoading(false);
    }
  };

  const closeShareModal = () => {
    setShowShareModal(false);
    setSelectedFileForShare(null);
    setShareEmail("");
    setEmailSearch("");
    setAvailableEmails([]);
  };



  const submitShare = async () => {
    if (!shareEmail.trim()) {
      alert("❌ Please enter an email address");
      return;
    }

    if (!shareEmail.includes("@")) {
      alert("❌ Please enter a valid email address");
      return;
    }

    const token = localStorage.getItem("token");
    setSharing(true);

    try {
      console.log("📧 Sharing file with:", shareEmail);
      console.log("File Key:", selectedFileForShare);

      const fileName = getFileName(selectedFileForShare || ""); // Fixed: Call the function
      const backendApi = import.meta.env.VITE_BACKEND_API;
      const res = await axios.post(
        `${backendApi}/api/share/shareing`,
        {
          fileKey: selectedFileForShare,
          sharedWith: shareEmail,
          fileName: fileName, // Fixed: Pass the actual filename string
          expires: 3600 * 24
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("✅ Share response:", res.data);
      alert(`✅ File shared successfully with ${shareEmail}!`);
      closeShareModal();

    } catch (error) {
      console.error("❌ Share error:", error);
      alert("❌ Failed to share file. Please try again.");
    } finally {
      setSharing(false);
    }
  };
  if (loading && files.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your files...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">📁 My Files & Photos</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("list")}
            className={`px-4 py-2 rounded ${viewMode === "list" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          >
            📋 List
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`px-4 py-2 rounded ${viewMode === "grid" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          >
            🔲 Grid
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="🔍 Search files..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Files Display */}
      {filteredFiles.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-2xl text-gray-500">📭 No files found</p>
        </div>
      ) : viewMode === "list" ? (
        // List View
        <div className="space-y-2">

          {[...filteredFiles]
            // Only include images and non-video files
            .filter((file) => {
              const key = file.Key.toLowerCase();
              return (
                key.endsWith(".jpg") ||
                key.endsWith(".jpeg") ||
                key.endsWith(".png") ||
                key.endsWith(".gif") ||
                (!key.endsWith(".mp4") &&
                  !key.endsWith(".mov") &&
                  !key.endsWith(".mkv") &&
                  !key.endsWith(".webm"))
              );
            })
            // Sort newest first
            .sort((a, b) => new Date(b.LastModified) - new Date(a.LastModified))
            .map((file) => (
              <div
                key={file.Key}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
              >
                <div className="flex items-center gap-3 flex-1">

                  {/* 👇 Show image preview if it's an image */}
                  {file.Key.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/) ? (
                    <img
                      src={file.url} // ✅ Use the full signed URL directly
                      alt={getFileName(file.Key)}
                      className="w-14 h-14 rounded object-cover"
                    />

                  ) : (
                    <span className="text-2xl">{getFileIcon(file.Key)}</span>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-black truncate">{getFileName(file.Key)}</p>
                    <p className="text-xs text-gray-500">
                      {formatSize(file.Size)} •{" "}
                      {new Date(file.LastModified).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleDownload(file.Key)}
                    disabled={downloading === file.Key}
                    className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition disabled:opacity-50"
                    title="Download"
                  >
                    ⬇️
                  </button>

                  <button
                    onClick={() => openShareModal(file.Key)}
                    className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
                    title="Share"
                  >
                    🔗
                  </button>

                  <button
                    onClick={() => handleDelete(file.Key)}
                    disabled={deleting === file.Key}
                    className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition disabled:opacity-50"
                    title="Delete"
                  >
                    {deleting === file.Key ? "⏳" : "🗑️"}
                  </button>
                </div>
              </div>
            ))}

        </div>
      ) : (
        // Grid View
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredFiles.map((file) => (
            <div
              key={file.Key}
              className="p-4 bg-gray-50 rounded-lg hover:shadow-lg transition border border-gray-200"
            >
              <div className="flex items-start justify-between mb-2">
                {/* <span className="text-3xl">{getFileIcon(file.Key)}</span> */}
                {/* 👇 Show image preview if it's an image */}
                {file.Key.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/) ? (
                  <img
                    src={file.url} // ✅ Use the full signed URL directly
                    alt={getFileName(file.Key)}
                    className="w-14 h-14 rounded object-cover"
                  />

                ) : (
                  <span className="text-2xl">{getFileIcon(file.Key)}</span>
                )}
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {getFileName(file.Key).split(".").pop()?.toUpperCase()}
                </span>
              </div>

              <p className="font-medium text-black text-sm mb-1 truncate">{getFileName(file.Key)}</p>
              <p className="text-xs text-gray-500 mb-3">{formatSize(file.Size)}</p>

              <div className="flex items-center gap-2 text-center">
                <button
                  onClick={() => handleDownload(file.Key)}
                  disabled={downloading === file.Key}
                  className="flex-1 p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition disabled:opacity-50"
                  title="Download"
                >
                  ⬇️
                </button>

                <button
                  onClick={() => openShareModal(file.Key)}
                  className="flex-1 p-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
                  title="Share"
                >
                  🔗
                </button>

                <button
                  onClick={() => handleDelete(file.Key)}
                  disabled={deleting === file.Key}
                  className="flex-1 p-2 bg-red-500 text-white rounded hover:bg-red-600 transition disabled:opacity-50"
                  title="Delete"
                >
                  {deleting === file.Key ? "⏳" : "🗑️"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-3xl">🔗</div>
              <h2 className="text-xl font-bold">Share File</h2>
            </div>

            <p className="text-gray-600 mb-4">File: <span className="font-medium text-blue-600">{selectedFileForShare ? getFileName(selectedFileForShare) : ""}</span></p>

            {/* Search Bar */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🔍 Search or Enter Email
              </label>
              <input
                type="email"
                placeholder="Search emails..."
                value={emailSearch}
                onChange={(e) => setEmailSearch(e.target.value)}
                className="w-full text-black px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Email List */}
            <div className="mb-4">
              <label className="block text-sm text-black font-medium text-gray-700 mb-2">
                📧 Select Email or Type New
              </label>

              {emailsLoading ? (
                <div className="p-4 text-center text-gray-500">
                  <p>Loading emails...</p>
                </div>
              ) : availableEmails.length > 0 ? (
                <div className="border border-gray-300 text-black rounded-lg max-h-40 overflow-y-auto bg-gray-50">
                  {availableEmails
                    .filter((email) => email.toLowerCase().includes(emailSearch.toLowerCase()))
                    .map((email, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setShareEmail(email);
                          setEmailSearch("");
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-green-100 border-b border-gray-200 last:border-b-0 transition"
                      >
                        {email}
                      </button>
                    ))}
                  {availableEmails.filter((email) => email.toLowerCase().includes(emailSearch.toLowerCase())).length === 0 && (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      No emails found
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 text-center text-black text-sm">
                  ❌ No emails available
                </div>
              )}
            </div>

            {/* Selected Email Display */}
            {shareEmail && (
              <div className="mb-4 p-3 bg-green-100 border border-green-300 rounded-lg">
                <p className="text-sm font-medium text-green-800">✅ Selected: {shareEmail}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={closeShareModal}
                disabled={sharing}
                className="px-4 py-2 text-black rounded border border-gray-300 hover:bg-gray-100 transition font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={submitShare}
                disabled={sharing || !shareEmail}
                className="px-4 py-2 rounded bg-green-500 hover:bg-green-600 text-white font-medium transition disabled:opacity-50 flex items-center gap-2"
              >
                {sharing ? "⏳ Sharing..." : "✅ Share"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileManager;