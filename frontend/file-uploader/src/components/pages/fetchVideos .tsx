import React, { useState, useEffect } from "react";
import { Play, Trash2, Heart, Download, Share2 } from "lucide-react";
import axios from "axios";

// interface Video {
//   id: string;
//   title: string;
//   url: string;
//   size: string;
//   uploadedAt: string;
//   fileName: string;
//   likes: number;
//   isLiked: boolean;
// }

// const VideoGallery: React.FC = () => {
//   const [videos, setVideos] = useState<Video[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
//   const [error, setError] = useState("");
//   const [downloading, setDownloading] = useState<string | null>(null);
//   const [deleting, setDeleting] = useState<string | null>(null);

//   // Share-related state
//   const [shareModal, setShareModal] = useState<string | null>(null); // video id to share
//   const [shareEmail, setShareEmail] = useState<string>("");
//   const [availableEmails, setAvailableEmails] = useState<string[]>([]);
//   const [emailsLoading, setEmailsLoading] = useState(false);
//   const [sharing, setSharing] = useState(false);
//   const [emailSearch, setEmailSearch] = useState("");

//   useEffect(() => {
//     fetchVideos();
//   }, []);


//   const fetchVideos = async () => {
//     try {
//       setLoading(true);
//       const token = localStorage.getItem("token");
//       const API_URL = "http://localhost:8000/api/getfiles/getfiles";

//       const response = await axios.get(API_URL, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       const allFiles = response.data.files || response.data || [];

//       // Filter only videos and map attributes properly
//       const videoFiles = allFiles.filter((file: any) => {
//         const name = file.name || file.Key.toLowerCase();
//         console.log("this is the name .............", name);
//         const type = file.type || file.Type || "";
//         console.log("this is the type .............", type);

//         return (
//           type.startsWith("video/") ||
//           [".mp4", ".avi", ".mov", ".mkv", ".webm", ".flv", ".wmv", ".m4v"].some((ext) =>
//             name.toLowerCase().endsWith(ext)
//           )
//         );
//       });


//       function formatFileSize(bytes: number): string {
//         if (!bytes || isNaN(bytes)) return "Unknown size";
//         const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
//         const i = Math.floor(Math.log(bytes) / Math.log(1024));
//         const value = bytes / Math.pow(1024, i);
//         return `${value.toFixed(2)} ${sizes[i]}`;
//       }

//       function cleanFileName(fileName: string): string {
//         if (!fileName) return "Untitled";

//         // Split the name by "-"
//         const parts = fileName.split("-");

//         // Find the last segment that contains a dot (like ".mp4")
//         const lastPart = parts.find((part) => part.includes("."));

//         // If found, return that + any remaining parts after it (handles names with hyphens)
//         if (lastPart) {
//           const index = parts.indexOf(lastPart);
//           return parts.slice(index).join("-");
//         }

//         // Fallback if no extension found
//         return fileName;
//       }



//       const mappedVideos = videoFiles.map((file: any) => ({
//         id: file.id?.toString() || file.Key || Math.random().toString(),
//         fileName: cleanFileName(file.name || file.Key?.split("/").pop() || "Untitled Video"),
//         url: file.url || file.presignedUrl || "",
//         size: formatFileSize(file.size || file.Size),
//         uploadedAt: file.uploadedAt || file.LastModified || new Date().toLocaleDateString(),
//         likes: 0,
//         isLiked: false,
//       }));


//       setVideos(mappedVideos);
//       console.log("this is are the video informaction .................", videos)
//       setError("");
//     } catch (error: any) {
//       setError(error.message || "Failed to fetch videos");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchEmails = async () => {
//     setEmailsLoading(true);
//     const token = localStorage.getItem("token");
//     try {
//       const res = await axios.get("http://localhost:8000/api/share/getemail", {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       if (res.data.success && Array.isArray(res.data.emails)) {
//         setAvailableEmails(res.data.emails);
//       } else if (Array.isArray(res.data)) {
//         setAvailableEmails(res.data);
//       } else if (res.data.data && Array.isArray(res.data.data)) {
//         setAvailableEmails(res.data.data);
//       }
//     } catch (e) {
//       console.error("Error fetching emails:", e);
//       setAvailableEmails([]);
//     } finally {
//       setEmailsLoading(false);
//     }
//   };

