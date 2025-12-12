"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import Navbar from "@/components/navbar";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useRouter } from "next/navigation";

interface Contact {
    _id: string;
    name: string;
    phone: string;
    message: string;
    propertyId: string;
    createdAt: string;
}

export default function AdminContactsPage() {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const { isLoggedIn, token } = useSelector((state: RootState) => state.user);
    const router = useRouter();

    useEffect(() => {
        if (!isLoggedIn) router.push("/");
    }, [isLoggedIn, router]);

    const fetchContacts = async () => {
        try {
            const res = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/api/contact`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            setContacts(res.data.data || []);
        } catch (err: any) {
            toast.error("Failed to load contacts");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this message?")) return;

        try {
            await axios.delete(
                `${process.env.NEXT_PUBLIC_API_URL}/api/contact/${id}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            toast.success("Message deleted");
            setContacts((prev) => prev.filter((c) => c._id !== id));
        } catch (err: any) {
            toast.error("Failed to delete message");
        }
    };

    useEffect(() => {
        fetchContacts();
    }, []);

    return (
        <div>
            <Navbar />

            <div className="p-6 max-w-7xl mx-auto">
                <h1 className="text-2xl md:text-3xl font-bold text-[#8E744B] mb-6">
                    Contact Messages
                </h1>

                {loading ? (
                    <p className="text-[#AEA99E]">Loading messages...</p>
                ) : contacts.length === 0 ? (
                    <p className="text-[#AEA99E]">No contact messages found.</p>
                ) : (
                    <div className="overflow-x-auto rounded-lg border border-[#1D1E1D]">
                        <table className="min-w-full bg-[#2C2D2A] text-[#AEA99E]">
                            <thead className="bg-[#1D1E1D] text-white">
                                <tr>
                                    <th className="p-4 text-left">Name</th>
                                    <th className="p-4 text-left">Phone</th>
                                    <th className="p-4 text-left">Message</th>
                                    <th className="p-4 text-left">Property</th>
                                    <th className="p-4 text-left">Date</th>
                                    <th className="p-4 text-left">Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {contacts.map((item) => (
                                    <tr
                                        key={item._id}
                                        className="border-b border-[#1D1E1D] hover:bg-[#3A3B36] transition"
                                    >
                                        <td className="p-4 capitalize">{item.name}</td>
                                        <td className="p-4">{item.phone}</td>
                                        <td className="p-4">{item.message}</td>

                                        {/* Clickable Property Link */}
                                        <td className="p-4 text-[#8E744B] font-semibold">
                                            <button
                                                onClick={() =>
                                                    router.push(`/properties/${item.propertyId}`)
                                                }
                                                className="hover:underline cursor-pointer"
                                            >
                                                View Property
                                            </button>
                                        </td>

                                        <td className="p-4">
                                            {new Date(item.createdAt).toLocaleDateString()}
                                        </td>

                                        <td className="p-4">
                                            <button
                                                onClick={() => handleDelete(item._id)}
                                                className="p-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition cursor-pointer"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
