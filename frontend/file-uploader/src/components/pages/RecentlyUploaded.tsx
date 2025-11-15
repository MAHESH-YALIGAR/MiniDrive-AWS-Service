import React, { useEffect, useState } from "react";
import axios from "axios";
import { Loader2, Eye, Share2, HardDrive, Calendar } from "lucide-react";

interface FileType {
  key: string;
  name: string;
  size: number;
  lastModified: string;
  url: string;
}

const RecentlyUploaded: React.FC = () => {
  const [recentFiles, setRecentFiles] = useState<FileType[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredFile, setHoveredFile] = useState<string | null>(null);
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentFiles = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get("http://localhost:8000/api/getfiles/recently", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRecentFiles(res.data);
      } catch (err) {
        console.error("Failed to fetch recent files:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecentFiles();
  }, []);

  const getDisplayName = (filename: string) => {
    const match = filename.match(/^[a-f0-9\-]+-(.+)$/);
    return match ? match[1] : filename;
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase();
    const icons: { [key: string]: string } = {
      pdf: "📕",
      doc: "📘",
      docx: "📘",
      xls: "📗",
      xlsx: "📗",
      ppt: "📕",
      pptx: "📕",
      jpg: "🖼️",
      jpeg: "🖼️",
      png: "🖼️",
      gif: "🖼️",
      zip: "📦",
      rar: "📦",
      txt: "📄",
      mp4: "🎬",
      mp3: "🎵",
    };
    return icons[ext || ""] || "📄";
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const handleCopyLink = (url: string, key: string) => {
    navigator.clipboard.writeText(url);
    setCopiedFile(key);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="inline-block p-4 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-full mb-6">
            <Loader2 className="animate-spin text-white w-8 h-8" />
          </div>
          <p className="text-white font-semibold text-lg">Loading your files...</p>
          <p className="text-gray-400 text-sm mt-2">Just a moment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-4 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-2xl shadow-lg">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                <polyline points="13 2 13 9 20 9" />
              </svg>
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">Recently Uploaded</h1>
              <p className="text-gray-600 text-lg">
                {recentFiles.length} file{recentFiles.length !== 1 ? "s" : ""} • Latest updates to your collection
              </p>
            </div>
          </div>
        </div>

        {recentFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl border-2 border-dashed border-gray-300">
            <div className="text-8xl mb-6 opacity-60">📂</div>
            <p className="text-2xl font-bold text-gray-800 mb-3">No files yet</p>
            <p className="text-gray-600 text-lg">Start uploading files to see them here</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {recentFiles.map((file) => {
              const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name);
              const isVideo = /\.(mp4|mov|avi|webm)$/i.test(file.name);

              return (
                <div
                  key={file.key}
                  onMouseEnter={() => setHoveredFile(file.key)}
                  onMouseLeave={() => setHoveredFile(null)}
                  className="group relative h-full"
                >
                  {/* Card */}
                  <div className="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-indigo-400 h-full flex flex-col">
                    
                    {/* Hover Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                    {/* File Preview Section */}
                    <div className="relative h-32 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
                      {isImage ? (
                        <>
                          <img
                            src={file.url}
                            alt={file.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </>
                      ) : isVideo ? (
                        <>
                          <video
                            src={file.url}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            muted
                            autoPlay
                            loop
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="bg-white/30 backdrop-blur-md p-3 rounded-full">
                              <Eye className="text-white w-5 h-5" />
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-6xl group-hover:scale-110 transition-transform duration-300">
                          {getFileIcon(file.name)}
                        </div>
                      )}
                    </div>

                    {/* File Info */}
                    <div className="relative p-5 flex-1 flex flex-col">
                      <p className="font-bold text-gray-800 truncate mb-4 text-sm group-hover:text-indigo-600 transition-colors line-clamp-2">
                        {getDisplayName(file.name)}
                      </p>

                      <div className="space-y-3 mb-5 flex-1">
                        <div className="flex items-center gap-3 text-xs text-gray-600">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <HardDrive size={14} className="text-indigo-500" />
                          </div>
                          <span className="font-medium">{formatFileSize(file.size)}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-600">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <Calendar size={14} className="text-purple-500" />
                          </div>
                          <span className="font-medium">{formatDate(file.lastModified)}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-4 border-t border-gray-200">
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-2.5 px-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-300 text-sm hover:scale-105"
                        >
                          <Eye size={16} />
                          <span>Open</span>
                        </a>
                        {/* <button
                          className={`py-2.5 px-3 rounded-lg transition-all duration-300 ${
                            copiedFile === file.key
                              ? "bg-green-500 text-white"
                              : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                          }`}
                          title={copiedFile === file.key ? "Copied!" : "Copy link"}
                          onClick={() => handleCopyLink(file.url, file.key)}
                        >
                          <Share2 size={16} />
                        </button> */}
                      </div>
                    </div>
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

export default RecentlyUploaded;