import React, { useEffect, useState } from "react";
import axios from "axios";
import { Loader2, Download, FileIcon, Calendar, HardDrive } from "lucide-react";

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

  const getFileIcon = (filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase();
    const icons: { [key: string]: string } = {
      pdf: "📕",            // Red closed book (better than 🔴 — clearly indicates a document)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Loader2 className="animate-spin text-indigo-600 w-12 h-12 mx-auto mb-4" />
          <p className="text-indigo-600 font-semibold">Loading your files...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl">
              <FileIcon className="text-white w-6 h-6" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
              Recently Uploaded
            </h1>
          </div>
          <p className="text-gray-600 ml-12 mt-2">
            {recentFiles.length} file{recentFiles.length !== 1 ? "s" : ""} in your collection
          </p>
        </div>

        {recentFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <div className="text-6xl mb-4">📂</div>
            <p className="text-xl font-semibold text-gray-700 mb-2">No files yet</p>
            <p className="text-gray-500">Start uploading files to see them here</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {recentFiles.map((file) => (
              <div
                key={file.key}
                onMouseEnter={() => setHoveredFile(file.key)}
                onMouseLeave={() => setHoveredFile(null)}
                className="group relative bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
              >
                {/* Background gradient on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 to-blue-500/0 group-hover:from-indigo-500/10 group-hover:to-blue-500/10 transition-all duration-300" />

                <div className="relative p-6 flex flex-col h-full">
                  {/* File Icon */}
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {getFileIcon(file.name)}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 mb-4">
                    <p className="font-bold text-gray-800 truncate mb-3 text-sm group-hover:text-indigo-600 transition-colors">
                      {file.name}
                    </p>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <HardDrive size={14} />
                        <span>{formatFileSize(file.size)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Calendar size={14} />
                        <span>{new Date(file.lastModified).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Download Button */}
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transform group-hover:scale-105 transition-all duration-300"
                  >
                    <Download size={18} />
                    <span>Download</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentlyUploaded;