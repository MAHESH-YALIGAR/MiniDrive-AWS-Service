


import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  ChevronDown,
  ChevronRight,
  Folder,
  File,
  FileText,
  Image,
  Video,
  Download,
  Trash2,
  Search,
  Loader,
} from "lucide-react";

interface FolderNode {
  name: string;
  type: "folder" | "file";
  size?: number;
  mimeType?: string;
  children?: FolderNode[];
  files?: FolderNode[];
  s3Url?: string;
  key?: string;
}

const FolderViewer: React.FC = () => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [folders, setFolders] = useState<FolderNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalFolders: 0,
    storageUsed: "0 GB",
    storageFree: "0 GB",
  });

  // ✅ NEW: Function to refresh folders from backend
  const refreshFolders = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("❌ No token found. Please login first.");
        return;
      }

      const response = await fetch("http://localhost:8000/api/uploadfolder/getfolder", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.folderTree) {
        const folderArray = convertFolderObjectToArray(data.folderTree);
        setFolders(folderArray);
        calculateStatsFromTree(data.folderTree);
        setError("");
      } else {
        setFolders([]);
        setError("No folder data found");
      }
    } catch (e: any) {
      setError(e.message || "Failed to refresh folders");
      setFolders([]);
    }
  };

  // Download file
  const handleDownload = async (file: any) => {
    console.log("the url for the download is ", file);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Not authenticated. Please login.");
        return;
      }

      const url = `http://localhost:8000/api/uploadfolder/downloadpdf?key=${encodeURIComponent(file.key)}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Download failed with status ${response.status}`);
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = file.name || "downloaded_file";
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Download failed", error);
      alert("Download error");
    }
  };

  // ✅ FIXED: Delete file and refresh automatically
  const handleDelete = async (file: any) => {
    try {
      const token = localStorage.getItem("token");

      if (!file.key) {
        console.error("Missing file key");
        return;
      }

      const res = await axios.post(
        "http://localhost:8000/api/uploadfolder/deletefileinfolder",
        { key: file.key },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Deleted:", res.data);
      alert("File deleted successfully!");

      // ✅ Refresh folders immediately after deletion
      await refreshFolders();

    } catch (error) {
      console.log("Error deleting file:", error);
      alert("Failed to delete file");
    }
  };

  const convertFolderObjectToArray = (folderObj: any): FolderNode[] => {
    return Object.entries(folderObj).map(([key, value]) => {
      const children: FolderNode[] = [];
      const files: FolderNode[] = [];

      Object.entries(value).forEach(([childKey, childValue]) => {
        if (childKey === "files" && Array.isArray(childValue)) {
          childValue.forEach((file: any) => {
            if (typeof file === "string") {
              files.push({
                name: file,
                size: 0,
                mimeType: "",
                type: "file",
                key: "",
              });
            } else {
              files.push({
                name: file.name,
                size: file.size,
                mimeType: file.mimeType || "",
                type: "file",
                key: file.key,
              });
            }
          });
        } else if (typeof childValue === "object") {
          children.push(...convertFolderObjectToArray({ [childKey]: childValue }));
        }
      });

      return {
        name: key,
        type: "folder",
        children,
        files,
      };
    });
  };

  const countItems = (item: FolderNode): number => {
    let count = 0;
    if (item.children && item.children.length > 0) {
      count += item.children.reduce((sum, child) => sum + countItems(child), 0);
    }
    if (item.files && item.files.length > 0) {
      count += item.files.length;
    }
    return count;
  };

  const calculateStatsFromTree = (folderObj: any) => {
    let totalSize = 0;
    let totalFiles = 0;
    let totalFolders = 0;

    const recurse = (node: any) => {
      totalFolders++;
      if (node.files && Array.isArray(node.files)) {
        totalFiles += node.files.length;
        node.files.forEach((file: any) => {
          if (typeof file === "object") {
            totalSize += file.size || 0;
          }
        });
      }
      Object.entries(node).forEach(([key, val]) => {
        if (key !== "files" && typeof val === "object") {
          recurse(val);
        }
      });
    };

    Object.values(folderObj).forEach(recurse);

    const storageUsedGB = (totalSize / (1024 * 1024 * 1024)).toFixed(2);
    const totalStorageGB = 5;
    const storageFreeGB = (totalStorageGB - parseFloat(storageUsedGB)).toFixed(2);

    setStats({
      totalFiles,
      totalFolders,
      storageUsed: `${storageUsedGB} GB`,
      storageFree: `${storageFreeGB} GB`,
    });
  };

  const handleToggleFolder = (path: string) => {
    const newSet = new Set(expandedFolders);
    if (newSet.has(path)) {
      newSet.delete(path);
    } else {
      newSet.add(path);
    }
    setExpandedFolders(newSet);
  };

  const getFileIcon = (mimeType?: string, name?: string) => {
    const mt = typeof mimeType === "string" ? mimeType.toLowerCase() : "";
    const nm = typeof name === "string" ? name.toLowerCase() : "";

    if (mt.includes("image")) return <Image size={18} className="text-blue-500" />;
    if (mt.includes("video")) return <Video size={18} className="text-purple-500" />;
    if (mt.includes("pdf") || nm.endsWith(".pdf")) return <FileText size={18} className="text-red-500" />;
    if (mt.includes("word") || nm.endsWith(".doc") || nm.endsWith(".docx"))
      return <FileText size={18} className="text-blue-400" />;
    if (mt.includes("zip") || mt.includes("rar") || nm.endsWith(".zip") || nm.endsWith(".rar"))
      return <File size={18} className="text-yellow-600" />;
    if (!mt && !nm.includes(".")) return <Folder size={18} className="text-yellow-500" />;

    return <File size={18} className="text-gray-500" />;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "0 B";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + " MB";
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
  };

  const renderFolderTree = (items: FolderNode[], path = ""): JSX.Element => (
    <div className="space-y-2">
      {items.map((item, index) => {
        const itemPath = `${path}/${item.name}`;
        const isExpanded = expandedFolders.has(itemPath);
        const isSelected = selectedItems.has(itemPath);

        if (item.type === "folder") {
          return (
            <div key={index}>
              <div
                className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all ${isSelected ? "bg-blue-100 border-l-4 border-blue-500" : "hover:bg-gray-100"
                  }`}
                onClick={() => handleToggleFolder(itemPath)}
              >
                {isExpanded ? (
                  <ChevronDown size={20} className="text-blue-600" />
                ) : (
                  <ChevronRight size={20} className="text-gray-600" />
                )}
                <Folder size={22} className="text-yellow-500" />
                <span className="font-semibold text-gray-800 flex-1">{item.name}</span>
                <span className="text-xs text-gray-500 bg-gray-200 px-3 py-1 rounded-full">
                  {countItems(item)} items
                </span>
              </div>

              {isExpanded && item.children && item.children.length > 0 && (
                <div className="ml-6 border-l-2 border-gray-200 pl-0 mt-2">{renderFolderTree(item.children, itemPath)}</div>
              )}

              {isExpanded && item.files && item.files.length > 0 && (
                <div className="ml-6 border-l-2 border-gray-200 pl-0 mt-2">
                  {item.files.map((file, fileIndex) => (
                    <div
                      key={fileIndex}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-all group"
                    >
                      {getFileIcon(file.mimeType, file.name)}

                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                      </div>

                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          className="p-2 hover:bg-blue-100 rounded-lg"
                          title="Download"
                          onClick={() => handleDownload(file)}
                        >
                          <Download size={18} className="text-blue-500" />
                        </button>

                        <button
                          className="p-2 hover:bg-red-100 rounded-lg"
                          title="Delete"
                          onClick={() => handleDelete(file)}
                        >
                          <Trash2 size={18} className="text-red-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        } else {
          return (
            <div key={index} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-all group">
              {getFileIcon(item.mimeType, item.name)}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 truncate">{item.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(item.size)}</p>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 hover:bg-blue-100 rounded-lg transition" title="Download">
                  <Download size={18} className="text-blue-500" />
                </button>
                <button className="p-2 hover:bg-red-100 rounded-lg transition" title="Delete">
                  <Trash2 size={18} className="text-red-500" />
                </button>
              </div>
            </div>
          );
        }
      })}
    </div>
  );

  useEffect(() => {
    const fetchFolders = async () => {
      try {
        setLoading(true);
        await refreshFolders();
      } finally {
        setLoading(false);
      }
    };

    fetchFolders();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-2xl">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-bold text-white mb-2">📁 My Folders</h1>
          <p className="text-blue-100">Organize and manage your documents with ease</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search size={20} className="absolute left-4 top-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search files and folders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-black pl-12 pr-6 py-3 rounded-lg bg-white shadow-lg border-2 border-transparent focus:border-blue-500 focus:outline-none transition"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 bg-red-100 border-2 border-red-400 text-red-700 px-6 py-4 rounded-lg">
            <p className="font-semibold">⚠️ {error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="mb-8 bg-blue-100 border-2 border-blue-400 text-blue-700 px-6 py-4 rounded-lg flex items-center gap-3">
            <Loader size={20} className="animate-spin" />
            <p className="font-semibold">Loading your folders...</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg p-6 text-white shadow-lg">
            <p className="text-sm opacity-90">Total Files</p>
            <p className="text-3xl font-bold">{stats.totalFiles}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg p-6 text-white shadow-lg">
            <p className="text-sm opacity-90">Total Folders</p>
            <p className="text-3xl font-bold">{stats.totalFolders}</p>
          </div>
          <div className="bg-gradient-to-br from-pink-400 to-pink-600 rounded-lg p-6 text-white shadow-lg">
            <p className="text-sm opacity-90">Storage Used</p>
            <p className="text-3xl font-bold">{stats.storageUsed}</p>
          </div>
          <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-lg p-6 text-white shadow-lg">
            <p className="text-sm opacity-90">Storage Free</p>
            <p className="text-3xl font-bold">{stats.storageFree}</p>
          </div>
        </div>

        {/* Folder Tree */}
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b-2 border-gray-200">
            <h2 className="text-lg font-bold text-gray-800">📂 Folder Structure</h2>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader size={40} className="animate-spin text-blue-500" />
              </div>
            ) : folders.length === 0 ? (
              <div className="text-center py-12">
                <Folder size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">No folders found</p>
              </div>
            ) : (
              renderFolderTree(folders)
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-300 text-sm">
          <p>💡 Tip: Click on folders to expand/collapse them. Hover over files to download or delete.</p>
          <p className="font-bold text-2xl">🔔 Tip: It may take a few seconds to organize your folder structure.</p>
        </div>
      </div>
    </div>
  );
};

export default FolderViewer;