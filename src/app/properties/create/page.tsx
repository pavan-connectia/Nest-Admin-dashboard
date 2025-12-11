"use client";

import { useEffect, useState, ChangeEvent } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Navbar from "@/components/navbar";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Amenity { _id: string; name: string }
interface Service { _id: string; name: string }

interface RoomType {
  type: string;
  pricePerMonth: string;
  capacity: string;
  availableRooms: string;
}

interface LocationState {
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
  location: LocationState;
  roomTypes: RoomType[];
  amenities: string[];
  services: string[];
  status: string;
}

export default function CreatePropertyPage() {
  const router = useRouter();
  const { token, isLoggedIn } = useSelector((state: RootState) => state.user);

  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  const [images, setImages] = useState<File[]>([]);
  const [videos, setVideos] = useState<File[]>([]);

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
    status: "available",
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) router.push("/");
  }, [isLoggedIn]);

  // Fetch amenities & services
  useEffect(() => {
    (async () => {
      try {
        const [amenityRes, serviceRes] = await Promise.all([
          axios.get(`${API_URL}/api/amenities`),
          axios.get(`${API_URL}/api/services`),
        ]);

        setAmenities(amenityRes.data.data || []);
        setServices(serviceRes.data.data || []);
      } catch {
        toast.error("Failed to load amenities/services.");
      }
    })();
  }, []);

  // Input handler
  const handleInput = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name.startsWith("location.")) {
      const key = name.split(".")[1];
      setForm((prev) => ({
        ...prev,
        location: { ...prev.location, [key]: value },
      }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Room updates
  const updateRoom = (index: number, field: keyof RoomType, value: string) => {
    setForm((prev) => {
      const updated = [...prev.roomTypes];
      updated[index][field] = value;
      return { ...prev, roomTypes: updated };
    });
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

  const removeRoomType = (i: number) => {
    setForm((prev) => ({
      ...prev,
      roomTypes: prev.roomTypes.filter((_, idx) => idx !== i),
    }));
  };

  // File handlers
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => { if (e.target.files) { setImages([...images, ...Array.from(e.target.files)]); } };

  const handleVideoUpload = (e: ChangeEvent<HTMLInputElement>) => { if (e.target.files) { setVideos([...videos, ...Array.from(e.target.files)]); } };

  // Submit form
  const createProperty = async () => {
    try {
      const fd = new FormData();

      Object.entries(form).forEach(([key, val]) => {
        if (key === "location") {
          Object.entries(val).forEach(([locKey, locVal]) => {
            fd.append(`location[${locKey}]`, locVal as string);
          });
        } else if (key === "roomTypes") {
          form.roomTypes.forEach((room, i) => {
            Object.entries(room).forEach(([k, v]) => {
              fd.append(`roomTypes[${i}][${k}]`, v);
            });
          });
        } else if (key === "amenities" || key === "services") {
          (val as string[]).forEach((id) => fd.append(key, id));
        } else {
          fd.append(key, val as string);
        }
      });

      images.forEach((img) => fd.append("images", img));
      videos.forEach((vid) => fd.append("videos", vid));

      const res = await axios.post(`${API_URL}/api/properties`, fd, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Property created successfully!");
      router.push(`/properties/${res.data.data._id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create property");
    }
  };

  return (
  <div className="bg-[#1D1D1E] min-h-screen">
    <Navbar />

    <div className="flex justify-center px-4 sm:px-6 py-6">
      <div className="w-full max-w-5xl bg-linear-to-b from-[#434440] to-[#2a2b2a] p-6 sm:p-8 rounded-2xl shadow-xl border border-[#646460]">

        <h1 className="text-3xl sm:text-4xl font-bold text-center text-transparent bg-clip-text bg-linear-to-b from-[#8E744B] to-[#AEA99E] mb-8 sm:mb-10">
          Create Property
        </h1>

        {/* NAME */}
        <input className="input w-full" placeholder="Property Name" name="name" onChange={handleInput} />

        {/* DESCRIPTION */}
        <textarea className="input w-full h-24 sm:h-28 mt-4" placeholder="Description" name="description" onChange={handleInput} />

        {/* GENDER & TYPE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          <select className="input w-full" name="gender" onChange={handleInput}>
            <option value="boys">Boys</option>
            <option value="girls">Girls</option>
            <option value="co-ed">Co-Ed</option>
          </select>

          <select className="input w-full" name="propertyType" onChange={handleInput}>
            <option value="pg">PG</option>
          </select>
        </div>

        {/* LOCATION */}
        <h3 className="section-title mt-10">Location</h3>

        {["city", "area", "address"].map((field) => (
          <input
            key={field}
            className="input w-full my-2"
            name={`location.${field}`}
            placeholder={field}
            onChange={handleInput}
          />
        ))}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input className="input w-full" name="location.latitude" placeholder="Latitude" onChange={handleInput} />
          <input className="input w-full" name="location.longitude" placeholder="Longitude" onChange={handleInput} />
        </div>

        {/* ROOMS */}
        <h3 className="section-title mt-10">Room Types</h3>

        {form.roomTypes.map((room, i) => (
          <div key={i} className="room-box mt-3">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-2">
              {["type", "pricePerMonth", "capacity", "availableRooms"].map((field) => (
                <input
                  key={field}
                  className="input w-full"
                  placeholder={field}
                  value={room[field as keyof RoomType]}
                  onChange={(e) => updateRoom(i, field as keyof RoomType, e.target.value)}
                />
              ))}
            </div>

            {form.roomTypes.length > 1 && (
              <button className="remove-btn w-full sm:w-auto" onClick={() => removeRoomType(i)}>
                Remove Room Type
              </button>
            )}
          </div>
        ))}

        <button className="add-btn w-full sm:w-auto mt-3" onClick={addRoomType}>
          + Add Room Type
        </button>

        {/* AMENITIES */}
        <h3 className="section-title mt-10">Amenities</h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {amenities.map((a) => (
            <label key={a._id} className="checkbox-label flex items-center gap-2">
              <input
                type="checkbox"
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    amenities: e.target.checked
                      ? [...prev.amenities, a._id]
                      : prev.amenities.filter((id) => id !== a._id),
                  }))
                }
              />
              <span className="text-sm sm:text-base">{a.name}</span>
            </label>
          ))}
        </div>

        {/* SERVICES */}
        <h3 className="section-title mt-10">Services</h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {services.map((s) => (
            <label key={s._id} className="checkbox-label flex items-center gap-2">
              <input
                type="checkbox"
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    services: e.target.checked
                      ? [...prev.services, s._id]
                      : prev.services.filter((id) => id !== s._id),
                  }))
                }
              />
              <span className="text-sm sm:text-base">{s.name}</span>
            </label>
          ))}
        </div>

        {/* IMAGES */}
        <h3 className="section-title mt-10">Upload Images</h3>
        <input type="file" multiple accept="image/*" className="input w-full" onChange={handleImageUpload} />

        {images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
            {images.map((img, i) => (
              <img
                key={i}
                src={URL.createObjectURL(img)}
                className="w-full h-24 sm:h-28 rounded-xl object-cover"
              />
            ))}
          </div>
        )}

        {/* VIDEOS */}
        <h3 className="section-title mt-10">Upload Videos</h3>
        <input type="file" multiple accept="video/*" className="input w-full" onChange={handleVideoUpload} />

        {videos.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
            {videos.map((vid, i) => (
              <video
                key={i}
                controls
                src={URL.createObjectURL(vid)}
                className="w-full h-24 sm:h-28 rounded-xl"
              />
            ))}
          </div>
        )}

        {/* SUBMIT */}
        <button className="submit-btn w-full mt-10 py-3 text-lg" onClick={createProperty}>
          Create Property
        </button>
      </div>
    </div>
  </div>
);

}
