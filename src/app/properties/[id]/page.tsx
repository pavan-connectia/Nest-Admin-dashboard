"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter, useParams } from "next/navigation";
import Navbar from "@/components/navbar";
import PropertyDetail from "@/components/property-detail";

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

interface PropertyData {
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
  roomTypes: Array<{
    type: string;
    pricePerMonth: number;
    capacity: number;
    availableRooms: number;
    _id: string;
  }>;
  amenities: Amenity[];
  services: Service[];
  images: string[];
  videos: string[];
  status: string;
}

export default function PropertyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [property, setProperty] = useState<PropertyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchProperty = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/properties/${id}`
        );
        setProperty(res.data.data);
      } catch (err) {
        console.error("Error loading property", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  if (loading)
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="text-center mt-24 text-[#AEA99E]">
          Loading property...
        </div>
      </div>
    );

  if (!property)
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="text-center mt-24 text-red-400">
          Property not found
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#1D1E1D] text-white">
      <Navbar />
      <PropertyDetail property={property} onBack={() => router.back()} />
    </div>
  );
}
