"use client";

import { useEffect, useState, ChangeEvent } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import Navbar from "@/components/navbar";

interface RoomType {
    type: string;
    pricePerMonth: string | number;
    capacity: string | number;
    availableRooms: string | number;
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
        amenities: [] as string[],
        services: [] as string[],
        status: "",
        oldImages: [] as string[],
        oldVideos: [] as string[],
    });

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

                setForm({
                    name: p.name,
                    description: p.description,
                    gender: p.gender,
                    propertyType: p.propertyType,
                    location: p.location,
                    roomTypes: p.roomTypes,
                    amenities: p.amenities.map((a: Amenity) => a._id),
                    services: p.services.map((s: Service) => s._id),
                    status: p.status,
                    oldImages: p.images,
                    oldVideos: p.videos,
                });

                setAmenities(amenityRes.data.data);
                setServices(serviceRes.data.data);
                setLoading(false);
            } catch (err) {
                toast.error("Failed to fetch property");
            }
        }

        loadAll();
    }, [id]);

    const handleInput = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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

            form.amenities.forEach((id) => fd.append("amenities", id));
            form.services.forEach((id) => fd.append("services", id));

            images.forEach((file) => fd.append("images", file));
            videos.forEach((file) => fd.append("videos", file));

            console.log("FormData contents:");
            for (let pair of fd.entries()) {
                console.log(pair[0] + ': ' + pair[1]);
            }

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
            toast.error(err.response?.data?.message || "Update failed");
        }
    };

    useEffect(() => {
        async function loadAll() {
            try {
                const [propertyRes, amenityRes, serviceRes] = await Promise.all([
                    axios.get(`${API}/api/properties/${id}`),
                    axios.get(`${API}/api/amenities`),
                    axios.get(`${API}/api/services`),
                ]);

            } catch (err) {
                toast.error("Failed to fetch property");
            }
        }
        loadAll();
    }, [id]);

    if (loading) return <p className="text-white p-10">Loading...</p>;
    console.log("FORM STATE:", form);

    return (
        <div className="bg-[#1D1D1E] min-h-screen">
            <Navbar />

            <div className="p-4 sm:p-6">
                <div className="max-w-5xl mx-auto bg-linear-to-b from-[#434440] to-[#2a2b2a] p-6 sm:p-8 rounded-2xl shadow-xl border border-[#646460]">

                    <h1 className="text-3xl sm:text-4xl font-bold text-center mb-8 text-[#AEA99E]">
                        Update Property
                    </h1>

                    {/* NAME */}
                    <input
                        name="name"
                        className="input w-full mb-4"
                        value={form.name}
                        onChange={handleInput}
                        placeholder="Property Name"
                    />

                    {/* DESCRIPTION */}
                    <textarea
                        name="description"
                        className="input w-full h-24 sm:h-28 mb-4"
                        value={form.description}
                        onChange={handleInput}
                        placeholder="Description"
                    />

                    {/* GENDER + PROPERTY TYPE */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <select name="gender" value={form.gender} onChange={handleInput} className="input w-full">
                            <option value="boys">Boys</option>
                            <option value="girls">Girls</option>
                            <option value="co-ed">Co-Ed</option>
                        </select>

                        <select name="propertyType" value={form.propertyType} onChange={handleInput} className="input w-full">
                            <option value="pg">PG</option>
                            <option value="flat">Flat</option>
                            <option value="hostel">Hostel</option>
                        </select>
                    </div>

                    {/* LOCATION */}
                    <h2 className="section-title mt-8">Location</h2>

                    {["city", "area", "address"].map((field) => (
                        <input
                            key={field}
                            name={`location.${field}`}
                            className="input w-full my-2"
                            value={(form.location as any)[field]}
                            onChange={handleInput}
                            placeholder={field.toUpperCase()}
                        />
                    ))}

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

                    {/* ROOM TYPES */}
                    <h2 className="section-title mt-10">Room Types</h2>

                    {form.roomTypes.map((room, idx) => (
                        <div className="room-box mt-3" key={idx}>
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-2">
                                {["type", "pricePerMonth", "capacity", "availableRooms"].map((key) => (
                                    <input
                                        key={key}
                                        className="input w-full"
                                        value={(room as any)[key]}
                                        onChange={(e) => handleRoomChange(idx, key as any, e.target.value)}
                                        placeholder={key}
                                    />
                                ))}
                            </div>

                            {form.roomTypes.length > 1 && (
                                <button
                                    onClick={() => removeRoomType(idx)}
                                    className="remove-btn w-full sm:w-auto"
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                    ))}

                    <button onClick={addRoomType} className="add-btn w-full sm:w-auto mt-4 mb-10">
                        + Add Room Type
                    </button>

                    {/* AMENITIES */}
                    <h2 className="section-title">Amenities</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                        {amenities.map((a) => (
                            <label key={a._id} className="checkbox-label flex items-center gap-2">
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
                                />
                                <span className="text-sm sm:text-base">{a.name}</span>
                            </label>
                        ))}
                    </div>

                    {/* SERVICES */}
                    <h2 className="section-title">Services</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                        {services.map((s) => (
                            <label key={s._id} className="checkbox-label flex items-center gap-2">
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
                                />
                                <span className="text-sm sm:text-base">{s.name}</span>
                            </label>
                        ))}
                    </div>

                    {/* EXISTING IMAGES */}
                    <h2 className="section-title">Existing Images</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                        {form.oldImages.map((img, i) => (
                            <img
                                key={i}
                                src={`${process.env.NEXT_PUBLIC_API_URL}${img}`}
                                className="w-full h-24 sm:h-28 rounded-lg object-cover"
                            />
                        ))}
                    </div>

                    {/* NEW IMAGES */}
                    <input type="file" multiple accept="image/*" className="input w-full" onChange={handleImageUpload} />

                    {images.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 mb-6">
                            {images.map((img, i) => (
                                <img
                                    key={i}
                                    src={URL.createObjectURL(img)}
                                    className="w-full h-24 sm:h-28 rounded-lg object-cover"
                                />
                            ))}
                        </div>
                    )}

                    {/* VIDEOS */}
                    <h2 className="section-title">Videos</h2>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                        {form.oldVideos.map((v, i) => (
                            <video
                                key={i}
                                src={`${process.env.NEXT_PUBLIC_API_URL}${v}`}
                                className="w-full h-24 sm:h-28 rounded-lg"
                                controls
                            />
                        ))}
                    </div>

                    <input type="file" multiple accept="video/*" className="input w-full" onChange={handleVideoUpload} />

                    {videos.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 mb-6">
                            {videos.map((v, i) => (
                                <video
                                    key={i}
                                    src={URL.createObjectURL(v)}
                                    className="w-full h-24 sm:h-28 rounded-lg"
                                    controls
                                />
                            ))}
                        </div>
                    )}

                    {/* SUBMIT BTN */}
                    <button onClick={handleUpdate} className="submit-btn w-full py-3 mt-6 text-lg">
                        Update Property
                    </button>
                </div>
            </div>
        </div>
    );

}
