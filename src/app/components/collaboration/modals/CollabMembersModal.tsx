// 'use client';

// import { useState, useEffect } from 'react';
// import { useTheme } from '@/app/themeContext';
// import { useUser } from '@/app/context/UserContext';
// import Avatar from '../../Avatar';
// import { Partnership } from '../CollaborationCard';
// import { Search, Plus, X } from 'lucide-react';
// import toast from 'react-hot-toast';
// import { inviteMember } from '@/app/api/actions/collaboration/inviteMember';
// import { getUsers } from '@/app/api/actions/user/getUsers';
// import { Users } from '@/app/types';
// import { io } from 'socket.io-client';
// import { useNotifications } from '@/app/context/NotificationContext';
// import { removeMember } from '@/app/api/actions/collaboration/removeMember';
// import { updateMemberRole } from '@/app/api/actions/collaboration/updateRole';

// interface CollabMembersModalProps {
//   partnership: Partnership;
//   onClose: () => void;
// }

// const CollabMembersModal: React.FC<CollabMembersModalProps> = ({ partnership, onClose }) => {
//   const { theme } = useTheme();
//   const { currentUser } = useUser();
//   const isOwner = partnership.ownerId === currentUser?.id;
//   const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
//   const [inviteUserId, setInviteUserId] = useState('');
//   const [inviteRole, setInviteRole] = useState('COLABORATOR');
//   const [searchQuery, setSearchQuery] = useState('');
//   const [inviteSearchQuery, setInviteSearchQuery] = useState('');
//   const [users, setUsers] = useState<Users[]>([]);
//   const [suggestions, setSuggestions] = useState<Users[]>([]);
//   const { notificationCount } = useNotifications();
//   const [prevNotificationCount, setPrevNotificationCount] = useState(notificationCount);
//   const [filteredMembers, setFilteredMembers] = useState(partnership.members || [])

//   const members = partnership.members || [];
//   // const filteredMembers = members.filter((member) => {
//   //   const fullName = `${member.user.firstName} ${member.user.lastName}`.toLowerCase();
//   //   return (
//   //     fullName.includes(searchQuery.toLowerCase()) ||
//   //     member.user.email.toLowerCase().includes(searchQuery.toLowerCase())
//   //   );
//   // });

//   useEffect(() => {
//     if (notificationCount > prevNotificationCount && !isOwner) {
//       toast.success(`Received a new invitation to join ${partnership.name} as ${inviteRole}`);
//     }
//     setPrevNotificationCount(notificationCount);
//   }, [notificationCount, prevNotificationCount, isOwner, partnership.name, inviteRole]);

//   // Fetch users for invite modal
//   useEffect(() => {
//     const fetchUsers = async () => {
//       try {
//         const data = await getUsers();
//         setUsers(data || []);
//       } catch (error) {
//         console.error('Error fetching users:', error);
//         toast.error('Failed to load users.');
//       }
//     };
//     fetchUsers();
//   }, []);

//   // Debounced search for invite modal
//   useEffect(() => {
//     const debounce = setTimeout(() => {
//       if (inviteSearchQuery.length > 0 && users.length > 0) {
//         const filtered = users
//           .filter((user) => {
//             const firstName = user.firstName || '';
//             const lastName = user.lastName || '';
//             const fullName = `${firstName} ${lastName}`.trim();
//             return fullName.toLowerCase() === inviteSearchQuery.toLowerCase();
//           })
//           .filter((user) => !members.some((m) => m.userId === user.id) && user.id !== currentUser?.id)
//           .slice(0, 5);
//         setSuggestions(filtered);
//       } else {
//         setSuggestions([]);
//       }
//     }, 300);
//     return () => clearTimeout(debounce);
//   }, [inviteSearchQuery, users, members, currentUser?.id])

//   const handleUpdateRole = async (memberId: string, newRole: string) => {
//     if (!currentUser?.id) {
//       toast.error("You must be logged in to update a role")
//       return
//     }
//     try {
//       await updateMemberRole(partnership.id, memberId, currentUser?.id, newRole);
//       toast.success('Role updated successfully');
//       setFilteredMembers(
//         filteredMembers.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
//       );
//     } catch (error) {
//       toast.error('Failed to update role');
//       console.error('Role update error:', error);
//     }
//   };

