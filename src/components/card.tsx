"use client"

import { MapPin, Users, Wifi } from "lucide-react"
import { useRouter } from "next/navigation"

interface RoomType {
    type: string
    pricePerMonth: number
    capacity: number
    availableRooms: number
}

interface PropertyCardProps {
    id: string
    name: string
    description?: string
    location: {
        city: string
        area: string
    }
    gender: string
    roomTypes: RoomType[]
    images: string[]
    status: string
}

export default function PGCard({
    id,
    name,
    description,
    location,
    gender,
    roomTypes,
    images,
    status,
}: PropertyCardProps) {
    const router = useRouter()
    const minPrice = Math.min(...roomTypes.map((r) => r.pricePerMonth))
    const maxPrice = Math.max(...roomTypes.map((r) => r.pricePerMonth))

    return (
        <div
            onClick={() => router.push(`/dashboard/${id}`)}
            className="group bg-[#434440] rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer hover:-translate-y-1"
        >
            <div className="relative overflow-hidden h-56 bg-[#2D2D2A]">
                <img
                    src={`${process.env.NEXT_PUBLIC_API_URL}${images?.[0] || "/placeholder.svg"}`}
                    alt={name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3 bg-green-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    {status === "available" ? "Available" : "Full"}
                </div>
            </div>

            <div className="p-5 space-y-4">
                <div>
                    <h3 className="text-lg font-bold mb-2 line-clamp-1" style={{ color: "#AEA99E" }}>
                        {name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm" style={{ color: "#88857E" }}>
                        <MapPin size={16} className="flex-shrink-0" />
                        <span className="line-clamp-1">
                            {location.area}, {location.city}
                        </span>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#3A3934]">
                    <div className="flex items-center gap-1.5">
                        <Users size={16} style={{ color: "#8E744B" }} />
                        <span className="text-sm capitalize" style={{ color: "#AEA99E" }}>
                            {gender}
                        </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-[#88857E]">
                        <Wifi size={14} />
                        <span>WiFi Included</span>
                    </div>
                </div>


                <button className="w-full bg-[#8E744B] hover:bg-[#9A7E56] text-white font-medium py-2.5 rounded-lg transition-colors duration-200">
                    View Details
                </button>
            </div>
        </div>
    )
}
