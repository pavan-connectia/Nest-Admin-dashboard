"use client";

import { useState } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";
import { updateUserState, logoutUser } from "@/store/userSlice";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Navbar from "@/components/navbar";

export default function DashboardPage() {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();

    const { isLoggedIn, name, email, token } = useSelector(
        (state: RootState) => state.user
    );

    const [form, setForm] = useState({
        name,
        email,
        password: "",
    });

    const [loading, setLoading] = useState(false);

    // Redirect if not logged in
    if (!isLoggedIn) {
        router.push("/");
        return null;
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const updateProfile = async () => {
        try {
            setLoading(true);

            const res = await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/api/users/update`,
                {
                    name: form.name,
                    email: form.email,
                    password: form.password,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (res.data?.user) {
                dispatch(updateUserState(res.data.user));
            }

            toast("Profile Updated Successfully!");

        } catch (error: any) {
            toast(error.response?.data?.message || "Update Failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Navbar />
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#1D1E1D] p-4">
            
            <div className="w-full max-w-md bg-gradient-to-b from-[#434440] to-[#2a2b2a] p-8 rounded-2xl shadow-2xl border border-[#646460] relative">

                {/* Header */}
                <div className="flex flex-col items-center mb-8">
                    <h1 className="text-4xl font-bold mb-1 bg-gradient-to-r from-[#8E744B] to-[#AEA99E] bg-clip-text text-transparent">
                        NEST
                    </h1>
                    <div className="h-px w-20 bg-gradient-to-r from-transparent via-[#646460] to-transparent my-2"></div>
                    <h3 className="text-lg font-semibold text-[#AEA99E] tracking-wider">
                        PROFILE SETTINGS
                    </h3>
                </div>

                {/* Input Fields */}
                <div className="space-y-6 mb-8">
                    <input
                        type="text"
                        name="name"
                        value={form.name}
                        placeholder="Full Name"
                        onChange={handleChange}
                        className="w-full p-4 bg-[#1D1E1D] border border-[#646460] text-white placeholder-[#88857E] rounded-xl outline-none focus:border-[#8E744B] focus:ring-2 focus:ring-[#8E744B]/30 transition-all duration-200"
                    />

                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        placeholder="Email Address"
                        onChange={handleChange}
                        className="w-full p-4 bg-[#1D1E1D] border border-[#646460] text-white placeholder-[#88857E] rounded-xl outline-none focus:border-[#8E744B] focus:ring-2 focus:ring-[#8E744B]/30 transition-all duration-200"
                    />

                    <input
                        type="password"
                        name="password"
                        value={form.password}
                        placeholder="New Password (optional)"
                        onChange={handleChange}
                        className="w-full p-4 bg-[#1D1E1D] border border-[#646460] text-white placeholder-[#88857E] rounded-xl outline-none focus:border-[#8E744B] focus:ring-2 focus:ring-[#8E744B]/30 transition-all duration-200"
                    />
                </div>

                {/* Update Button */}
                <button
                    onClick={updateProfile}
                    disabled={loading}
                    className="w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 relative overflow-hidden group shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                        background: "linear-gradient(135deg, #15537F 0%, #8E744B 100%)",
                        color: "#FFFFFF",
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    <span className="relative">
                        {loading ? "Updating..." : "Update Profile"}
                    </span>
                </button>

                {/* Footer */}
                <div className="mt-8 flex items-center justify-center">
                    <div className="flex items-center space-x-2 text-sm text-[#646460]">
                        <div className="w-2 h-2 rounded-full bg-[#8E744B] animate-pulse"></div>
                        <span>Manage Your Account Securely</span>
                        <div className="w-2 h-2 rounded-full bg-[#15537F] animate-pulse"></div>
                    </div>
                </div>
            </div>
        </div>
        </div>
    );
}