//   const openShareModal = (videoId: string) => {
//     setShareModal(videoId);
//     setShareEmail("");
//     setEmailSearch("");
//     fetchEmails();
//   };

//   const closeShareModal = () => {
//     setShareModal(null);
//     setShareEmail("");
//     setEmailSearch("");
//   };



// //thisi  for the download...............
//   const handleDownload = async (key: string) => {
//     const token = localStorage.getItem("token");
//     setDownloading(key);

//     try {
//       const res = await axios.get("http://localhost:8000/api/getfiles/download", {
//         params: { key },
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       const downloadUrl = res.data.url;

//       if (downloadUrl) {
//         window.open(downloadUrl, "_blank");
//       } else {
//         alert("❌ Download URL not found");
//       }
//     } catch (error) {
//       console.error("❌ Error in download:", error);
//       alert("Failed to download file");
//     } finally {
//       setDownloading(null);
//     }
//   };


//   //thisi si for the deletet
//     const handleDelete = async (key: string) => {
//     const token = localStorage.getItem("token");
//     setDeleting(key);

//     try {
//       console.log("🗑️ Deleting file:", key);

//       const res = await axios.post(
//         "http://localhost:8000/api/getfiles/move-to-trash",
//         { key },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       console.log("✅ Delete response:", res.data);
//       alert("✅ File moved to trash successfully!");

//       // Remove from local state immediately
//       const updatedFiles = videos.filter(file => file.Key !== key);
//       setVideos(updatedFiles);
//       (updatedFiles.filter(f => f.Key.toLowerCase().includes(search.toLowerCase())));

//       // Fetch fresh data after a short delay
//       setTimeout(() => {
//        fetchVideos();
//       }, 300);

//     } catch (error) {
//       console.error("❌ Error deleting file:", error);
//       alert("❌ Failed to delete file");
//     } finally {
//       setDeleting(null);
//     }
//   };


//   const submitShare = async () => {
//     if (!shareEmail.trim()) {
//       alert("Please enter an email address");
//       return;
//     }
//     if (!shareEmail.includes("@")) {
//       alert("Please enter a valid email address");
//       return;
//     }
//     setSharing(true);
//     const token = localStorage.getItem("token");
//     try {
//       const fileKey = shareModal;
//       if (!fileKey) throw new Error("No video selected for sharing");
//       const video = videos.find((v) => v.id === fileKey);
//       if (!video) throw new Error("Video not found");

//       const res = await axios.post(
//         "http://localhost:8000/api/share/shareing",
//         { fileKey, sharedWith: shareEmail, fileName: video.title, expires: 3600 * 24 },
//         { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } }
//       );

//       alert(`File shared successfully with ${shareEmail}!`);
//       closeShareModal();
//     } catch (e) {
//       console.error("Sharing error:", e);
//       alert("Failed to share file. Please try again.");
//     } finally {
//       setSharing(false);
//     }
//   };
interface Video {
  id: string;
  fileName: string;
  url: string;
  size: string;
  uploadedAt: string;
  likes: number;
  isLiked: boolean;
  key?: string;
}

