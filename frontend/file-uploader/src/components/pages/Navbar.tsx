import React from "react";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/react";
import { useNavigate, NavLink } from "react-router-dom";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import {
  Cloud,
  LogOut,
  LogIn,
  Upload,
  FolderOpen,
  Share2,
  Settings,
  ChartBar,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function Navbar() {
  const navigate = useNavigate();
  const { isLoggedIn, user, logout } = useAuth();

  const handleLogout = async () => {
    logout();
    try {
      await axios.post("http://localhost:8000/api/Auth/logout");
    } catch (err) {
      console.error("Logout error:", err);
    }
    navigate("/");
  };

  return (
    <Disclosure
      as="nav"
      className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-md border-b border-gray-200"
    >
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              {/* Logo and Brand */}
              <div
                onClick={() => navigate("/")}
                className="flex items-center cursor-pointer gap-2 select-none"
                aria-label="Homepage"
              >
                <div className="bg-gradient-to-br from-cyan-600 to-blue-700 p-3 rounded-xl shadow-lg transition-transform group-hover:scale-110">
                  <Cloud className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold bg-gradient-to-r from-cyan-700 to-blue-700 bg-clip-text text-transparent select-text">
                    Mini Drive
                  </h1>
                  <p className="text-xxl text-pink-500 -mt-1 select-text">
                    Secure S3 Cloud Storage
                  </p>
                </div>
              </div>

              {/* Desktop Navigation Links */}
              <div className="hidden sm:flex items-center space-x-8">
                {isLoggedIn ? (
                  <>
                    {/* <NavLink
                     to="/"
                      className={({ isActive }) =>
                        classNames(
                          "flex items-center gap-1 text-sm font-medium transition-colors",
                          isActive
                            ? "text-cyan-700 border-b-2 border-cyan-700"
                            : "text-gray-700 hover:text-cyan-700"
                        )
                      }
                      aria-label="Dashboard"
                    >
                      <ChartBar className="w-5 h-5" />
                      Home page
                    </NavLink> */}
                    {/* <NavLink
                      to="/FileDisplay"
                      className={({ isActive }) =>
                        classNames(
                          "flex items-center gap-1 text-sm font-medium transition-colors",
                          isActive
                            ? "text-cyan-700 border-b-2 border-cyan-700"
                            : "text-gray-700 hover:text-cyan-700"
                        )
                      }
                      aria-label="My Files"
                    >
                      <FolderOpen className="w-5 h-5" />
                      My Files
                    </NavLink> */}
                    {/* <NavLink
                      to="/SharedWithMe"
                      className={({ isActive }) =>
                        classNames(
                          "flex items-center gap-1 text-sm font-medium transition-colors",
                          isActive
                            ? "text-cyan-700 border-b-2 border-cyan-700"
                            : "text-gray-700 hover:text-cyan-700"
                        )
                      }
                      aria-label="Shared With Me"
                    >
                      <Share2 className="w-5 h-5" />
                      Shared
                    </NavLink> */}
                    {/* <NavLink
                      to="/upload"
                      className={({ isActive }) =>
                        classNames(
                          "flex items-center gap-1 text-sm font-medium transition-colors",
                          isActive
                            ? "text-cyan-700 border-b-2 border-cyan-700"
                            : "text-gray-700 hover:text-cyan-700"
                        )
                      }
                      aria-label="Upload Files"
                    >
                      <Upload className="w-5 h-5" />
                      Upload
                    </NavLink> */}
                  </>
                ) : null}
              </div>

              {/* User Authentication Section */}
              {/* <div className="flex items-center gap-4">
                {isLoggedIn ? (
                  <Menu as="div" className="relative">
                    <MenuButton className="flex items-center gap-3 rounded-lg px-3 py-1.5 hover:bg-gray-100 transition">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center font-bold text-white shadow-md select-none">
                        {(user?.name?.[0] ?? "U").toUpperCase()}
                      </div>
                      <div className="hidden sm:block text-left">
                        <p className="text-sm font-semibold text-gray-900 leading-tight select-text">
                          {user?.name || "User"}
                        </p>
                        <p className="text-xs text-gray-500 truncate select-text">
                          {user?.email}
                        </p>
                      </div>
                    </MenuButton>

                    <MenuItems className="absolute right-0 z-30 mt-2 w-56 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <div className="px-5 py-3 border-b border-gray-100">
                        <p className="text-xs text-gray-500 select-text">Signed in as</p>
                        <p className="text-sm font-semibold truncate select-text">{user?.email}</p>
                      </div>

                      <div className="py-2">
                        <MenuItem>
                          {({ active }) => (
                            <button
                              onClick={() => navigate("/settings")}
                              className={classNames(
                                active ? "bg-gray-100" : "",
                                "flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:text-cyan-700 transition-colors rounded-md select-text"
                              )}
                            >
                              <Settings className="w-5 h-5" />
                              Settings
                            </button>
                          )}
                        </MenuItem>

                        <MenuItem>
                          {({ active }) => (
                            <button
                              onClick={handleLogout}
                              className={classNames(
                                active ? "bg-red-50" : "",
                                "flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:text-red-700 rounded-md transition-colors select-text"
                              )}
                            >
                              <LogOut className="w-5 h-5" />
                              Logout
                            </button>
                          )}
                        </MenuItem>
                      </div>
                    </MenuItems>
                  </Menu>*/}
              {/* : (
                  <button
                    onClick={() => navigate("/singuplogin")}
                    className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-md hover:scale-105 transition-transform select-none"
                    aria-label="Sign In"
                  >
                    <LogIn className="w-5 h-5" />
                    Sign In
                  </button>
                )} */}
              {isLoggedIn ? (
                <div>
                  {/* Your logged in content here */}
                </div>
              ) : (
                <button
                  onClick={() => navigate("/singuplogin")}
                  className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-md hover:scale-105 transition-transform select-none"
                  aria-label="Sign In"
                >
                  <LogIn className="w-5 h-5" />
                  Sign In
                </button>
              )}
           
              {/* </div>  */}

              {/* Mobile menu button */}
              {/* <div className="flex sm:hidden">
                <DisclosureButton
                  aria-label={open ? "Close menu" : "Open menu"}
                  className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:bg-gray-100 transition"
                >
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" />
                  )}
                </DisclosureButton>
              </div> */}
            </div>
          </div>

          {/* Mobile menu panel */}
          {/* <DisclosurePanel className="sm:hidden border-t border-gray-100 bg-white">
            {isLoggedIn ? (
              <div className="space-y-1 px-5 pb-4 pt-3">
                <NavLink
                  to="/dashboard"
                  className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md font-medium"
                  aria-label="Dashboard"
                >
                  Dashboard
                </NavLink>
                <NavLink
                  to="/myfiles"
                  className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md font-medium"
                  aria-label="My Files"
                >
                  My Files
                </NavLink>
                <NavLink
                  to="/shared"
                  className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md font-medium"
                  aria-label="Shared With Me"
                >
                  Shared
                </NavLink>
                <NavLink
                  to="/upload"
                  className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md font-medium"
                  aria-label="Upload Files"
                >
                  Upload
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-md font-medium transition-colors"
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
          </DisclosurePanel> */}
        </>
      )}
    </Disclosure>
  );
}
