"use client";

import { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { loginSuccess } from "@/store/userSlice";
import type { AppDispatch } from "@/store/store";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function LoginPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useRouter();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submitLogin = async () => {
    try {
      setLoading(true);

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/users`,
        form
      );

      if (res.data?.user) {
        dispatch(loginSuccess(res.data.user));
        toast("Login Successful")
        navigate.push("/dashboard");
      }

    } catch (error: any) {
      toast(error.response?.data?.message || "Login failed")
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-b from-[#1D1E1D] p-4">
      <div className="w-full max-w-md bg-linear-to-b from-[#434440] to-[#2a2b2a] p-8 rounded-2xl shadow-2xl border border-[#646460] relative">
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
          </div>
          <h1 className="text-4xl font-bold mb-1 bg-linear-to-b from-[#8E744B] to-[#AEA99E] bg-clip-text text-transparent">
            NEST
          </h1>
          <div className="h-px w-20 bg-linear-to-b from-transparent via-[#646460] to-transparent my-2"></div>
          <h3 className="text-lg font-semibold text-[#AEA99E] tracking-wider">ADMIN LOGIN</h3>
        </div>

        <div className="space-y-6 mb-8">
          <div className="relative">
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              className="w-full p-4 bg-[#1D1E1D] border border-[#646460] text-white placeholder-[#88857E] rounded-xl outline-none focus:border-[#8E744B] focus:ring-2 focus:ring-[#8E744B]/30 transition-all duration-200"
              onChange={handleChange}
            />

          </div>

          <div className="relative">
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="w-full p-4 bg-[#1D1E1D] border border-[#646460] text-white placeholder-[#88857E] rounded-xl outline-none focus:border-[#8E744B] focus:ring-2 focus:ring-[#8E744B]/30 transition-all duration-200"
              onChange={handleChange}
            />

          </div>
        </div>


        <button
          onClick={submitLogin}
          disabled={loading}
          className="w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 relative overflow-hidden group shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: "linear-gradient(135deg, #15537F 0%, #8E744B 100%)",
            color: "#FFFFFF"
          }}
        >
          <div className="absolute inset-0 bg-linear-to-b from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          <span className="relative">
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Authenticating...
              </span>
            ) : (
              "Login"
            )}
          </span>
        </button>


        <div className="mt-8 flex items-center justify-center">
          <div className="flex items-center space-x-2 text-sm text-[#646460]">
            <div className="w-2 h-2 rounded-full bg-[#8E744B] animate-pulse"></div>
            <span>Secure Admin Portal</span>
            <div className="w-2 h-2 rounded-full bg-[#15537F] animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}