//   const handleRemoveMember = async (memberId: string) => {
//     if (!confirm('Are you sure you want to remove this member?')) return;
//     if (!currentUser?.id) {
//       toast.error('You must be logged in to remove a member');
//       return;
//     }
//     try {
//       await removeMember(partnership.id, memberId, currentUser.id); // Usa currentUser.id diretamente, já validado
//       toast.success('Member removed successfully');
//       setFilteredMembers(filteredMembers.filter((m) => m.id !== memberId));
//     } catch (error) {
//       toast.error('Failed to remove member');
//       console.error('Remove member error:', error);
//     }
//   }

//   const handleSelectUser = (user: Users) => {
//     setInviteUserId(user.id);
//     setInviteSearchQuery(`${user.firstName || ''} ${user.lastName || ''}`.trim());
//     setSuggestions([]);
//   };

//   const handleInviteSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!inviteUserId) {
//       toast.error('Please select a user to invite.');
//       return;
//     }
//     try {
//       const user = users.find((u) => u.id === inviteUserId);
//       if (!user) throw new Error('User not found.');
//       // toast.success(user.email)
//       await inviteMember(partnership.id, user.email, currentUser?.id || '', inviteRole);
//       toast.success(`Invitation sent to ${user.email}`);
//       setIsInviteModalOpen(false);
//       setInviteUserId('');
//       setInviteSearchQuery('');
//       setInviteRole('COLABORATOR');
//     } catch (error) {
//       toast.error('Failed to send invitation');
//       console.error('Invite error:', error);
//     }
//   };

//   return (
//     <div
//       className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
//       onClick={(e) => {
//         if (e.target === e.currentTarget) onClose();
//       }}
//     >
//       <div
//         className={`p-6 rounded-lg w-[800px] h-[600px] ${theme === 'light' ? 'bg-white text-gray-900' : 'bg-slate-800 text-neutral-200'
//           } flex flex-col transition-all duration-300`}
//       >
//         {/* Header */}
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-lg font-semibold">Partnership members</h2>
//           <button
//             onClick={onClose}
//             className={`p-1 rounded-lg ${theme === 'light' ? 'text-gray-600 hover:bg-gray-200' : 'text-neutral-200 hover:bg-slate-700'
//               }`}
//           >
//             <X size={20} />
//           </button>
//         </div>

//         {/* Search */}
//         <div className="mb-4">
//           <div className="relative">
//             <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
//             <input
//               type="text"
//               placeholder="Search by name or email"
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className={`w-full pl-10 pr-3 py-2 rounded-md border ${theme === 'light' ? 'border-gray-300 bg-white text-gray-900' : 'border-slate-600 bg-slate-700 text-neutral-200'
//                 }`}
//             />
//           </div>
//         </div>

