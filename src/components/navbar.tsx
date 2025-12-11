"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "@/store/userSlice";
import type { AppDispatch, RootState } from "@/store/store";
import { useState } from "react";
import { Menu, X, User, Home, PlusCircle, LogOut } from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();
  
  const { name, email, isLoggedIn } = useSelector((state: RootState) => state.user);
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logoutUser());
    router.push("/login");
    setIsMenuOpen(false);
  };

  const navLinks = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <Home className="w-5 h-5" />,
      active: pathname === "/dashboard",
    },
    {
      name: "Create",
      href: "/properties/create",
      icon: <PlusCircle className="w-5 h-5" />,
      active: pathname === "/properties/create",
    },
    {
      name: "Profile",
      href: "/profile",
      icon: <User className="w-5 h-5" />,
      active: pathname === "/profile",
    },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-800 bg-[#0D0D0D]/95 backdrop-blur-sm supports-backdrop-filter:bg-[#0D0D0D]/80">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link
              href="/dashboard"
              className="flex items-center space-x-2 group"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-linear-to-r from-amber-700 to-amber-500 rounded-lg blur opacity-20 group-hover:opacity-30 transition-opacity" />
                <div className="relative flex items-center justify-center w-10 h-10 bg-linear-to-br from-amber-800 to-amber-600 rounded-lg">
                  <span className="text-xl font-bold text-white">N</span>
                </div>
              </div>
              <span className="text-2xl font-bold bg-linear-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent">
                NEST
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:ml-8 md:flex md:items-center md:space-x-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    link.active
                      ? "bg-amber-900/20 text-amber-300 border border-amber-800/30"
                      : "text-gray-300 hover:text-amber-300 hover:bg-gray-800/50"
                  }`}
                >
                  {link.icon}
                  <span>{link.name}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-3">
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-linear-to-r from-blue-900/30 to-blue-800/20 hover:from-blue-900/40 hover:to-blue-800/30 text-blue-300 hover:text-blue-200 border border-blue-800/30 hover:border-blue-700/40 transition-all duration-200 group"
              >
                <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-400 hover:text-amber-300 hover:bg-gray-800/50 transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-800 py-4 animate-in slide-in-from-top-5 duration-200">
            <div className="space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-all ${
                    link.active
                      ? "bg-amber-900/20 text-amber-300 border border-amber-800/30"
                      : "text-gray-300 hover:text-amber-300 hover:bg-gray-800/50"
                  }`}
                >
                  {link.icon}
                  <span>{link.name}</span>
                </Link>
              ))}

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 mt-4 rounded-lg bg-linear-to-r from-blue-900/30 to-blue-800/20 text-blue-300 hover:text-blue-200 border border-blue-800/30 hover:border-blue-700/40 transition-all duration-200 group"
              >
                <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}