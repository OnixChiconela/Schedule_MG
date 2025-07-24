'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/app/themeContext';
import { useUser } from '@/app/context/UserContext';
import Avatar from '@/app/components/Avatar';
import { Partnership } from '@/app/components/collaboration/CollaborationCard';
import { Copy, Plus, Search, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { inviteMember } from '@/app/api/actions/collaboration/inviteMember';
import CollabMembersModal from './modals/CollabMembersModal';
import { Users } from '@/app/types';
import { getUsers } from '@/app/api/actions/user/getUsers';
import { inviteByEmail } from '@/app/api/actions/collaboration/inviteByEmail';

interface CollabMemberBarProps {
    partnership: Partnership;
}

const CollabMemberBar: React.FC<CollabMemberBarProps> = ({ partnership }) => {
    const { theme } = useTheme();
    const { currentUser } = useUser();
    const isOwner = partnership.ownerId === currentUser?.id;
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('COLLABORATOR');
    const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [inviteSearchQuery, setInviteSearchQuery] = useState('');
    const [users, setUsers] = useState<Users[]>([]);
    const [suggestions, setSuggestions] = useState<Users[]>([]);
    const [inviteUserId, setInviteUserId] = useState('');
    const [isEmailInviteMode, setIsEmailInviteMode] = useState(false);
    const [inviteLink, setInviteLink] = useState("");


    const members = partnership.members || [];
    const maxAvatars = 5;
    const extraMembers = members.length > maxAvatars ? members.length - maxAvatars : 0;

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await getUsers();
                setUsers(data || []);
            } catch (error) {
                console.error('Error fetching users:', error);
                toast.error('Failed to load users.');
            }
        };
        fetchUsers();
    }, []);

    useEffect(() => {
        const debounce = setTimeout(() => {
            if (inviteSearchQuery.length > 0 && users.length > 0) {
                const filtered = users
                    .filter((user) => {
                        const firstName = user.firstName || '';
                        const lastName = user.lastName || '';
                        const email = user.email || ''
                        const fullName = `${firstName} ${lastName}`.trim();
                        return fullName.toLowerCase() === inviteSearchQuery.toLowerCase() || email.toLowerCase() === inviteSearchQuery.toLowerCase();
                    })
                    .filter((user) => !members.some((m) => m.userId === user.id) && user.id !== currentUser?.id)
                    .slice(0, 5);
                setSuggestions(filtered);
            } else {
                setSuggestions([]);
            }
        }, 300);
        return () => clearTimeout(debounce);
    }, [inviteSearchQuery, users, members, currentUser?.id])

    const handleSelectUser = (user: Users) => {
        setInviteUserId(user.id);
        setInviteSearchQuery(`${user.firstName || ""} ${user.lastName || ""}`.trim());
        setSuggestions([]);
        setIsEmailInviteMode(false);
    };

    const handleInviteSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const toastId = toast.loading("Sending invite", {
            style: {
                background: theme === "light" ? "#fff" : "#1e293b",
                color: theme === "light" ? "#1f2937" : "#f4f4f6",
                border: `1px solid ${theme === "light" ? "#e5e7eb" : "#374151"}`,
            },
        });
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
                toast.dismiss(toastId);
                toast.error(`Failed to generate invite link: ${errorMessage}`);
                console.error("Invite by email error:", error);
            } finally {
                toast.dismiss(toastId)
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
                toast.dismiss(toastId)
                toast.error("Failed to send invitation");
                console.error("Invite error:", error);
            } finally {
                toast.dismiss(toastId)
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


    return (
        <>
            <div
                className={`sticky top-[calc(5rem+env(safe-area-inset-top,0px))] z-50 flex items-center px-4 py-0 ${theme === 'light' ? 'bg-transparent' : 'bg-transparent'
                    } cursor-pointer w-fit ml-auto`}
                onClick={() => setIsMembersModalOpen(true)}
            >
                <div className="flex -space-x-2">
                    {members.slice(0, maxAvatars).map((member, index) => (
                        <Avatar
                            key={member.user.id}
                            name={`${member.user.firstName} ${member.user.lastName}`}
                            size="small"
                            visualType={member.user.visualType}
                            visualValue={member.user.visualValue}
                        />
                    ))}
                    {extraMembers > 0 && (
                        <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${theme === 'light' ? 'bg-gray-300 text-gray-800' : 'bg-slate-600 text-white'
                                }`}
                            style={{ zIndex: 0 }}
                        >
                            +{extraMembers}
                        </div>
                    )}
                </div>
                {isOwner && (
                    <button
                        className={`ml-4 flex items-center px-3 py-1 rounded-lg ${theme === 'light' ? 'bg-neutral-800 text-white hover:bg-neutral-900' : 'bg-gray-700 text-neutral-200 hover:bg-gray-600'
                            }`}
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsInviteModalOpen(true);
                        }}
                    >
                        <Plus size={16} className="mr-1" />
                        Invite
                    </button>
                )}
            </div>

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
                            <div className="flex">
                                {!isEmailInviteMode && inviteSearchQuery && suggestions.length === 0 && (
                                    <div className=" right-0 mt-[3.2px]">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsEmailInviteMode(true);
                                                setInviteEmail(inviteSearchQuery);
                                                setInviteSearchQuery("");
                                            }}
                                            className={`w-full px-3 py-1 bg-transparent rounded-lg ${theme === "light"
                                                ? "border-neutral-600 text-neutral-800 hover:border-neutral-700"
                                                : "border-neutral-300 text-neutral-200 hover:border-neutral-200"
                                                }`}
                                        >
                                            <span>user isn't on Scheuor? </span><span className={`underline hover:cursor-pointer ${theme == "light" ? "" : ""}`}>create a link</span>
                                        </button>
                                    </div>
                                )}
                                {isEmailInviteMode && (
                                    <div className=" right-0 mt-[3.2px]">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsEmailInviteMode(false);
                                                setInviteSearchQuery(inviteEmail);
                                                setInviteEmail("");
                                            }}
                                            className={`w-full px-3 py-1 bg-transparent rounded-lg ${theme === "light"
                                                ? "border-neutral-600 text-neutral-800 hover:border-neutral-700"
                                                : "border-neutral-300 text-neutral-200 hover:border-neutral-200"
                                                }`}
                                        >
                                            <span className={`underline hover:cursor-pointer ${theme == "light" ? "" : ""}`}>Back to search</span>
                                        </button>
                                    </div>
                                )}
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

            {/* Members Modal */}
            {isMembersModalOpen && (
                <CollabMembersModal
                    partnership={partnership}
                    onClose={() => setIsMembersModalOpen(false)}
                />
            )}
        </>
    );
};

export default CollabMemberBar;