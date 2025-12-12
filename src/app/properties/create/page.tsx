"use client";

import { useEffect, useState, ChangeEvent } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Navbar from "@/components/navbar";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { logoutUser } from "@/store/userSlice";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Amenity { _id: string; name: string }
interface Service { _id: string; name: string }

interface RoomType {
  type: string;
  pricePerMonth: string;
  capacity: string;
  availableRooms: string;
}

interface FoodMenuDay {
  day: string;
  breakfast: string;
  lunch: string;
  dinner: string;
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
  foodMenu: FoodMenuDay[];
  amenities: string[];
  services: string[];
  status: string;
}

export default function CreatePropertyPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { token, isLoggedIn } = useSelector((state: RootState) => state.user);

  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  const [images, setImages] = useState<File[]>([]);
  const [videos, setVideos] = useState<File[]>([]);
  const [showFoodMenu, setShowFoodMenu] = useState(false);

  const weekDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

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
    foodMenu: weekDays.map(day => ({
      day,
      breakfast: "",
      lunch: "",
      dinner: ""
    })),
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

  // Food menu updates
  const updateFoodMenu = (index: number, field: keyof FoodMenuDay, value: string) => {
    setForm((prev) => {
      const updated = [...prev.foodMenu];
      updated[index][field] = value;
      return { ...prev, foodMenu: updated };
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
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => { 
    if (e.target.files) { 
      setImages([...images, ...Array.from(e.target.files)]); 
    } 
  };

  const handleVideoUpload = (e: ChangeEvent<HTMLInputElement>) => { 
    if (e.target.files) { 
      setVideos([...videos, ...Array.from(e.target.files)]); 
    } 
  };

  // Submit form
  const createProperty = async () => {
    try {
      const fd = new FormData();

      // Basic fields
      fd.append("name", form.name);
      fd.append("description", form.description);
      fd.append("gender", form.gender);
      fd.append("propertyType", form.propertyType);
      fd.append("status", form.status);

      // Location
      Object.entries(form.location).forEach(([key, value]) => {
        fd.append(`location[${key}]`, value);
      });

      // Room Types
      form.roomTypes.forEach((room, i) => {
        Object.entries(room).forEach(([k, v]) => {
          fd.append(`roomTypes[${i}][${k}]`, v);
        });
      });

      // Food Menu (only if user wants to add it)
      if (showFoodMenu) {
        form.foodMenu.forEach((menu, i) => {
          fd.append(`foodMenu[${i}][day]`, menu.day);
          fd.append(`foodMenu[${i}][breakfast]`, menu.breakfast);
          fd.append(`foodMenu[${i}][lunch]`, menu.lunch);
          fd.append(`foodMenu[${i}][dinner]`, menu.dinner);
        });
      }

      // Amenities & Services
      form.amenities.forEach((id) => fd.append("amenities", id));
      form.services.forEach((id) => fd.append("services", id));

      // Media files
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
      const message = err.response?.data?.message;

      if (message === "Token expired") {
        dispatch(logoutUser());
        toast("Session expired. Please log in again.");
        return;
      }

      toast(message || "Failed to create property");
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
              <option value="unisex">Co-Ed</option>
            </select>

            <select className="input w-full" name="propertyType" onChange={handleInput}>
              <option value="pg">PG</option>
              <option value="hostel">Hostel</option>
              <option value="apartment">Apartment</option>
              <option value="studio">Studio</option>
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

          {/* FOOD MENU */}
          <div className="mt-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-title">Weekly Food Menu</h3>
              <button 
                type="button"
                onClick={() => setShowFoodMenu(!showFoodMenu)}
                className="px-4 py-2 bg-[#646460] text-white rounded-lg hover:bg-[#7c7c77] transition"
              >
                {showFoodMenu ? "Hide Menu" : "Add Food Menu"}
              </button>
            </div>

            {showFoodMenu && (
              <div className="bg-[#2a2b2a] p-4 rounded-lg border border-[#646460]">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#646460]">
                        <th className="py-2 px-3 text-left text-[#AEA99E]">Day</th>
                        <th className="py-2 px-3 text-left text-[#AEA99E]">Breakfast</th>
                        <th className="py-2 px-3 text-left text-[#AEA99E]">Lunch</th>
                        <th className="py-2 px-3 text-left text-[#AEA99E]">Dinner</th>
                      </tr>
                    </thead>
                    <tbody>
                      {form.foodMenu.map((day, i) => (
                        <tr key={day.day} className="border-b border-[#3d3e3d]">
                          <td className="py-3 px-3 text-white font-medium">{day.day}</td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              className="input w-full text-sm"
                              placeholder="Breakfast"
                              value={day.breakfast}
                              onChange={(e) => updateFoodMenu(i, 'breakfast', e.target.value)}
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              className="input w-full text-sm"
                              placeholder="Lunch"
                              value={day.lunch}
                              onChange={(e) => updateFoodMenu(i, 'lunch', e.target.value)}
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              className="input w-full text-sm"
                              placeholder="Dinner"
                              value={day.dinner}
                              onChange={(e) => updateFoodMenu(i, 'dinner', e.target.value)}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

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
                <span className="text-sm sm:text-base text-white">{a.name}</span>
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
                <span className="text-sm sm:text-base text-white">{s.name}</span>
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
                  alt={`Upload ${i}`}
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