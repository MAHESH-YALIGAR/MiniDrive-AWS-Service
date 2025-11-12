import React, { useState } from "react";
import { Cloud, FileUp, Share2, Trash2, Settings } from "lucide-react";
import { UserIcon } from "@heroicons/react/24/outline";

interface SidebarProps {
  isDark: boolean;
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { icon: Cloud, label: "My Files", href: "#" },
  { icon: Share2, label: "Shared with Me", href: "#" },
  { icon: FileUp, label: "Recent", href: "#" },
  { icon: Trash2, label: "Trash", href: "#" },
  { icon: Settings, label: "Settings", href: "#" },
];

export default function Sidebar({ isDark, isOpen, onClose }: SidebarProps) {
  const [activeItem, setActiveItem] = useState("My Files");

  return (
    <>
      {/* 🧱 Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen transition-all duration-300 z-40 flex flex-col ${
          isDark ? "bg-slate-900 border-slate-800" : "bg-slate-50 border-slate-200"
        } border-r ${isOpen ? "w-64" : "-translate-x-full md:translate-x-0 md:w-0"} md:relative md:translate-x-0 md:w-64 overflow-hidden`}
      >
        {/* Logo */}
        <div
          className={`h-16 px-6 flex items-center gap-3 border-b ${
            isDark ? "border-slate-800" : "border-slate-200"
          }`}
        >
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
            F
          </div>
          <h2 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
           Mini Drive
          </h2>
        </div>

        {/* Upload Button */}
        <div className="p-4">
          <button
            className={`w-full py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
              isDark
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
                : "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700"
            }`}
          >
            <FileUp size={20} />
            Upload File
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 px-4 py-4 space-y-1">
          {menuItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={() => setActiveItem(item.label)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeItem === item.label
                  ? isDark
                    ? "bg-slate-800 text-white"
                    : "bg-slate-200 text-slate-900"
                  : isDark
                  ? "text-slate-300 hover:bg-slate-800"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </a>
          ))}
        </nav>

        {/* Your Profile Button */}
        <div className={`px-4 py-2 border-t ${isDark ? "border-slate-800" : "border-slate-200"}`}>
          <button
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium ${
              isDark
                ? "text-slate-300 hover:bg-slate-800"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <UserIcon className="h-5 w-5" />
            Your Profile
          </button>
        </div>

        {/* Storage Info */}
        <div className={`p-4 border-t ${isDark ? "border-slate-800" : "border-slate-200"}`}>
          <p className={`text-xs font-semibold mb-2 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            Storage Used
          </p>
          <div className={`w-full h-2 rounded-full ${isDark ? "bg-slate-800" : "bg-slate-300"}`}>
            <div className={`h-full rounded-full w-2/3 bg-gradient-to-r from-blue-500 to-purple-600`}></div>
          </div>
          <p className={`text-xs mt-2 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            2.5 GB / 5 GB
          </p>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 md:hidden z-30 backdrop-blur-sm"
          onClick={onClose}
        />
      )}
    </>
  );
}