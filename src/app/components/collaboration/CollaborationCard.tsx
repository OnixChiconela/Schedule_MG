"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useTheme } from "@/app/themeContext";
import { Trash } from "lucide-react";
import toast from "react-hot-toast";

export interface Partnership {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  role: "OWNER" | "ADMIN" | "COLABORATOR" | "GUEST";
  createdAt: string;
  updatedAt: string;
  status?: "pending" | "accepted";
}

interface CollaborationTeamCardsProps {
  partnerships: Partnership[];
  userId: string;
  theme: string;
}

export default function CollaborationTeamCards({
  partnerships,
  userId,
  theme,
}: CollaborationTeamCardsProps) {
  const router = useRouter();

  const handleNavigate = (partnershipId: string) => {
    router.push(`collaboration-space/collaboration/${partnershipId}`);
  };

  const handleAcceptInvite = async (partnershipId: string) => {
    try {
      const response = await fetch(`/api/partnerships/accept/${partnershipId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!response.ok) throw new Error("Failed to accept invite");
      toast.success("Invite accepted!");
      router.push(`/collaboration/${partnershipId}`);
    } catch (error) {
      console.error("Error accepting invite:", error);
      toast.error("Failed to accept invite.");
    }
  };

  const handleDeletePartnership = async (partnershipId: string) => {
    if (!confirm("Are you sure you want to delete this partnership?")) return;
    try {
      const response = await fetch(`/api/partnerships/${partnershipId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!response.ok) throw new Error("Failed to delete partnership");
      toast.success("Partnership deleted!");
      // Atualizar lista localmente
      window.location.reload(); // Alternativa: atualizar estado no CollaborationSpace
    } catch (error) {
      console.error("Error deleting partnership:", error);
      toast.error("Failed to delete partnership.");
    }
  };

  const cardVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95 },
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {partnerships.map((partnership) => (
        <motion.div
          key={partnership.id}
          className={`p-4 rounded-lg cursor-pointer relative ${
            theme === "light" ? "bg-neutral-100 text-neutral-800" : "bg-slate-800 text-white"
          }`}
          variants={cardVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <h3 className="text-lg font-semibold">{partnership.name}</h3>
          <p className="text-sm text-gray-500">{partnership.description || "No description"}</p>
          <p className="text-xs text-gray-400 mt-2">Role: {partnership.role}</p>
          {partnership.status === "pending" ? (
            <button
              onClick={() => handleAcceptInvite(partnership.id)}
              className={`mt-4 px-4 py-2 rounded ${
                theme === "light" ? "bg-fuchsia-500 text-white hover:bg-fuchsia-600" : "bg-fuchsia-600 text-white hover:bg-fuchsia-700"
              }`}
            >
              Accept Invite
            </button>
          ) : (
            <button
              onClick={() => handleNavigate(partnership.id)}
              className={`mt-4 px-4 py-2 rounded ${
                theme === "light" ? "bg-fuchsia-500 text-white hover:bg-fuchsia-600" : "bg-fuchsia-600 text-white hover:bg-fuchsia-700"
              }`}
            >
              Open
            </button>
          )}
          {partnership.role === "OWNER" && (
            <button
              onClick={() => handleDeletePartnership(partnership.id)}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-red-500 hover:text-white"
            >
              <Trash size={16} />
            </button>
          )}
        </motion.div>
      ))}
    </div>
  );
}