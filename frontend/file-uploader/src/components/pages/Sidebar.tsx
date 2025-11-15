import React, { useState, useEffect } from "react";
import { Cloud, FileUp, Share2, Trash2, Settings, ChevronLeft, ChevronRight, Sun, Moon } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import {
  LogOut,
  LogIn,
  Upload,
  FolderOpen,
  ChartBar,
  Video,
  Folder,
} from "lucide-react";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/react";

interface StorageData {
  used: number;
  total: number;
  usedMB?: number;
}

interface SidebarProps {
  isDark?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
}

const API_BASE_URL = "http://localhost:8000";

export default function Sidebar({ isDark: propIsDark = true, isOpen: propIsOpen = true, onToggle }: SidebarProps) {
  const { isLoggedIn, user, logout } = useAuth();

  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(propIsDark);
  const [isOpen, setIsOpen] = useState(propIsOpen);
  const [activeItem, setActiveItem] = useState("My Files");
  // Initialize with total: 5 to avoid division by zero
  const [storageData, setStorageData] = useState<StorageData>({ used: 0, total: 5, usedMB: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fixed calculation - always have a valid total
  const storagePercent = storageData.total > 0 ? (storageData.used / storageData.total) * 100 : 0;

  console.log("📊 Storage Debug:", {
    used: storageData.used,
    total: storageData.total,
    usedMB: storageData.usedMB,
    percent: storagePercent,
    loading,
    error,
  });

  const menuItems = [
    { icon: Cloud, label: "My Files & Photos", href: "/FileDisplay", badge: null },
    { icon: Video, label: "My Videos", href: "/VideoGallery", badge: null },
    { icon: Folder, label: "My Folders", href: "/FolderViewer", badge: null },
    { icon: Share2, label: "Shared with Me", href: "/SharedWithMe", badge: null },
    { icon: FileUp, label: "Recent", href: "/RecentlyUploaded", badge: null },
    // { icon: FileUp, label: "MyFolders", href: "/MyFolders", badge: null },
    { icon: Trash2, label: "Trash", href: "/TrashBin", badge: null },
  ];


  //this is for the logout....................................... 

  const handleLogout = async () => {
    logout();
    try {
      await axios.post("http://localhost:8000/api/Auth/logout");
    } catch (err) {
      console.error("Logout error:", err);
    }
    navigate("/");
  };


  // Fetch storage data from backend
  useEffect(() => {
    const fetchStorageData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get token from localStorage
        const token = localStorage.getItem("token");

        if (!token) {
          setError("No authentication token found");
          setLoading(false);
          return;
        }

        // Make API request
        const response = await axios.get(`${API_BASE_URL}/api/getfiles/totalstorege`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        console.log("🔹 API Full Response:", response.data);

        // Handle response - supports multiple response formats
        let used = 0;
        let total = 5; // Default to 5GB
        let usedMB = 0;

        // If your backend returns totalMB directly
        if (response.data?.totalMB !== undefined) {
          usedMB = parseFloat(response.data.totalMB);
          used = usedMB / 1024; // Convert MB to GB
          total = response.data.totalGB || 5;
          console.log("✅ Using totalMB format - Used (MB):", usedMB, "Used (GB):", used, "Total (GB):", total);
        }
        // If backend returns data object
        else if (response.data?.data) {
          used = parseFloat(response.data.data.used) || 0;
          total = parseFloat(response.data.data.total) || 5;
          console.log("✅ Using data object format - Used:", used, "Total:", total);
        }
        // If backend returns direct properties
        else if (response.data?.used !== undefined) {
          used = parseFloat(response.data.used);
          total = parseFloat(response.data.total) || 5;
          console.log("✅ Using direct property format - Used:", used, "Total:", total);
        }

        // Ensure values are valid numbers
        used = isNaN(used) ? 0 : used;
        total = isNaN(total) ? 5 : total;
        if (total <= 0) total = 5; // Prevent division by zero

        console.log("💾 Final Storage Data:", { used, total, percent: (used / total) * 100 });

        setStorageData({
          used,
          total,
          usedMB,
        });
        setLoading(false);
      } catch (err) {
        console.error("❌ Storage fetch error:", err);
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 401) {
            setError("Unauthorized - Please login again");
          } else {
            setError(err.response?.data?.message || "Failed to fetch storage data");
          }
        } else {
          setError("An error occurred while fetching storage data");
        }
        // Set default values on error (used: 0, total: 5)
        setStorageData({ used: 0, total: 5, usedMB: 0 });
        setLoading(false);
      }
    };

    fetchStorageData();

    // Refresh storage data every 30 seconds
    const interval = setInterval(fetchStorageData, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    onToggle?.();
  };

  return (
    <aside
      className={`${isOpen ? "w-72" : "w-20"
        } transition-all duration-300 flex flex-col h-full ${isDark ? "bg-gradient-to-b from-slate-900 to-slate-950 border-slate-800" : "bg-gradient-to-b from-slate-100 to-slate-50 border-slate-200"
        } border-r`}
    >
      {/* Header with Theme Toggle */}
      <div
        className={`h-20 px-6 flex items-center justify-between border-b ${isDark ? "border-slate-800" : "border-slate-200"
          }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg hover:shadow-xl transition-shadow">
            F
          </div>
          {isOpen && (
            <div className="flex-1">
              <h2 className={`text-lg font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent`}>
                Mini Drive
              </h2>
              <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>Cloud Storage</p>
            </div>
          )}
        </div>
        {isOpen && (
          <button
            onClick={() => setIsDark(!isDark)}
            className={`p-2 rounded-lg transition-all duration-200 ${isDark
              ? "bg-slate-800 text-yellow-400 hover:bg-slate-700"
              : "bg-slate-200 text-slate-700 hover:bg-slate-300"
              }`}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        )}
      </div>

      {/* Upload Button */}
      <div className="p-4">
        <button
          onClick={() => navigate("/upload")}
          className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 group relative overflow-hidden ${isDark
            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:shadow-purple-500/50"
            : "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-400/50"
            }`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity"></div>
          <FileUp size={20} className="relative" />
          {isOpen && <span className="relative">Upload</span>}
        </button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {menuItems.map((item) => (
          <a
            key={item.label}
            href={item.href}
            onClick={() => setActiveItem(item.label)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 relative group ${activeItem === item.label
              ? isDark
                ? "bg-slate-800 text-white shadow-md"
                : "bg-slate-200 text-slate-900 shadow-md"
              : isDark
                ? "text-slate-400 hover:text-white hover:bg-slate-800/50"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            title={!isOpen ? item.label : ""}
          >
            {activeItem === item.label && (
              <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full ${isDark ? "bg-gradient-to-b from-blue-500 to-purple-600" : "bg-gradient-to-b from-blue-500 to-purple-600"
                }`}></div>
            )}
            <item.icon size={20} className="flex-shrink-0" />
            {isOpen && (
              <>
                <span className="font-medium flex-1">{item.label}</span>
                {item.badge && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </a>
        ))}
      </nav>


      {/* Settings */}
      {isLoggedIn ? (
        <div className={`px-3 py-2 border-t ${isDark ? "border-slate-800" : "border-slate-200"}`}>
          {/* User Info */}
          <div className={`px-4 py-3 rounded-lg ${isDark ? "bg-slate-800/50" : "bg-slate-100"}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center font-bold text-white shadow-md select-none flex-shrink-0">
                {(user?.name?.[0] ?? "U").toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold truncate ${isDark ? "text-slate-200" : "text-slate-900"}`}>
                  {user?.name || "User"}
                </p>
                <p className={`text-xs truncate ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  {user?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Settings Button */}
          <button
            className={`w-full flex items-center gap-2 px-4 py-3 mt-2 rounded-lg font-medium transition-colors ${isDark
              ? "text-slate-300 hover:bg-slate-800/50"
              : "text-slate-700 hover:bg-slate-200"
              }`}
            aria-label="Settings"
          >
            <Settings className="w-5 h-5" />
            Settings
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-3 mt-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
            aria-label="Logout"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      ) : (
        <div className="px-5 pb-4 pt-3">
          <button
            onClick={() => navigate("/singuplogin")}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow hover:scale-105 transition-transform"
            aria-label="Sign In"
          >
            <LogIn className="w-5 h-5" />
            Sign In
          </button>
        </div>
      )}


      {/* Storage Info */}
      <div className={`p-4 border-t ${isDark ? "border-slate-800" : "border-slate-200"}`}>
        {isOpen ? (
          <>
            <p className={`text-xs font-semibold mb-3 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              Storage
            </p>
            {loading ? (
              <div className="space-y-2">
                <div className={`w-full h-2.5 rounded-full ${isDark ? "bg-slate-800" : "bg-slate-300"} animate-pulse`}></div>
                <p className={`text-xs font-medium ${isDark ? "text-slate-500" : "text-slate-600"}`}>
                  Loading...
                </p>
              </div>
            ) : error ? (
              <div className="space-y-2">
                <p className="text-xs text-red-500 font-semibold">⚠️ {error}</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className={`w-full h-3 rounded-full overflow-visible ${isDark ? "bg-slate-800" : "bg-slate-300"
                  }`}>
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-700 ease-out block"
                    style={{
                      width: `${Math.max(storagePercent, 2)}%`,
                      minWidth: storagePercent > 0 ? "4px" : "0px",
                      height: "12px"
                    }}
                  ></div>
                </div>
                <div className="flex justify-between items-center">
                  <p className={`text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    {(storageData.used * 1024).toFixed(2)} MB / {(storageData.total * 1024).toFixed(0)} MB
                  </p>
                  <p className={`text-xs font-semibold ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    {storagePercent.toFixed(2)}%
                  </p>
                </div>
              </div>
            )}
            {!loading && !error && storagePercent > 80 && (
              <p className="text-xs text-orange-500 font-semibold mt-2">⚠️ Storage running low</p>
            )}
          </>
        ) : (
          <div className={`w-8 h-8 rounded-lg ${isDark ? "bg-slate-800" : "bg-slate-300"} flex items-center justify-center`}>
            {loading ? (
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <span className={`text-xs font-bold ${isDark ? "text-slate-500" : "text-slate-600"}`}>
                {Math.round(storagePercent)}%
              </span>
            )}
          </div>
        )}
      </div>

      {/* Toggle Button - Collapse/Expand */}
      <div className={`p-3 border-t ${isDark ? "border-slate-800" : "border-slate-200"}`}>
        <button
          onClick={handleToggle}
          className={`w-full py-2 px-3 rounded-lg transition-all duration-200 flex items-center justify-center ${isDark
            ? "text-slate-400 hover:text-white hover:bg-slate-800"
            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          title={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
        >
          {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>
    </aside>
  );
}