"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { useSelector } from "react-redux"
import type { RootState } from "@/store/store"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import Card from "@/components/card"
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { logoutUser } from "@/store/userSlice";

export default function DashboardPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoggedIn } = useSelector((state: RootState) => state.user)
  const router = useRouter()

  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoggedIn) router.push("/")
  }, [isLoggedIn])


  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/properties`)
        setProperties(res.data.data || [])
      } catch (error: any) {
        const message = error.response?.data?.message;

        if (message === "Token expired") {
          dispatch(logoutUser());
          toast("Session expired. Please log in again.");
          return;
        }

        toast(message || "Update Failed");
      } finally {
        setLoading(false)
      }
    }

    fetchProperties()
  }, [])

  if (!isLoggedIn) return null

  return (
    <div className="min-h-screen bg-[#1D1E1D] text-white">
      <Navbar />

      <div className="px-6 py-8">
        <h1 className="text-3xl font-bold mb-6" style={{ color: "#8E744B" }}>
          Properties
        </h1>

        {loading ? (
          <p className="text-[#AEA99E] text-lg">Loading properties...</p>
        ) : properties.length === 0 ? (
          <p className="text-[#AEA99E] text-lg">No properties found...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {properties.map((pg) => (
              <Card
                key={pg._id}
                id={pg._id}
                name={pg.name}
                description={pg.description}
                location={pg.location}
                gender={pg.gender}
                roomTypes={pg.roomTypes}
                images={pg.images}
                status={pg.status}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