//         {/* Member List */}
//         <div className="flex-1 overflow-y-auto">
//           {filteredMembers.length === 0 ? (
//             <p className="text-center text-gray-500 mt-8">
//               {searchQuery ? 'No members match your search.' : 'No members found.'}
//             </p>
//           ) : (
//             <div className="space-y-3 pr-2">
//               {filteredMembers.map((member) => (
//                 <div
//                   key={member.user.id}
//                   className={`flex items-center p-3 rounded-lg ${theme === 'light' ? 'bg-gray-50 hover:bg-gray-100' : 'bg-slate-700 hover:bg-slate-600'
//                     } transition-colors duration-200`}
//                 >
//                   <Avatar
//                     name={`${member.user.firstName} ${member.user.lastName}`}
//                     size="small"
//                     visualType={member.user.visualType}
//                     visualValue={member.user.visualValue}
//                   />
//                   <div className="ml-3 flex-1">
//                     <p className="text-sm font-medium">{`${member.user.firstName} ${member.user.lastName}`}</p>
//                     <p className="text-xs text-gray-500">{member.user.email}</p>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <select
//                       value={member.role}
//                       disabled
//                       className={`text-sm capitalize rounded-md border px-2 py-1 ${theme === 'light'
//                         ? 'border-gray-300 bg-gray-200 text-gray-600'
//                         : 'border-slate-600 bg-slate-700 text-neutral-400'
//                         }`}
//                     >
//                       <option value="COLABORATOR">Colaborator</option>
//                       <option value="GUEST">Guest</option>
//                       <option value="ADMIN">Admin</option>
//                       <option value="OWNER">Owner</option>
//                     </select>
//                     <button
//                       disabled
//                       className={`text-xs px-2 py-1 rounded-md ${theme === 'light' ? 'bg-red-200 text-red-600' : 'bg-red-900 text-red-300'
//                         } opacity-50 cursor-not-allowed`}
//                     >
//                       Remove
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Invite Section */}
//         {isOwner && (
//           <div
//             className={`sticky bottom-0 mt-4 pt-4 border-t ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-slate-800 border-slate-600'
//               }`}
//           >
//             <button
//               className={`flex items-center px-3 py-1 rounded-lg ${theme === 'light' ? 'bg-fuchsia-600 text-white hover:bg-fuchsia-700' : 'bg-fuchsia-700 text-neutral-200 hover:bg-fuchsia-800'
//                 } transition-colors duration-200`}
//               onClick={() => setIsInviteModalOpen(true)}
//             >
//               <Plus size={16} className="mr-1" />
//               Invite Member
//             </button>
//           </div>
//         )}

//         {/* Invite Modal */}
//         {isInviteModalOpen && (
//           <div
//             className="fixed inset-0 flex items-center justify-center bg-black/50 z-60"
//             onClick={(e) => {
//               if (e.target === e.currentTarget) setIsInviteModalOpen(false);
//             }}
//           >
//             <div
//               className={`p-6 rounded-lg w-96 ${theme === 'light' ? 'bg-white text-gray-900' : 'bg-slate-800 text-neutral-200'
//                 }`}
//             >
//               <h2 className="text-lg font-semibold mb-4">Invite Member</h2>
//               <form onSubmit={handleInviteSubmit}>
//                 <div className="mb-4">
//                   <label htmlFor="user" className="block text-sm font-medium mb-1">
//                     User
//                   </label>
//                   <div className="relative">
//                     <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
//                     <input
//                       id="user"
//                       type="text"
//                       value={inviteSearchQuery}
//                       onChange={(e) => {
//                         setInviteSearchQuery(e.target.value);
//                         setInviteUserId('');
//                       }}
//                       className={`w-full pl-10 pr-3 py-2 rounded-md border ${theme === 'light' ? 'border-gray-300 bg-white text-gray-900' : 'border-slate-600 bg-slate-700 text-neutral-200'
//                         }`}
//                       placeholder="Search by name..."
//                     />
//                     {suggestions.length > 0 && (
//                       <div
//                         className={`absolute w-full mt-1 rounded-lg shadow-lg z-10 ${theme === 'light' ? 'bg-white' : 'bg-slate-700'
//                           } max-h-40 overflow-y-auto`}
//                       >
//                         {suggestions.map((user) => (
//                           <div
//                             key={user.id}
//                             className={`p-2 cursor-pointer ${theme === 'light' ? 'hover:bg-neutral-100' : 'hover:bg-slate-600'
//                               }`}
//                             onClick={() => handleSelectUser(user)}
//                           >
//                             {`${user.firstName || ''} ${user.lastName || ''}`.trim()}
//                           </div>
//                         ))}
//                       </div>
//                     )}
//                   </div>
//                 </div>
//                 <div className="mb-4">
//                   <label htmlFor="role" className="block text-sm font-medium mb-1">
//                     Role
//                   </label>
//                   <select
//                     id="role"
//                     value={inviteRole}
//                     onChange={(e) => setInviteRole(e.target.value)}
//                     className={`w-full px-3 py-2 rounded-md border ${theme === 'light' ? 'border-gray-300 bg-white text-gray-900' : 'border-slate-600 bg-slate-700 text-neutral-200'
//                       }`}
//                   >
//                     <option value="COLABORATOR">Colaborator</option>
//                     <option value="ADMIN">Admin</option>
//                     <option value="GUEST">Guest</option>
//                   </select>
//                 </div>
//                 <div className="flex justify-end gap-2">
//                   <button
//                     type="button"
//                     onClick={() => setIsInviteModalOpen(false)}
//                     className={`px-3 py-1 rounded-lg ${theme === 'light' ? 'bg-gray-200 text-gray-900' : 'bg-slate-600 text-neutral-200'
//                       }`}
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     type="submit"
//                     className={`px-3 py-1 rounded-lg ${theme === 'light' ? 'bg-neutral-900 text-white' : 'bg-black text-neutral-200'
//                       }`}
//                   >
//                     Send Invite
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default CollabMembersModal;
"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "@/app/themeContext";
import { useUser } from "@/app/context/UserContext";
import Avatar from "../../Avatar";
import { Partnership } from "../CollaborationCard";
import { Search, Plus, X, Copy, Share2 } from "lucide-react";
import toast from "react-hot-toast";
import { inviteMember } from "@/app/api/actions/collaboration/inviteMember";
import { inviteByEmail } from "@/app/api/actions/collaboration/inviteByEmail";
import { getUsers } from "@/app/api/actions/user/getUsers";
import { Users } from "@/app/types";
import { useNotifications } from "@/app/context/NotificationContext";
import { getCollabMembers } from "@/app/api/actions/collaboration/getCollabMembers";

