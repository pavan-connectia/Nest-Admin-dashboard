"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { logoutUser } from "@/store/userSlice";
import type { AppDispatch } from "@/store/store";

export default function Navbar() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const handleLogout = () => {
    dispatch(logoutUser());
    router.push("/login");
  };

  return (
    <nav className="w-full px-6 py-4 flex justify-between items-center shadow-lg bg-[#1d1d1e]"
      
    >
      {/* Logo */}
      <Link href="/dashboard" className="text-2xl font-bold" style={{ color: "#8E744B" }}>
        NEST
      </Link>

      {/* Menu */}
      <div className="flex gap-6 items-center">
        
        <Link 
          href="/create-property"
          className="font-medium hover:opacity-80"
          style={{ color: "#AEA99E" }}
        >
          Create Property
        </Link>

        <Link 
          href="/profile"
          className="font-medium hover:opacity-80"
          style={{ color: "#AEA99E" }}
        >
          Profile
        </Link>

        <button
          onClick={handleLogout}
          className="px-4 py-1 rounded font-medium"
          style={{
            backgroundColor: "#15537F",
            color: "#AEA99E"
          }}
        >
          Logout
        </button>

      </div>
    </nav>
  );
}
