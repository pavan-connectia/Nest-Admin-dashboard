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

interface Food {
    _id: string;
    breakfast: string;
    day: string;
    dinner: string;
    lunch: string;
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
        foodMenu: Food[];
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

    if (!isLoggedIn) {
        router.push("/");
        return null;
    }

    const handleDelete = async () => {
        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/properties/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            toast("Property deleted successfully");
            router.push("/dashboard");
        } catch (error: any) {
            toast(error.response?.data?.message || "delete failed");
        }
    };

    return (
        <div className="px-4 md:px-6 lg:px-10 py-6 md:py-10 max-w-7xl mx-auto">

            {/* Back Button */}
            <button
                onClick={onBack}
                className="flex items-center gap-2 mb-4 text-[#8E744B] text-sm md:text-base"
            >
                <ChevronLeft size={20} /> Back
            </button>

            {/* Title */}
            <h1 className="text-2xl md:text-4xl font-bold text-[#AEA99E] mb-3 md:mb-4">
                {property.name}
            </h1>

            {/* Address + Gender */}
            <div className="flex flex-col md:flex-row gap-2 md:gap-6 text-[#88857E] mb-4 text-sm md:text-base">
                <div className="flex items-center gap-2">
                    <MapPin size={18} color="#8E744B" /> {property.location.address}
                </div>
                <div className="flex items-center gap-2 capitalize">
                    <Users size={18} color="#8E744B" /> {property.gender}
                </div>
            </div>

            <p className="text-[#AEA99E] mb-6 text-sm md:text-base">{property.description}</p>

            {/* IMAGE GALLERY */}
            <div className="mb-8">
                <ImageGallery images={property.images} />
            </div>

            {/* ROOM TYPES */}
            <h2 className="text-xl md:text-2xl font-bold text-[#8E744B] mt-6 md:mt-10 mb-3 md:mb-4">
                Room Types & Pricing
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {property.roomTypes.map((room) => (
                    <div
                        key={room._id}
                        onClick={() => setSelectedRoom(room)}
                        className="bg-[#434440] p-4 md:p-5 rounded-xl cursor-pointer border border-[#1D1E1D] hover:border-[#8E744B] transition-all"
                    >
                        <h3 className="text-lg md:text-xl text-[#AEA99E] capitalize mb-2">{room.type}</h3>
                        <p className="text-white text-2xl md:text-3xl mb-1 md:mb-2">₹{room.pricePerMonth}</p>
                        <p className="text-[#88857E] text-sm md:text-base">
                            Capacity: {room.capacity} person{room.capacity > 1 ? "s" : ""}
                        </p>
                        <p className="text-[#8E744B] font-semibold mt-2 text-sm md:text-base">
                            {room.availableRooms} rooms left
                        </p>
                    </div>
                ))}
            </div>

            {/* Amenities */}
            <h2 className="text-xl md:text-2xl font-bold text-[#8E744B] mt-8 md:mt-10 mb-4">
                Amenities
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
                {property.amenities.map((item) => (
                    <div key={item._id} className="bg-[#434440] p-3 md:p-4 rounded-lg flex gap-3 items-center">
                        <img src={item.imageUrl} className="w-8 h-8 md:w-10 md:h-10 rounded" />
                        <span className="text-[#AEA99E] text-sm md:text-base">{item.name}</span>
                    </div>
                ))}
            </div>

            {/* Services */}
            <h2 className="text-xl md:text-2xl font-bold text-[#8E744B] mt-8 md:mt-10 mb-4">
                Services
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
                {property.services.map((item) => (
                    <div key={item._id} className="bg-[#434440] p-3 md:p-4 rounded-lg flex gap-3 items-center">
                        <img src={item.imageUrl} className="w-8 h-8 md:w-10 md:h-10 rounded" />
                        <span className="text-[#AEA99E] text-sm md:text-base">{item.name}</span>
                    </div>
                ))}
            </div>

            {/* FOOD MENU */}
            <h2 className="text-xl md:text-2xl font-bold text-[#8E744B] mt-8 md:mt-10 mb-4">
                Weekly Food Menu
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {property.foodMenu?.map((item) => (
                    <div
                        key={item._id}
                        className="bg-[#434440] p-4 rounded-xl border border-[#1D1E1D]"
                    >
                        <h3 className="text-lg md:text-xl font-semibold text-[#8E744B] mb-2">
                            {item.day}
                        </h3>

                        <p className="text-[#AEA99E] text-sm md:text-base mb-1">
                            <span className="font-semibold text-white">Breakfast:</span> {item.breakfast}
                        </p>

                        <p className="text-[#AEA99E] text-sm md:text-base mb-1">
                            <span className="font-semibold text-white">Lunch:</span> {item.lunch}
                        </p>

                        <p className="text-[#AEA99E] text-sm md:text-base">
                            <span className="font-semibold text-white">Dinner:</span> {item.dinner}
                        </p>
                    </div>
                ))}
            </div>


            {/* MAP SECTION */}
            <div className="mb-10 mt-8">
                <h2 className="text-xl md:text-2xl font-bold mb-4" style={{ color: "#8E744B" }}>
                    Location Map
                </h2>

                <div className="w-full h-64 sm:h-80 md:h-96 rounded-xl overflow-hidden">
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

            {/* ACTION BUTTONS */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6 md:mt-10">

                <button
                    onClick={handleDelete}
                    className="w-full sm:w-auto px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md transition-all text-center"
                >
                    Delete Property
                </button>

                <button
                    onClick={() => router.push(`/properties/update/${id}`)}
                    className="w-full sm:w-auto px-6 py-3 bg-[#8E744B] hover:bg-[#7a653f] text-white font-semibold rounded-lg shadow-md transition-all flex items-center justify-center gap-2"
                >
                    Update Property <ArrowRight size={18} />
                </button>

            </div>

        </div>
    );
}
