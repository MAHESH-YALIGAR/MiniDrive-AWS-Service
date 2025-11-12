import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/pages/Navbar";
import Sidebar from "./components/pages/Sidebar";
import FileVaultLanding from "./components/pages/FileVaultLanding";
import UploadPage from "./components/pages/fileupload";
import AuthPages from "./components/pages/Authenticate";
import FileDisplay from "./components/pages/FileDisplay";
import TrashBin from "./components/pages/TrashBin";
import RecentlyUploaded from "./components/pages/RecentlyUploaded";
import SharedWithMe from "./components/pages/SharedWithMe";
import { AuthProvider, useAuth } from "./context/AuthContext";

interface LayoutProps {
  children: React.ReactNode;
  color: string;
  setColor: (color: string) => void;
}

const AppLayout: React.FC<LayoutProps> = ({ children, color, setColor }) => {
  const { isLoggedIn } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isDark = color === "black";

  return (
    <div
      className={`flex flex-col min-h-screen transition-colors duration-500 ${
        isDark ? "bg-slate-950 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* Navbar */}
      <div
        className={`sticky top-0 z-50 border-b backdrop-blur-md ${
          isDark ? "bg-slate-900/70 border-slate-800" : "bg-white/70 border-gray-200"
        }`}
      >
        <Navbar
          color={color}
          setColor={setColor}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          showMenuBtn={isLoggedIn}
        />
      </div>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar (only visible when logged in) */}
        {isLoggedIn && (
          <>
            <aside
              className={`fixed top-16 left-0 h-[calc(100vh-4rem)] border-r transition-all duration-300 ease-in-out z-40
                ${
                  sidebarOpen
                    ? "w-64"
                    : "w-20"
                } ${
                  isDark
                    ? "bg-gradient-to-b from-slate-900 to-slate-950 border-slate-800"
                    : "bg-gradient-to-b from-gray-100 to-white border-gray-200"
                }`}
            >
              <Sidebar
                isDark={isDark}
                isOpen={sidebarOpen}
                onToggle={() => setSidebarOpen(!sidebarOpen)}
              />
            </aside>

            {/* Overlay for mobile view */}
            {sidebarOpen && (
              <div
                className="fixed inset-0 bg-black/30 lg:hidden z-30"
                onClick={() => setSidebarOpen(false)}
              />
            )}
          </>
        )}

        {/* Page Content */}
        <main
          className={`flex-1 overflow-y-auto transition-all duration-300 p-6 ${
            isLoggedIn
              ? sidebarOpen
                ? "lg:ml-64 ml-20"
                : "ml-20"
              : "ml-0"
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [color, setColor] = useState("black");

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Landing Page */}
          <Route
            path="/"
            element={
              <AppLayout color={color} setColor={setColor}>
                <FileVaultLanding />
              </AppLayout>
            }
          />

          {/* Upload Page */}
          <Route
            path="/upload"
            element={
              <AppLayout color={color} setColor={setColor}>
                <UploadPage />
              </AppLayout>
            }
          />

          {/* Authentication (no layout) */}
          <Route path="/singuplogin" element={<AuthPages />} />

          {/* My Files */}
          <Route
            path="/FileDisplay"
            element={
              <AppLayout color={color} setColor={setColor}>
                <FileDisplay />
              </AppLayout>
            }
          />

          {/* Trash Bin */}
          <Route
            path="/TrashBin"
            element={
              <AppLayout color={color} setColor={setColor}>
                <TrashBin />
              </AppLayout>
            }
          />

          {/* Recently Uploaded */}
          <Route
            path="/RecentlyUploaded"
            element={
              <AppLayout color={color} setColor={setColor}>
                <RecentlyUploaded />
              </AppLayout>
            }
          />

          {/* Shared With Me */}
          <Route
            path="/SharedWithMe"
            element={
              <AppLayout color={color} setColor={setColor}>
                <SharedWithMe />
              </AppLayout>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
