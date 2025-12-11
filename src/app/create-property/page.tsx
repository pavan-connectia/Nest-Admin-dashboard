"use client";

import { useEffect, useState, ChangeEvent } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Navbar from "@/components/navbar";

interface Amenity {
  _id: string;
  name: string;
}

interface Service {
  _id: string;
  name: string;
}

interface RoomType {
  type: string;
  pricePerMonth: string;
  capacity: string;
  availableRooms: string;
}

interface Location {
  city: string;
  area: string;
  address: string;
  latitude: string;
  longitude: string;
}

interface PropertyFormState {
  name: string;
  description: string;
  gender: string;
  propertyType: string;
  location: Location;
  roomTypes: RoomType[];
  amenities: string[];
  services: string[];
  images: string;
  videos: string;
  status: string;
}

export default function CreatePropertyPage() {
  const router = useRouter();
  const { token, isLoggedIn } = useSelector((state: RootState) => state.user);

  // Redirect if unauthorized
  if (!isLoggedIn) {
    router.push("/");
    return null;
  }


  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  const [form, setForm] = useState<PropertyFormState>({
    name: "",
    description: "",
    gender: "boys",
    propertyType: "pg",
    location: {
      city: "",
      area: "",
      address: "",
      latitude: "",
      longitude: "",
    },
    roomTypes: [
      { type: "single", pricePerMonth: "", capacity: "", availableRooms: "" },
    ],
    amenities: [],
    services: [],
    images: "",
    videos: "",
    status: "available",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [amenityResponse, serviceResponse] = await Promise.all([
          axios.get("http://localhost:5000/api/amenities/"),
          axios.get("http://localhost:5000/api/services/"),
        ]);

        setAmenities(amenityResponse.data.data || []);
        setServices(serviceResponse.data.data || []);
      } catch {
        toast.error("Failed to load amenities & services.");
      }
    };

    fetchData();
  }, []);

  const handleInput = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name.startsWith("location.")) {
      const field = name.split(".")[1];
      setForm((prev) => ({
        ...prev,
        location: { ...prev.location, [field]: value },
      }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoomChange = (index: number, field: keyof RoomType, value: string) => {
    const updatedRooms = [...form.roomTypes];
    updatedRooms[index][field] = value;

    setForm((prev) => ({ ...prev, roomTypes: updatedRooms }));
  };

  const addRoomType = () => {
    setForm((prev) => ({
      ...prev,
      roomTypes: [
        ...prev.roomTypes,
        { type: "", pricePerMonth: "", capacity: "", availableRooms: "" },
      ],
    }));
  };

  const removeRoomType = (index: number) => {
    setForm((prev) => ({
      ...prev,
      roomTypes: prev.roomTypes.filter((_, i) => i !== index),
    }));
  };

  const createProperty = async () => {
    try {
      const payload = {
        ...form,
        roomTypes: form.roomTypes.map((room) => ({
          ...room,
          pricePerMonth: Number(room.pricePerMonth),
          capacity: Number(room.capacity),
          availableRooms: Number(room.availableRooms),
        })),
        images: form.images.split(",").map((img) => img.trim()),
        videos: form.videos.split(",").map((vid) => vid.trim()),
      };

      const response = await axios.post(
        "http://localhost:5000/api/poperties",
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Property created successfully!");
      router.push(`/dashboard/${response.data?.data?._id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create property.");
    }
  };

  return (
    <div className="bg-[#1D1D1E]">
      <Navbar />
      <div className="min-h-screen  text-white flex justify-center p-6">
        <div className="w-full max-w-5xl bg-gradient-to-b from-[#434440] to-[#2a2b2a] p-8 rounded-2xl border border-[#646460] shadow-lg">

          <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-[#8E744B] to-[#AEA99E] bg-clip-text text-transparent mb-8">
            Create New Property
          </h1>

          <div className="space-y-6">

            <input
              name="name"
              placeholder="Property Name"
              onChange={handleInput}
              className="input"
            />

            <textarea
              name="description"
              placeholder="Description"
              onChange={handleInput}
              className="input h-28"
            />

            <div className="grid grid-cols-2 gap-4">
              <select name="gender" onChange={handleInput} className="input">
                <option value="boys">Boys</option>
                <option value="girls">Girls</option>
                <option value="co-ed">Co-Ed</option>
              </select>

              <select name="propertyType" onChange={handleInput} className="input">
                <option value="pg">PG</option>
              </select>
            </div>

            <h3 className="section-title">Location</h3>

            <input name="location.city" placeholder="City" onChange={handleInput} className="input" />
            <input name="location.area" placeholder="Area" onChange={handleInput} className="input" />
            <input name="location.address" placeholder="Address" onChange={handleInput} className="input" />

            <div className="grid grid-cols-2 gap-4">
              <input name="location.latitude" placeholder="Latitude" onChange={handleInput} className="input" />
              <input name="location.longitude" placeholder="Longitude" onChange={handleInput} className="input" />
            </div>

            <h3 className="section-title">Room Types</h3>

            {form.roomTypes.map((room, index) => (
              <div key={index} className="room-box">

                <div className="grid grid-cols-4 gap-3">
                  <input
                    placeholder="Type"
                    value={room.type}
                    onChange={(e) => handleRoomChange(index, "type", e.target.value)}
                    className="input"
                  />

                  <input
                    placeholder="Price"
                    value={room.pricePerMonth}
                    onChange={(e) => handleRoomChange(index, "pricePerMonth", e.target.value)}
                    className="input"
                  />

                  <input
                    placeholder="Capacity"
                    value={room.capacity}
                    onChange={(e) => handleRoomChange(index, "capacity", e.target.value)}
                    className="input"
                  />

                  <input
                    placeholder="Available"
                    value={room.availableRooms}
                    onChange={(e) => handleRoomChange(index, "availableRooms", e.target.value)}
                    className="input"
                  />
                </div>

                {form.roomTypes.length > 1 && (
                  <button
                    onClick={() => removeRoomType(index)}
                    className="remove-btn"
                  >
                    Remove Room Type
                  </button>
                )}
              </div>
            ))}

            <button onClick={addRoomType} className="add-btn">
              + Add Room Type
            </button>

            <h3 className="section-title">Amenities</h3>

            <div className="grid grid-cols-2 gap-3">
              {amenities.map((item) => (
                <label key={item._id} className="checkbox-label">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setForm((prev) => ({
                        ...prev,
                        amenities: checked
                          ? [...prev.amenities, item._id]
                          : prev.amenities.filter((id) => id !== item._id),
                      }));
                    }}
                  />
                  {item.name}
                </label>
              ))}
            </div>

            <h3 className="section-title">Services</h3>

            <div className="grid grid-cols-2 gap-3">
              {services.map((item) => (
                <label key={item._id} className="checkbox-label">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setForm((prev) => ({
                        ...prev,
                        services: checked
                          ? [...prev.services, item._id]
                          : prev.services.filter((id) => id !== item._id),
                      }));
                    }}
                  />
                  {item.name}
                </label>
              ))}
            </div>


            <input
              name="images"
              placeholder="Image URLs, separated by commas"
              onChange={handleInput}
              className="input"
            />

            <input
              name="videos"
              placeholder="Video URLs, separated by commas"
              onChange={handleInput}
              className="input"
            />

            <button
              onClick={createProperty}
              className="submit-btn"
            >
              Create Property
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}