const VideoGallery = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Share-related state
  const [shareModal, setShareModal] = useState<string | null>(null);
  const [shareEmail, setShareEmail] = useState<string>("");
  const [availableEmails, setAvailableEmails] = useState<string[]>([]);
  const [emailsLoading, setEmailsLoading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [emailSearch, setEmailSearch] = useState("");

  const API_BASE = "http://localhost:8000/api";

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE}/getfiles/getfiles`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const allFiles = response.data.files || response.data || [];

      const videoFiles = allFiles.filter((file: any) => {
        const name = (file.name || file.Key || "").toLowerCase();
        const type = file.type || file.Type || "";
        return (
          type.startsWith("video/") ||
          [".mp4", ".avi", ".mov", ".mkv", ".webm", ".flv", ".wmv", ".m4v"].some((ext) =>
            name.endsWith(ext)
          )
        );
      });

      const formatFileSize = (bytes: number): string => {
        if (!bytes || isNaN(bytes)) return "Unknown size";
        const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        const value = bytes / Math.pow(1024, i);
        return `${value.toFixed(2)} ${sizes[i]}`;
      };

      const cleanFileName = (fileName: string): string => {
        if (!fileName) return "Untitled";
        const parts = fileName.split("-");
        const lastPart = parts.find((part) => part.includes("."));
        if (lastPart) {
          const index = parts.indexOf(lastPart);
          return parts.slice(index).join("-");
        }
        return fileName;
      };

      const mappedVideos = videoFiles.map((file: any): Video => ({
        id: file.id?.toString() || file.Key || Math.random().toString(),
        fileName: cleanFileName(file.name || file.Key?.split("/").pop() || "Untitled Video"),
        url: file.url || file.presignedUrl || "",
        size: formatFileSize(file.size || file.Size),
        uploadedAt: file.uploadedAt || file.LastModified || new Date().toLocaleDateString(),
        likes: 0,
        isLiked: false,
        key: file.Key,
      }));

      setVideos(mappedVideos);
      setError("");
    } catch (err: any) {
      setError(err.message || "Failed to fetch videos");
    } finally {
      setLoading(false);
    }
  };

  const fetchEmails = async () => {
    setEmailsLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(`${API_BASE}/share/getemail`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success && Array.isArray(res.data.emails)) {
        setAvailableEmails(res.data.emails);
      } else if (Array.isArray(res.data)) {
        setAvailableEmails(res.data);
      } else if (res.data.data && Array.isArray(res.data.data)) {
        setAvailableEmails(res.data.data);
      }
    } catch (e) {
      console.error("Error fetching emails:", e);
      setAvailableEmails([]);
    } finally {
      setEmailsLoading(false);
    }
  };

  const openShareModal = (videoId: string) => {
    setShareModal(videoId);
    setShareEmail("");
    setEmailSearch("");
    fetchEmails();
  };

  const closeShareModal = () => {
    setShareModal(null);
    setShareEmail("");
    setEmailSearch("");
  };

  const handleDownload = async (key: string) => {
    const token = localStorage.getItem("token");
    setDownloading(key);
    try {
      const res = await axios.get(`${API_BASE}/getfiles/download`, {
        params: { key },
        headers: { Authorization: `Bearer ${token}` },
      });

      const downloadUrl = res.data.url;
      if (downloadUrl) {
        window.open(downloadUrl, "_blank");
      } else {
        alert("Download URL not found");
      }
    } catch (error) {
      console.error("Error in download:", error);
      alert("Failed to download file");
    } finally {
      setDownloading(null);
    }
  };

  const handleDelete = async (key: string) => {
    const token = localStorage.getItem("token");
    setDeleting(key);
    try {
      const res = await axios.post(
        `${API_BASE}/getfiles/move-to-trash`,
        { key },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("File moved to trash successfully!");
      const updatedFiles = videos.filter((file) => file.key !== key);
      setVideos(updatedFiles);
      setSelectedVideo(null);
      setTimeout(fetchVideos, 300);
    } catch (error) {
      console.error("Error deleting file:", error);
      alert("Failed to delete file");
    } finally {
      setDeleting(null);
    }
  };

  const submitShare = async () => {
    if (!shareEmail.trim()) {
      alert("Please enter an email address");
      return;
    }
    if (!shareEmail.includes("@")) {
      alert("Please enter a valid email address");
      return;
    }

    setSharing(true);
    const token = localStorage.getItem("token");

    try {
      const fileKey = shareModal;
      if (!fileKey) throw new Error("No video selected for sharing");
      const video = videos.find((v) => v.id === fileKey);
      if (!video) throw new Error("Video not found");

      await axios.post(
        `${API_BASE}/share/shareing`,
        { fileKey, sharedWith: shareEmail, fileName: video.fileName, expires: 3600 * 24 },
        { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } }
      );

      alert(`File shared successfully with ${shareEmail}!`);
      closeShareModal();
    } catch (e) {
      console.error("Sharing error:", e);
      alert("Failed to share file. Please try again.");
    } finally {
      setSharing(false);
    }
  };

  // Other handlers like handleLike, handleDownload, handleDelete remain unchanged...

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4"></div>
          <p className="text-xl font-semibold">Loading videos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-white mb-2">My Videos</h1>
          <p className="text-blue-200 text-lg">
            {videos.length} video{videos.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 text-red-300 rounded-lg">
            ⚠️ {error}
          </div>
        )}

        {/* Videos Grid */}
        {videos.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-white text-xl">No videos found</p>
            <button
              onClick={fetchVideos}
              className="mt-4 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

            {videos.map((video) => (
              <div
                key={video.id}
                className="bg-white/10 backdrop-blur-md rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300 border border-white/20"
              >

                {/* Video Thumbnail */}
                <div
                  className="relative w-full aspect-video bg-black/30 cursor-pointer group overflow-hidden"
                  onClick={() => setSelectedVideo(video)}
                >
                  {/* Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition">
                    <div className="bg-red-600 p-4 rounded-full">
                      <Play size={24} className="text-white fill-white" />
                    </div>
                  </div>
                </div>
                {/* Video Info */}
                <div className="p-4">
                  <h3 className="text-white font-semibold truncate mb-2"> {video.fileName}</h3>
                  <p className="text-blue-200 text-sm mb-3">
                    {video.size} • {video.uploadedAt}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        // handleLike logic here
                      }}
                      className="flex-1 flex items-center justify-center gap-1 py-2 rounded transition bg-white/20 text-blue-200 hover:bg-white/30"
                    >
                      <Heart size={16} fill="none" />
                      <span className="text-xs">{video.likes}</span>
                    </button>

                    <button
                      onClick={() => 
                      handleDownload(video.id)
                      }
                      className="flex-1 flex items-center justify-center py-2 bg-blue-500/30 text-blue-300 hover:bg-blue-500/50 rounded transition"
                    >
                      <Download size={16} />
                    </button>

                    <button
                      onClick={() => openShareModal(video.id)}
                      className="flex-1 flex items-center justify-center py-2 bg-green-500/30 text-green-300 hover:bg-green-500/50 rounded transition"
                    >
                      <Share2 size={16} />
                    </button>

                    <button
                      onClick={() => {
                       handleDelete(video.id)
                      }}
                      className="flex-1 flex items-center justify-center py-2 bg-red-500/30 text-red-300 hover:bg-red-500/50 rounded transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Video Player Modal */}
      {selectedVideo && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <div className="w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <video src={selectedVideo.url} controls autoPlay className="w-full rounded-lg" />
            <div className="mt-4 bg-white/10 backdrop-blur-md p-4 rounded-lg border border-white/20">
              <h2 className="text-white text-xl font-semibold">{selectedVideo.title}</h2>
              <p className="text-blue-200 text-sm mt-2">
                {selectedVideo.size} • {selectedVideo.uploadedAt}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {shareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-3xl">🔗</div>
              <h2 className="text-xl font-bold">Share Video</h2>
            </div>

            {/* Search Bar */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search or Enter Email</label>
              <input
                type="email"
                placeholder="Search emails or enter new..."
                value={emailSearch}
                onChange={(e) => setEmailSearch(e.target.value)}
                className="w-full text-black px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Email List */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Email or Type New</label>
              {emailsLoading ? (
                <div className="p-4 text-center text-gray-500">Loading emails...</div>
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
                    <div className="p-4 text-center text-gray-500 text-sm">No emails found</div>
                  )}
                </div>
              ) : (
                <div className="p-4 text-center text-black text-sm">No emails available</div>
              )}
            </div>

            {/* Selected Email Display */}
            {shareEmail && (
              <div className="mb-4 p-3 bg-green-100 border border-green-300 rounded-lg">
                <p className="text-sm font-medium text-green-800">Selected: {shareEmail}</p>
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
                {sharing ? "Sharing..." : "Share"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoGallery;
