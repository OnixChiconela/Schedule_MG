"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useTheme } from "@/app/themeContext";
import { Trash } from "lucide-react";
import toast from "react-hot-toast";
import { PartnershipMembers, User } from "@/app/types/back-front";
import { useState, useEffect } from "react";
import { acceptInvite } from "@/app/api/actions/collaboration/acceptInvitation";

export interface Partnership {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  members: PartnershipMembers[] | undefined;
  createdAt: string;
  updatedAt: string;
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

  const [isModalOpen, setIsModalOpen] = useState<{ [key: string]: boolean }>({});

  const getMemberInfo = (partnership: Partnership) => {
    if (!partnership.members) {
      console.warn(`No members found for partnership ${partnership.id}`);
      return { status: "unknown", role: "GUEST", id: null };
    }
    const member = partnership.members.find((m) => m.userId === userId);
    return member || { status: "unknown", role: "GUEST", id: null };
  };

  const handleNavigate = (partnershipId: string) => {
    router.push(`/collaboration-space/collaboration/${partnershipId}`);
  };

  const handleCardClick = (e: React.MouseEvent, partnershipId: string, memberStatus: string) => {
    console.log(`Clicked partnership ${partnershipId} with status: ${memberStatus}`);
    if (memberStatus === "accepted") {
      handleNavigate(partnershipId);
    } else if (["invited", "pending"].includes(memberStatus)) {
      setIsModalOpen((prev) => ({ ...prev, [partnershipId]: true }));
    }
  };

  const handleAcceptInvite = async (partnershipId: string) => {
    try {
      const partnership = partnerships.find(p => p.id === partnershipId);
      if (!partnership) throw new Error("Partnership not found");
      const memberInfo = getMemberInfo(partnership);
      if (!memberInfo.id) throw new Error("Invite ID not found");
      toast.success(`userId: ${userId}`)
      await acceptInvite(memberInfo.id, userId);
      toast.success("Invite accepted!");
      setIsModalOpen((prev) => ({ ...prev, [partnershipId]: false }));
      router.push(`/collaboration/${partnershipId}`);
    } catch (error) {
      console.error("Error accepting invite:", error);
      toast.error("Failed to accept invite.");
    }
  };

  const handleDeclineInvite = (partnershipId: string) => {
    console.log(`Declining invite for partnership ${partnershipId}, setting isModalOpen to false`);
    setIsModalOpen((prev) => {
      const newState = { ...prev, [partnershipId]: false };
      console.log(`Updated isModalOpen:`, newState); // Depuração
      return newState;
    });
    toast.success("Invite declined!");
  };

  const handleDeletePartnership = async (partnershipId: string) => {
    try {
      const response = await fetch(`/api/partnerships/${partnershipId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!response.ok) throw new Error("Failed to delete partnership");
      toast.success("Partnership deleted!");
      window.location.reload();
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
      {partnerships.map((partnership) => {
        const memberInfo = getMemberInfo(partnership);
        toast.success(`${memberInfo.id}`)
        return (
          <motion.div
            key={partnership.id}
            className={`p-4 rounded-lg shadow-lg ${theme === "light" ? "bg-white text-neutral-800" : "bg-slate-800 text-white"} border border-gray-200 relative`}
            style={{ boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}
            variants={cardVariants}
            initial="initial"
            whileHover="hover"
            whileTap="tap"
            onClick={(e) => handleCardClick(e, partnership.id, memberInfo.status)}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="text-2xl">🤝</div>
              <div
                className="absolute top-2 right-2 w-1"
                style={{
                  height: "95%",
                  position: "absolute",
                  right: "2%",
                  borderRadius: "2px",
                }}
              />
            </div>
            <h3 className="text-lg font-semibold">{partnership.name}</h3>
            <p className="text-sm text-gray-500">{partnership.description || "No description"}</p>
            <p className="text-xs text-gray-400 mt-2">Role: {memberInfo.role}</p>

            {memberInfo.role === "OWNER" && (
              <button
                onClick={(e) => { e.stopPropagation(); handleDeletePartnership(partnership.id); }}
                className="absolute top-2 right-2 p-1 rounded-full hover:bg-red-500 hover:text-white"
              >
                <Trash size={16} />
              </button>
            )}
            {isModalOpen[partnership.id] && (
              <div
                key={`${partnership.id}-modal`} // Força re-renderização
                className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50"
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    setIsModalOpen((prev) => ({ ...prev, [partnership.id]: false }));
                  }
                }}
              >
                <div className={`p-6 w-86 rounded-lg ${theme === "light" ? "bg-white text-neutral-800" : "bg-slate-800 text-white"}`}>
                  <h3 className="text-lg font-semibold mb-4">Invite to {partnership.name}</h3>
                  <div className="flex gap-4">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleAcceptInvite(partnership.id); }}
                      className={`px-4 py-2 rounded ${theme === "light" ? "bg-fuchsia-500 text-white hover:bg-fuchsia-600" : "bg-fuchsia-600 text-white hover:bg-fuchsia-700"}`}
                    >
                      Accept
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeclineInvite(partnership.id); }}
                      className={`px-4 py-2 rounded ${theme === "light" ? "bg-gray-300 text-neutral-800 hover:bg-gray-400" : "bg-gray-700 text-white hover:bg-gray-600"}`}
                    >
                      Decline
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}