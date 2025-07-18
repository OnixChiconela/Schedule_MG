"use client"
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/app/themeContext";
import { Partnership } from "./CollaborationCard";
import { Users } from "@/app/types";
import { getUsers } from "@/app/api/actions/user/getUsers";
import { createCollab } from "@/app/api/actions/collaboration/createCollab";
import { X } from "lucide-react";
import toast from "react-hot-toast";

interface CreatePartnershipModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (newPartnership: Partnership) => void;
    userId: string;
}

export default function CreatePartnershipModal({
    isOpen,
    onClose,
    onCreate,
    userId,
}: CreatePartnershipModalProps) {
    const { theme } = useTheme();
    const [form, setForm] = useState({ name: "", description: "", invitedUserIds: [] as string[] });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState<Users[]>([]);
    const [users, setUsers] = useState<Users[]>([]);

    // useEffect(() => {
    //     const fetchUsers = async () => {
    //         try {
    //             const data = await getUsers();
    //             setUsers(data || []);
    //         } catch (error) {
    //             console.error("Error fetching users:", error);
    //             toast.error("Failed to load users.");
    //         }
    //     };
    //     fetchUsers();
    // }, []);

    // useEffect(() => {
    //     const debounce = setTimeout(() => {
    //         if (searchQuery.length > 2 && users.length > 0) {
    //             const filtered = users
    //                 .filter((user) => {
    //                     const firstName = user.firstName || "";
    //                     const lastName = user.lastName || "";
    //                     const email = user.email || "";
    //                     return (
    //                         firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    //                         lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    //                         email.toLowerCase().includes(searchQuery.toLowerCase())
    //                     );
    //                 })
    //                 .slice(0, 5);
    //             setSuggestions(filtered);
    //         } else {
    //             setSuggestions([]);
    //         }
    //     }, 300);
    //     return () => clearTimeout(debounce);
    // }, [searchQuery, users]);

    // const handleAddInvitee = (user: Users) => {
    //     const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
    //     if (form.invitedUserIds.includes(user.id) || user.id === userId) {
    //         toast.error("User already invited or cannot invite yourself");
    //         return;
    //     }
    //     setForm({
    //         ...form,
    //         invitedUserIds: [...form.invitedUserIds, user.id],
    //     });
    //     setSearchQuery("");
    //     setSuggestions([]);
    // };

    // const handleRemoveInvitee = (userIdToRemove: string) => {
    //     setForm({
    //         ...form,
    //         invitedUserIds: form.invitedUserIds.filter((id) => id !== userIdToRemove),
    //     });
    // };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) {
            setError("Name is required");
            toast.error("Please enter a partnership name");
            return;
        }
        setLoading(true);
        const loadingToast = toast.loading("Creating partnership...");
        try {
            const data = {
                name: form.name,
                description: form.description,
            };
            const res = await createCollab(userId, data)
            if (!res) {
                throw new Error('Failed to create team: Invalid response from server');
            }
            const newPartnership: Partnership = {
                id: res.partnershipId,
                name: form.name,
                description: form.description,
                ownerId: userId,
                members: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            onCreate(newPartnership);
            setForm({ name: "", description: "", invitedUserIds: [] });
            setSearchQuery("");
            setError(null);
            toast.success("Partnership created successfully!", { id: loadingToast });
            onClose();
        } catch (err) {
            console.error("Error creating partnership:", err);
            setError("Failed to create partnership. Please try again.");
            toast.error("Failed to create partnership. Please try again.", { id: loadingToast });
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50"
            style={{
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
            }}
        >
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className={`relative p-6 rounded-lg w-full max-w-md ${theme === "light" ? "bg-white text-neutral-800" : "bg-slate-800 text-white"
                    }`}
                
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Create Partnership</h2>
                    <button onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>
                {error && <p className="text-red-500 mb-2">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block mb-1">Name</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => {
                                setForm({ ...form, name: e.target.value });
                                if (e.target.value.trim()) setError(null); // Limpar erro ao digitar
                            }}
                            className={`w-full p-2 rounded ${theme === "light" ? "bg-gray-100 text-neutral-800" : "bg-slate-700 text-white"
                                }`}
                            placeholder="Partnership name"
                            disabled={loading}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block mb-1">Description (optional)</label>
                        <textarea
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            className={`w-full p-2 rounded ${theme === "light" ? "bg-gray-100 text-neutral-800" : "bg-slate-700 text-white"
                                }`}
                            placeholder="Partnership description"
                            rows={4}
                            disabled={loading}
                        />
                    </div>
                    <div className="mb-4">
                        {/* <label className="block mb-1">Invite Members</label>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`w-full p-2 rounded ${theme === "light" ? "bg-gray-100 text-neutral-800" : "bg-slate-700 text-white"
                                }`}
                            placeholder="Search for a member..."
                            disabled={loading}
                        /> */}
                        {/* {suggestions.length > 0 && (
                            <div
                                className={`absolute w-full mt-1 rounded-lg shadow-lg z-10 ${theme === "light" ? "bg-white" : "bg-slate-700"
                                    }`}
                            >
                                {suggestions.map((user) => (
                                    <div
                                        key={user.id}
                                        className={`p-2 cursor-pointer ${theme === "light" ? "hover:bg-neutral-100" : "hover:bg-slate-600"
                                            }`}
                                        onClick={() => handleAddInvitee(user)}
                                    >
                                        {`${user.firstName || ""} ${user.lastName || ""}`.trim()} ({user.email || "No email"})
                                    </div>
                                ))}
                            </div>
                        )} */}
                    </div>
                    {/* {form.invitedUserIds.length > 0 && (
                        <div className="mb-4">
                            <h3 className="text-sm font-medium">Invited Members:</h3>
                            <ul className="mt-1">
                                {form.invitedUserIds.map((invitedId) => {
                                    const user = users.find((u) => u.id === invitedId);
                                    const fullName = user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "Unknown";
                                    return (
                                        <li
                                            key={invitedId}
                                            className={`flex justify-between items-center p-1 rounded ${theme === "light" ? "bg-neutral-100" : "bg-slate-700"
                                                }`}
                                        >
                                            <span>{fullName}</span>
                                            <button
                                                onClick={() => handleRemoveInvitee(invitedId)}
                                                className={`p-1 rounded-full ${theme === "light" ? "hover:bg-neutral-200" : "hover:bg-slate-600"
                                                    }`}
                                                disabled={loading}
                                            >
                                                <X size={16} />
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    )} */}
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className={`px-4 py-2 rounded ${theme === "light" ? "bg-gray-200 hover:bg-gray-300" : "bg-slate-600 hover:bg-slate-500"
                                }`}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-4 py-2 rounded ${theme === "light"
                                    ? "bg-fuchsia-500 text-white hover:bg-fuchsia-600"
                                    : "bg-fuchsia-600 text-white hover:bg-fuchsia-700"
                                } ${loading ? "opacity-50" : ""}`}
                        >
                            {loading ? "Creating..." : "Create"}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}