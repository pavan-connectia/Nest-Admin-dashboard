"use client";

import { useState } from "react";
import { ChevronLeft, MapPin, Users, ArrowRight } from "lucide-react";
import ImageGallery from "./image-gallery";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import axios from "axios";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";

interface Amenity {
    _id: string;
    name: string;
    imageUrl: string;
}

interface Service {
    _id: string;
    name: string;
    imageUrl: string;
}

interface RoomType {
    type: string;
    pricePerMonth: number;
    capacity: number;
    availableRooms: number;
    _id: string;
}

interface PropertyDetailProps {
    property: {
        _id: string;
        name: string;
        description: string;
        gender: string;
        propertyType: string;
        location: {
            city: string;
            area: string;
            address: string;
            latitude: number;
            longitude: number;
        };
        roomTypes: RoomType[];
        amenities: Amenity[];
        services: Service[];
        images: string[];
        videos: string[];
        status: string;
    };
    onBack: () => void;
}

export default function PropertyDetail({ property, onBack }: PropertyDetailProps) {
    const [selectedRoom, setSelectedRoom] = useState<RoomType | null>(null);
    const params = useParams();
    const id = params.id as string;
    const { token, isLoggedIn } = useSelector((state: RootState) => state.user);
    const router = useRouter();

    // Redirect if unauthorized
    if (!isLoggedIn) {
        router.push("/");
        return null;
    }

    const handleDelete = async () => {
        try {
            const res = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/properties/${id}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            if (res.data.status === 200) {
                toast("Property deleted successfully");
                router.push("/dashboard");
            }

        } catch (error: any) {
            toast(error.response?.data?.message || "delete failed")
        }
    }

    return (
        <div className="px-5 py-10 max-w-7xl mx-auto">
            {/* Back Button */}
            <button
                onClick={onBack}
                className="flex items-center gap-2 mb-4 text-[#8E744B]"
            >
                <ChevronLeft size={20} /> Back
            </button>

            {/* Title */}
            <h1 className="text-4xl font-bold text-[#AEA99E] mb-4">
                {property.name}
            </h1>

            {/* Address + Gender */}
            <div className="flex gap-6 text-[#88857E] mb-4">
                <div className="flex items-center gap-2">
                    <MapPin size={18} color="#8E744B" /> {property.location.address}
                </div>
                <div className="flex items-center gap-2 capitalize">
                    <Users size={18} color="#8E744B" /> {property.gender}
                </div>
            </div>

            <p className="text-[#AEA99E] mb-6">{property.description}</p>

            {/* IMAGE GALLERY */}
            <ImageGallery images={property.images} />

            {/* ROOM TYPES */}
            <h2 className="text-2xl font-bold text-[#8E744B] mt-10 mb-4">
                Room Types & Pricing
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {property.roomTypes.map((room) => (
                    <div
                        key={room._id}
                        onClick={() => setSelectedRoom(room)}
                        className="bg-[#434440] p-5 rounded-xl cursor-pointer border border-[#1D1E1D] hover:border-[#8E744B]"
                    >
                        <h3 className="text-xl text-[#AEA99E] capitalize mb-2">{room.type}</h3>
                        <p className="text-white text-3xl mb-2">₹{room.pricePerMonth}</p>
                        <p className="text-[#88857E]">
                            Capacity: {room.capacity} person{room.capacity > 1 ? "s" : ""}
                        </p>
                        <p className="text-[#8E744B] font-semibold mt-2">
                            {room.availableRooms} rooms left
                        </p>
                    </div>
                ))}
            </div>

            <h2 className="text-2xl font-bold text-[#8E744B] mt-10 mb-4">Amenities</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {property.amenities.map((item) => (
                    <div key={item._id} className="bg-[#434440] p-4 rounded-lg flex gap-3">
                        <img src={item.imageUrl} className="w-10 h-10 rounded" />
                        <span className="text-[#AEA99E]">{item.name}</span>
                    </div>
                ))}
            </div>

            <h2 className="text-2xl font-bold text-[#8E744B] mt-10 mb-4">Services</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

                {property.services.map((item) => (
                    <div key={item._id} className="bg-[#434440] p-4 rounded-lg flex gap-3">
                        <img src={item.imageUrl} className="w-10 h-10 rounded" />
                        <span className="text-[#AEA99E]">{item.name}</span>
                    </div>
                ))}
            </div>

            {/* MAP SECTION */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4" style={{ color: "#8E744B" }}>
                    Location Map
                </h2>

                <div className="w-full h-96 rounded-xl overflow-hidden">
                    <iframe
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        loading="lazy"
                        allowFullScreen
                        src={`https://www.google.com/maps?q=${property.location.latitude},${property.location.longitude}&hl=es;z=14&output=embed`}
                    ></iframe>
                </div>
            </div>

            <div className="felx justify-between flex-row">
                <div><button>Delete</button></div>
                <div onClick={() => router.push(`/property/${id}`)}><button>Update</button></div>
            </div>

        </div>
    );
}