interface CollabMembersModalProps {
  partnership: Partnership;
  onClose: () => void;
}

const CollabMembersModal: React.FC<CollabMembersModalProps> = ({ partnership, onClose }) => {
  const { theme } = useTheme();
  const { currentUser } = useUser();
  const isOwner = partnership.ownerId === currentUser?.id;
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isEmailInviteMode, setIsEmailInviteMode] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const [inviteUserId, setInviteUserId] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("COLLABORATOR");
  const [searchQuery, setSearchQuery] = useState("");
  const [inviteSearchQuery, setInviteSearchQuery] = useState("");
  const [users, setUsers] = useState<Users[]>([]);
  const [suggestions, setSuggestions] = useState<Users[]>([]);
  const [filteredMembers, setFilteredMembers] = useState(partnership.members || []);
  const { notificationCount, partnershipUpdateSocket, joinPartnership } = useNotifications();
  const [prevNotificationCount, setPrevNotificationCount] = useState(notificationCount);
  const hasJoinedPartnership = useRef(false);

  useEffect(() => {
    if (partnershipUpdateSocket) {
      joinPartnership(partnership.id);

      partnershipUpdateSocket.on('memberRemoved', (data) => {
        if (data.partnershipId === partnership.id) {
          setFilteredMembers((prev) => prev.filter((m) => m.id !== data.memberId));
          toast.success('Member removed');
        }
      });

      partnershipUpdateSocket.on('roleUpdated', (data) => {
        if (data.partnershipId === partnership.id) {
          setFilteredMembers((prev) =>
            prev.map((m) => (m.id === data.memberId ? { ...m, role: data.newRole } : m))
          );
          toast.success('Role updated');
        }
      });

      return () => {
        partnershipUpdateSocket.off('memberRemoved');
        partnershipUpdateSocket.off('roleUpdated');
      };
    }
  }, [partnership.id, partnershipUpdateSocket]);

  useEffect(() => {
    if (notificationCount > prevNotificationCount && !isOwner) {
      toast.success(`Received a new invitation to join ${partnership.name} as ${inviteRole}`);
    }
    setPrevNotificationCount(notificationCount);
  }, [notificationCount, prevNotificationCount, isOwner, partnership.name, inviteRole]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getUsers();
        setUsers(data || []);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Failed to load users.");
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (inviteSearchQuery.length > 0 && users.length > 0 && !isEmailInviteMode) {
        const filtered = users
          .filter((user) => {
            const firstName = user.firstName || "";
            const lastName = user.lastName || "";
            const fullName = `${firstName} ${lastName}`.trim();
            return fullName.toLowerCase().includes(inviteSearchQuery.toLowerCase());
          })
          .filter((user) => !partnership.members?.some((m) => m.userId === user.id) && user.id !== currentUser?.id)
          .slice(0, 5);
        setSuggestions(filtered);
      } else {
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(debounce);
  }, [inviteSearchQuery, users, partnership.members, currentUser?.id, isEmailInviteMode]);

  const handleUpdateRole = async (memberId: string, newRole: string) => {
    if (!currentUser?.id || !partnershipUpdateSocket) {
      toast.error("You must be logged in to update a role or connection failed");
      return;
    }
    try {
      partnershipUpdateSocket.emit('updateMemberRole', {
        partnershipId: partnership.id,
        memberId,
        userId: currentUser.id,
        newRole,
      });
      toast.success("Role update requested");
    } catch (error) {
      toast.error("Failed to update role");
      console.error("Role update error:", error);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return;
    if (!currentUser?.id || !partnershipUpdateSocket) {
      toast.error("You must be logged in to remove a member or connection failed");
      return;
    }
    try {
      partnershipUpdateSocket.emit('removeMember', {
        partnershipId: partnership.id,
        memberId,
        userId: currentUser.id,
      });
      toast.success("Member removal requested");
    } catch (error) {
      toast.error("Failed to remove member");
      console.error("Remove member error:", error);
    }
  };

  useEffect(() => {
    let isMounted = true;

    if (!partnershipUpdateSocket || !currentUser || !isMounted || !partnership) return;

    const handleMemberRemoved = (data: { partnershipId: string; memberId: string }) => {
      if (isMounted && data.partnershipId === partnership.id) {
        setFilteredMembers((prev) => prev.filter((m) => m.id !== data.memberId));
        toast.success('Member removed');
      }
    };

    const handleRoleUpdated = (data: { partnershipId: string; memberId: string; newRole: string }) => {
      if (isMounted && data.partnershipId === partnership.id) {
        setFilteredMembers((prev) =>
          prev.map((m) => (m.id === data.memberId ? { ...m, role: data.newRole } : m))
        );
        toast.success('Role updated');
      }
    };

    partnershipUpdateSocket.on('memberRemoved', handleMemberRemoved);
    partnershipUpdateSocket.on('roleUpdated', handleRoleUpdated);
    partnershipUpdateSocket.on('connect_error', (err) => {
      if (isMounted) {
        toast.error("Failed to connect to partnership updates", { duration: 3000 });
        console.error("WebSocket connection error:", err.message);
      }
    });

    return () => {
      isMounted = false;
      partnershipUpdateSocket.off('memberRemoved', handleMemberRemoved);
      partnershipUpdateSocket.off('roleUpdated', handleRoleUpdated);
      partnershipUpdateSocket.off('connect_error');
    };
  }, [partnership, partnershipUpdateSocket, currentUser?.id]);

  const handleSelectUser = (user: Users) => {
    setInviteUserId(user.id);
    setInviteSearchQuery(`${user.firstName || ""} ${user.lastName || ""}`.trim());
    setSuggestions([]);
    setIsEmailInviteMode(false);
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEmailInviteMode) {
      if (!inviteEmail) {
        toast.error("Please enter an email address.");
        return;
      }
      try {
        const response = await inviteByEmail(partnership.id, inviteEmail, currentUser?.id || "", inviteRole);
        if (!response.inviteLink) {
          throw new Error("Invite link not returned from server");
        }
        console.log("Opening share modal with link:", response.inviteLink);
        setInviteLink(response.inviteLink);
        setIsShareModalOpen(true);
        setIsInviteModalOpen(false);
        setInviteEmail("");
        setInviteSearchQuery("");
        setInviteRole("COLLABORATOR");
        setIsEmailInviteMode(false);
        // Copiar automaticamente para a área de transferência
        navigator.clipboard.writeText(response.inviteLink).then(() => {
          toast.success("Invite link generated and copied to clipboard!", { duration: 5000 });
        }).catch(() => {
          toast.error("Failed to copy link automatically");
        });
      } catch (error: any) {
        const errorMessage = error.message || "Unknown error";
        toast.error(`Failed to generate invite link: ${errorMessage}`);
        console.error("Invite by email error:", error);
      }
    } else {
      if (!inviteUserId) {
        toast.error("Please select a user to invite.");
        return;
      }
      try {
        const user = users.find((u) => u.id === inviteUserId);
        if (!user) throw new Error("User not found.");
        await inviteMember(partnership.id, user.email, currentUser?.id || "", inviteRole);
        toast.success(`Invitation sent to ${user.email}`);
        setIsInviteModalOpen(false);
        setInviteUserId("");
        setInviteSearchQuery("");
        setInviteRole("COLLABORATOR");
      } catch (error) {
        toast.error("Failed to send invitation");
        console.error("Invite error:", error);
      }
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink).then(() => {
      toast.success("Invite link copied to clipboard!");
    }).catch(() => {
      toast.error("Oops, failed to copy link");
    });
  };

  const handleShareLink = () => {
    if ('share' in navigator && typeof navigator.share === 'function') {
      navigator.share({
        title: `Invite to ${partnership.name}`,
        text: `Join my partnership on ${partnership.name}!`,
        url: inviteLink,
      }).catch((error) => {
        console.error("Share error:", error);
        toast.error("Oops, failed to share link");
      });
    } else {
      toast.error("Sharing not supported on this device");
    }
  };

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const data = await getCollabMembers(partnership.id);
        setFilteredMembers(data || []);
      } catch (error) {
        console.error("Error fetching members", error);
        toast.error("Failed to load members");
      }
    };
    fetchMembers();
  }, [partnership.id, partnership]);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
      }}
    >
      <div
        className={`p-6 rounded-lg w-[800px] h-[600px] ${theme === "light"
          ? "bg-white text-gray-900"
          : "bg-slate-800 text-neutral-200"
          } flex flex-col transition-all duration-300`}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Partnership members</h2>
          <button
            onClick={onClose}
            className={`p-1 rounded-lg ${theme === "light"
              ? "text-gray-600 hover:bg-gray-200"
              : "text-neutral-200 hover:bg-slate-700"
              }`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search by name or email"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-3 py-2 rounded-md border ${theme === "light"
                ? "border-gray-300 bg-white text-gray-900"
                : "border-slate-600 bg-slate-700 text-neutral-200"
                }`}
            />
          </div>
        </div>

        {/* Member List */}
        <div className="flex-1 overflow-y-auto">
          {filteredMembers.length === 0 ? (
            <p className="text-center text-gray-500 mt-8">
              {searchQuery ? "No members match your search." : "No members found."}
            </p>
          ) : (
            <div className="space-y-3 pr-2">
              {filteredMembers.map((member) => {
                const isEditable = isOwner || (currentUser?.id && ["ADMIN"].includes(member.role) && member.userId !== currentUser.id);
                return (
                  <div
                    key={member.user.id}
                    className={`flex items-center p-3 rounded-lg ${theme === "light"
                      ? "bg-gray-50 hover:bg-gray-100"
                      : "bg-slate-700 hover:bg-slate-600"
                      } transition-colors duration-200`}
                  >
                    <Avatar
                      name={`${member.user.firstName} ${member.user.lastName}`}
                      size="small"
                      visualType={member.user.visualType}
                      visualValue={member.user.visualValue}
                    />
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium">{`${member.user.firstName} ${member.user.lastName}`}</p>
                      <p className="text-xs text-gray-500">{member.user.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={member.role}
                        onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                        disabled={!isEditable}
                        className={`text-sm capitalize rounded-md border px-2 py-1 ${theme === "light"
                          ? isEditable
                            ? "border-gray-300 bg-white text-gray-900"
                            : "border-gray-300 bg-gray-200 text-gray-600"
                          : isEditable
                            ? "border-slate-600 bg-slate-700 text-neutral-200"
                            : "border-slate-600 bg-slate-700 text-neutral-400"
                          }`}
                      >
                        <option value="COLLABORATOR">Collaborator</option>
                        <option value="GUEST">Guest</option>
                        <option value="ADMIN">Admin</option>
                        {isOwner && <option value="OWNER">Owner</option>}
                      </select>
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        disabled={!isEditable || member.userId === currentUser?.id}
                        className={`text-xs px-2 py-1 rounded-md ${theme === "light"
                          ? "bg-red-200 text-red-600 hover:bg-red-300"
                          : "bg-red-900 text-red-300 hover:bg-red-800"
                          } ${!isEditable || member.userId === currentUser?.id ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Invite Section */}
        {isOwner && (
          <div
            className={`sticky bottom-0 mt-4 pt-4 border-t ${theme === "light"
              ? "bg-white border-gray-200"
              : "bg-slate-800 border-slate-600"
              }`}
          >
            <button
              className={`flex items-center px-3 py-1 rounded-lg ${theme === "light"
                ? "bg-fuchsia-600 text-white hover:bg-fuchsia-700"
                : "bg-fuchsia-700 text-neutral-200 hover:bg-fuchsia-800"
                } transition-colors duration-200`}
              onClick={() => setIsInviteModalOpen(true)}
            >
              <Plus size={16} className="mr-1" />
              Invite Member
            </button>
          </div>
        )}

        {/* Invite Modal */}
        {isInviteModalOpen && (
          <div
            className="fixed inset-0 flex items-center justify-center bg-black/50 z-60"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsInviteModalOpen(false);
            }}
            style={{
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
            }}
          >
            <div
              className={`p-6 rounded-lg w-96 ${theme === "light"
                ? "bg-white text-gray-900"
                : "bg-slate-800 text-neutral-200"
                }`}
            >
              <h2 className="text-lg font-semibold mb-4">Invite Member</h2>
              <form onSubmit={handleInviteSubmit}>
                <div className="mb-4">
                  <label htmlFor="user" className="block text-sm font-medium mb-1">
                    {isEmailInviteMode ? "Email" : "User name or email"}
                  </label>
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      id="user"
                      type={isEmailInviteMode ? "email" : "text"}
                      value={isEmailInviteMode ? inviteEmail : inviteSearchQuery}
                      onChange={(e) => {
                        if (isEmailInviteMode) {
                          setInviteEmail(e.target.value);
                        } else {
                          setInviteSearchQuery(e.target.value);
                          setInviteUserId("");
                        }
                      }}
                      className={`w-full pl-10 pr-3 py-2 rounded-md border ${theme === "light"
                        ? "border-gray-300 bg-white text-gray-900"
                        : "border-slate-600 bg-slate-700 text-neutral-200"
                        }`}
                      placeholder={isEmailInviteMode ? "Enter email address..." : "Search by name..."}
                    />
                    {!isEmailInviteMode && suggestions.length > 0 && (
                      <div
                        className={`absolute w-full mt-1 rounded-lg shadow-lg z-10 ${theme === "light"
                          ? "bg-white"
                          : "bg-slate-700"
                          } max-h-40 overflow-y-auto`}
                      >
                        {suggestions.map((user) => (
                          <div
                            key={user.id}
                            className={`p-2 cursor-pointer ${theme === "light"
                              ? "hover:bg-neutral-100"
                              : "hover:bg-slate-600"
                              }`}
                            onClick={() => handleSelectUser(user)}
                          >
                            {`${user.firstName || ""} ${user.lastName || ""}`.trim()}
                          </div>
                        ))}
                      </div>
                    )}
                    {!isEmailInviteMode && inviteSearchQuery && suggestions.length === 0 && (
                      <div className="absolute right-0 mt-[3.2px]">
                        <button
                          type="button"
                          onClick={() => {
                            setIsEmailInviteMode(true);
                            setInviteEmail(inviteSearchQuery);
                            setInviteSearchQuery("");
                          }}
                          className={`w-full px-3 py-1 bg-transparent border rounded-lg ${theme === "light"
                            ? "border-neutral-600 text-neutral-800 hover:border-neutral-700"
                            : "border-neutral-300 text-neutral-200 hover:border-neutral-200"
                            }`}
                        >
                          Invite by Email
                        </button>
                      </div>
                    )}
                    {isEmailInviteMode && (
                      <div className="absolute right-0 mt-[3.2px]">
                        <button
                          type="button"
                          onClick={() => {
                            setIsEmailInviteMode(false);
                            setInviteSearchQuery(inviteEmail);
                            setInviteEmail("");
                          }}
                          className={`w-full px-3 py-1 bg-transparent border rounded-lg ${theme === "light"
                            ? "border-neutral-600 text-neutral-800 hover:border-neutral-700"
                            : "border-neutral-300 text-neutral-200 hover:border-neutral-200"
                            }`}
                        >
                          Back to Search
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mb-4">
                  <label htmlFor="role" className="block text-sm font-medium mb-1">
                    Role
                  </label>
                  <select
                    id="role"
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className={`w-full px-3 py-2 rounded-md border ${theme === "light"
                      ? "border-gray-300 bg-white text-gray-900"
                      : "border-slate-600 bg-slate-700 text-neutral-200"
                      }`}
                  >
                    <option value="COLLABORATOR">Collaborator</option>
                    <option value="ADMIN">Admin</option>
                    <option value="GUEST">Guest</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsInviteModalOpen(false);
                      setIsEmailInviteMode(false);
                      setInviteEmail("");
                      setInviteSearchQuery("");
                      setInviteUserId("");
                      setInviteRole("COLLABORATOR");
                    }}
                    className={`px-3 py-1 rounded-lg ${theme === "light"
                      ? "bg-gray-200 text-gray-900"
                      : "bg-slate-600 text-neutral-200"
                      }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`px-3 py-1 rounded-lg ${theme === "light"
                      ? "bg-neutral-900 text-white"
                      : "bg-black text-neutral-200"
                      }`}
                  >
                    {isEmailInviteMode ? "Generate Invite Link" : "Send Invite"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Share Link Modal */}
        {isShareModalOpen && (
          <div
            className="fixed inset-0 flex items-center justify-center bg-black/50 z-70"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsShareModalOpen(false);
            }}
            style={{
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
            }}
            key={`share-modal-${inviteLink}`}
          >
            <div
              className={`p-6 rounded-lg w-96 ${theme === "light"
                ? "bg-white text-gray-900"
                : "bg-slate-800 text-neutral-200"
                }`}
            >
              <h2 className="text-lg font-semibold mb-4">Share Invite Link</h2>
              <p className="text-sm mb-2">Your invite link (copied to clipboard):</p>
              <p
                className={`w-full px-3 py-2 rounded-md border break-all ${theme === "light"
                  ? "border-neutral-300 bg-neutral-50 text-neutral-900"
                  : "border-neutral-800 bg-neutral-900/30 text-neutral-200"
                  }`}
              >
                {inviteLink}
              </p>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className={`px-3 py-1 rounded-lg flex items-center gap-1 ${theme === "light"
                    ? "bg-neutral-600 text-white hover:bg-neutral-700"
                    : "bg-neutral-800 text-neutral-200 hover:bg-neutral-900"
                    }`}
                >
                  <Copy size={16} />
                  Copy Link Again
                </button>
                {'share' in navigator && typeof navigator.share === 'function' && (
                  <button
                    type="button"
                    onClick={handleShareLink}
                    className={`px-3 py-1 rounded-lg flex items-center gap-1 ${theme === "light"
                      ? "bg-neutral-800 text-white hover:bg-neutral-900"
                      : "bg-neutral-900 text-neutral-200 hover:bg-black"
                      }`}
                  >
                    <Share2 size={16} />
                    Share
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsShareModalOpen(false)}
                  className={`px-3 py-1 rounded-lg ${theme === "light"
                    ? "bg-gray-200 text-gray-900"
                    : "bg-slate-600 text-neutral-200"
                    }`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollabMembersModal;