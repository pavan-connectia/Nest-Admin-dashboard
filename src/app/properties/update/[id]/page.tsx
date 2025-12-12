"use client";

import { useEffect, useState, ChangeEvent } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import Navbar from "@/components/navbar";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { logoutUser } from "@/store/userSlice";

interface RoomType {
  type: string;
  pricePerMonth: string | number;
  capacity: string | number;
  availableRooms: string | number;
}

interface FoodMenuDay {
  day: string;
  breakfast: string;
  lunch: string;
  dinner: string;
}

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

export default function UpdatePropertyPage() {
  const dispatch = useDispatch<AppDispatch>();
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { token, isLoggedIn } = useSelector((state: RootState) => state.user);
  const API = process.env.NEXT_PUBLIC_API_URL;

  const [loading, setLoading] = useState(true);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [videos, setVideos] = useState<File[]>([]);
  const [isEditingMenu, setIsEditingMenu] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    gender: "",
    propertyType: "",
    location: {
      city: "",
      area: "",
      address: "",
      latitude: "",
      longitude: "",
    },
    roomTypes: [] as RoomType[],
    foodMenu: [] as FoodMenuDay[],
    amenities: [] as string[],
    services: [] as string[],
    status: "",
    oldImages: [] as string[],
    oldVideos: [] as string[],
  });

  const weekDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  if (!isLoggedIn) {
    router.push("/");
    return null;
  }

  useEffect(() => {
    async function loadAll() {
      try {
        const [propertyRes, amenityRes, serviceRes] = await Promise.all([
          axios.get(`${API}/api/properties/${id}`),
          axios.get(`${API}/api/amenities`),
          axios.get(`${API}/api/services`),
        ]);

        const p = propertyRes.data.data;
        
        // Initialize food menu with all days if empty
        let foodMenuData = p.foodMenu || [];
        if (!foodMenuData || foodMenuData.length === 0) {
          foodMenuData = weekDays.map(day => ({
            day,
            breakfast: "",
            lunch: "",
            dinner: ""
          }));
        }

        setForm({
          name: p.name,
          description: p.description,
          gender: p.gender,
          propertyType: p.propertyType,
          location: p.location,
          roomTypes: p.roomTypes,
          foodMenu: foodMenuData,
          amenities: p.amenities?.map((a: Amenity) => a._id) || [],
          services: p.services?.map((s: Service) => s._id) || [],
          status: p.status,
          oldImages: p.images || [],
          oldVideos: p.videos || [],
        });

        setAmenities(amenityRes.data.data);
        setServices(serviceRes.data.data);
        setLoading(false);
      } catch (err) {
        console.error("Error loading property:", err);
        toast.error("Failed to fetch property details");
      }
    }

    loadAll();
  }, [id]);

  const handleInput = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
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

  const handleRoomChange = (i: number, key: keyof RoomType, value: string) => {
    const updated = [...form.roomTypes];
    updated[i][key] = value;
    setForm((prev) => ({ ...prev, roomTypes: updated }));
  };

  const handleFoodMenuChange = (i: number, field: keyof FoodMenuDay, value: string) => {
    const updated = [...form.foodMenu];
    updated[i][field] = value;
    setForm((prev) => ({ ...prev, foodMenu: updated }));
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
      roomTypes: prev.roomTypes.filter((_, index) => index !== i),
    }));
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setImages([...images, ...Array.from(e.target.files)]);
  };

  const handleVideoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setVideos([...videos, ...Array.from(e.target.files)]);
  };

  const handleUpdate = async () => {
    try {
      const fd = new FormData();

      fd.append("name", form.name);
      fd.append("description", form.description);
      fd.append("gender", form.gender);
      fd.append("propertyType", form.propertyType);
      fd.append("status", form.status);

      Object.entries(form.location).forEach(([key, value]) => {
        fd.append(`location.${key}`, String(value));
      });

      form.roomTypes.forEach((room, index) => {
        fd.append(`roomTypes[${index}][type]`, room.type);
        fd.append(`roomTypes[${index}][pricePerMonth]`, String(room.pricePerMonth));
        fd.append(`roomTypes[${index}][capacity]`, String(room.capacity));
        fd.append(`roomTypes[${index}][availableRooms]`, String(room.availableRooms));
      });

      form.foodMenu.forEach((menu, index) => {
        fd.append(`foodMenu[${index}][day]`, menu.day);
        fd.append(`foodMenu[${index}][breakfast]`, menu.breakfast);
        fd.append(`foodMenu[${index}][lunch]`, menu.lunch);
        fd.append(`foodMenu[${index}][dinner]`, menu.dinner);
      });

      form.amenities.forEach((id) => fd.append("amenities", id));
      form.services.forEach((id) => fd.append("services", id));

      images.forEach((file) => fd.append("images", file));
      videos.forEach((file) => fd.append("videos", file));

      const res = await axios.put(`${API}/api/properties/${id}`, fd, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Property Updated Successfully!");
      router.push(`/properties/${id}`);
    } catch (err: any) {
      console.error("Update error:", err);
      const message = err.response?.data?.message;

      if (message === "Token expired") {
        dispatch(logoutUser());
        toast.error("Session expired. Please log in again.");
        return;
      }

      toast.error(message || "Update Failed");
    }
  };

  if (loading) return (
    <div className="bg-[#1D1D1E] min-h-screen flex items-center justify-center">
      <div className="text-[#AEA99E] text-xl">Loading...</div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="p-4 sm:p-6">
        <div className="max-w-6xl mx-auto bg-linear-to-b from-[#434440] to-[#2a2b2a] p-6 sm:p-8 rounded-2xl shadow-xl border border-[#646460]">
          <h1 className="text-3xl sm:text-4xl font-bold text-center text-transparent bg-clip-text bg-linear-to-b from-[#8E744B] to-[#AEA99E] mb-8 sm:mb-10]">
            Update Property
          </h1>

          {/* BASIC INFORMATION SECTION */}
          <div className="bg-[#2d2e2d] p-6 rounded-xl mb-8">
            <h2 className="text-xl font-bold mb-4 text-[#AEA99E]">Basic Information</h2>
            
            <input
              name="name"
              className="input w-full mb-4"
              value={form.name}
              onChange={handleInput}
              placeholder="Property Name"
            />

            <textarea
              name="description"
              className="input w-full h-24 sm:h-28 mb-4"
              value={form.description}
              onChange={handleInput}
              placeholder="Description"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <select name="gender" value={form.gender} onChange={handleInput} className="input w-full">
                <option value="">Select Gender</option>
                <option value="boys">Boys</option>
                <option value="girls">Girls</option>
                <option value="unisex">Unisex</option>
              </select>

              <select name="propertyType" value={form.propertyType} onChange={handleInput} className="input w-full">
                <option value="">Property Type</option>
                <option value="pg">PG</option>
                <option value="hostel">Hostel</option>
                <option value="apartment">Apartment</option>
                <option value="studio">Studio</option>
              </select>
            </div>

            <select name="status" value={form.status} onChange={handleInput} className="input w-full">
              <option value="">Select Status</option>
              <option value="available">Available</option>
              <option value="waiting">Waiting</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {/* LOCATION SECTION */}
          <div className="bg-[#2d2e2d] p-6 rounded-xl mb-8">
            <h2 className="text-xl font-bold mb-4 text-[#AEA99E]">Location Details</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <input
                name="location.city"
                className="input w-full"
                value={form.location.city}
                onChange={handleInput}
                placeholder="City"
              />

              <input
                name="location.area"
                className="input w-full"
                value={form.location.area}
                onChange={handleInput}
                placeholder="Area"
              />
            </div>

            <input
              name="location.address"
              className="input w-full mb-4"
              value={form.location.address}
              onChange={handleInput}
              placeholder="Full Address"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                name="location.latitude"
                className="input w-full"
                value={form.location.latitude}
                onChange={handleInput}
                placeholder="Latitude"
              />

              <input
                name="location.longitude"
                className="input w-full"
                value={form.location.longitude}
                onChange={handleInput}
                placeholder="Longitude"
              />
            </div>
          </div>

          {/* ROOM TYPES SECTION */}
          <div className="bg-[#2d2e2d] p-6 rounded-xl mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#AEA99E]">Room Types</h2>
              <button onClick={addRoomType} className="px-4 py-2 bg-linear-to-b from-[#8E744B] to-[#AEA99E] text-white rounded-lg hover:bg-[#7c7c77] cursor-pointer">
                + Add Room
              </button>
            </div>

            {form.roomTypes.map((room, idx) => (
              <div key={idx} className="border border-[#646460] rounded-lg p-4 mb-4">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-2">
                  <input
                    className="input w-full"
                    value={room.type}
                    onChange={(e) => handleRoomChange(idx, 'type', e.target.value)}
                    placeholder="Room Type"
                  />
                  <input
                    className="input w-full"
                    value={room.pricePerMonth}
                    onChange={(e) => handleRoomChange(idx, 'pricePerMonth', e.target.value)}
                    placeholder="Price/month"
                    type="number"
                  />
                  <input
                    className="input w-full"
                    value={room.capacity}
                    onChange={(e) => handleRoomChange(idx, 'capacity', e.target.value)}
                    placeholder="Capacity"
                    type="number"
                  />
                  <input
                    className="input w-full"
                    value={room.availableRooms}
                    onChange={(e) => handleRoomChange(idx, 'availableRooms', e.target.value)}
                    placeholder="Available Rooms"
                    type="number"
                  />
                </div>

                {form.roomTypes.length > 1 && (
                  <button
                    onClick={() => removeRoomType(idx)}
                    className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
                  >
                    Remove Room
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* FOOD MENU SECTION */}
          <div className="bg-[#2d2e2d] p-6 rounded-xl mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#AEA99E]">Weekly Food Menu</h2>
              <button 
                onClick={() => setIsEditingMenu(!isEditingMenu)}
                className="px-4 py-2 bg-linear-to-b from-[#8E744B] to-[#AEA99E] text-white rounded-lg hover:bg-[#7c7c77] cursor-pointer"
              >
                {isEditingMenu ? "Cancel Edit" : "Edit Menu"}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-white">
                <thead>
                  <tr className="border-b border-[#646460]">
                    <th className="py-2 px-4 text-left">Day</th>
                    <th className="py-2 px-4 text-left">Breakfast</th>
                    <th className="py-2 px-4 text-left">Lunch</th>
                    <th className="py-2 px-4 text-left">Dinner</th>
                  </tr>
                </thead>
                <tbody>
                  {form.foodMenu.map((day, idx) => (
                    <tr key={day.day} className="border-b border-[#646460]">
                      <td className="py-3 px-4 font-medium">{day.day}</td>
                      <td className="py-3 px-4">
                        {isEditingMenu ? (
                          <input
                            type="text"
                            className="input w-full"
                            value={day.breakfast}
                            onChange={(e) => handleFoodMenuChange(idx, 'breakfast', e.target.value)}
                            placeholder="Breakfast"
                          />
                        ) : (
                          <span>{day.breakfast || "Not specified"}</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {isEditingMenu ? (
                          <input
                            type="text"
                            className="input w-full"
                            value={day.lunch}
                            onChange={(e) => handleFoodMenuChange(idx, 'lunch', e.target.value)}
                            placeholder="Lunch"
                          />
                        ) : (
                          <span>{day.lunch || "Not specified"}</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {isEditingMenu ? (
                          <input
                            type="text"
                            className="input w-full"
                            value={day.dinner}
                            onChange={(e) => handleFoodMenuChange(idx, 'dinner', e.target.value)}
                            placeholder="Dinner"
                          />
                        ) : (
                          <span>{day.dinner || "Not specified"}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* AMENITIES & SERVICES SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* AMENITIES */}
            <div className="bg-[#2d2e2d] p-6 rounded-xl">
              <h2 className="text-xl font-bold mb-4 text-[#AEA99E]">Amenities</h2>
              <div className="grid grid-cols-2 gap-3">
                {amenities.map((a) => (
                  <label key={a._id} className="flex items-center gap-2 p-2 hover:bg-[#3d3e3d] rounded">
                    <input
                      type="checkbox"
                      checked={form.amenities.includes(a._id)}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          amenities: e.target.checked
                            ? [...prev.amenities, a._id]
                            : prev.amenities.filter((id) => id !== a._id),
                        }))
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-white">{a.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* SERVICES */}
            <div className="bg-[#2d2e2d] p-6 rounded-xl">
              <h2 className="text-xl font-bold mb-4 text-[#AEA99E]">Services</h2>
              <div className="grid grid-cols-2 gap-3">
                {services.map((s) => (
                  <label key={s._id} className="flex items-center gap-2 p-2 hover:bg-[#3d3e3d] rounded">
                    <input
                      type="checkbox"
                      checked={form.services.includes(s._id)}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          services: e.target.checked
                            ? [...prev.services, s._id]
                            : prev.services.filter((id) => id !== s._id),
                        }))
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-white">{s.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* MEDIA SECTION */}
          <div className="bg-[#2d2e2d] p-6 rounded-xl mb-8">
            {/* EXISTING IMAGES */}
            {form.oldImages.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-3 text-[#AEA99E]">Existing Images</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {form.oldImages.map((img, i) => (
                    <img
                      key={i}
                      src={`${process.env.NEXT_PUBLIC_API_URL}${img}`}
                      className="w-full h-32 object-cover rounded-lg"
                      alt={`Property ${i}`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* NEW IMAGES */}
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-3 text-[#AEA99E]">Add New Images</h3>
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                className="input w-full" 
                onChange={handleImageUpload} 
              />
              {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                  {images.map((img, i) => (
                    <img
                      key={i}
                      src={URL.createObjectURL(img)}
                      className="w-full h-32 object-cover rounded-lg"
                      alt={`New upload ${i}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* EXISTING VIDEOS */}
            {form.oldVideos.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-3 text-[#AEA99E]">Existing Videos</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {form.oldVideos.map((v, i) => (
                    <video
                      key={i}
                      src={`${process.env.NEXT_PUBLIC_API_URL}${v}`}
                      className="w-full rounded-lg"
                      controls
                    />
                  ))}
                </div>
              </div>
            )}

            {/* NEW VIDEOS */}
            <div>
              <h3 className="text-lg font-bold mb-3 text-[#AEA99E]">Add New Videos</h3>
              <input 
                type="file" 
                multiple 
                accept="video/*" 
                className="input w-full" 
                onChange={handleVideoUpload} 
              />
              {videos.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  {videos.map((v, i) => (
                    <video
                      key={i}
                      src={URL.createObjectURL(v)}
                      className="w-full rounded-lg"
                      controls
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            onClick={handleUpdate}
            className="w-full py-3 bg-linear-to-b from-[#8E744B] to-[#AEA99E] text-white text-lg font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            Update Property
          </button>
        </div>
      </div>
    </div>
  );
}