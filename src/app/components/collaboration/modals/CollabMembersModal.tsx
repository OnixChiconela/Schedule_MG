'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/app/themeContext';
import { useUser } from '@/app/context/UserContext';
import Avatar from '../../Avatar';
import { Partnership } from '../CollaborationCard';
import { Search, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { inviteMember } from '@/app/api/actions/collaboration/inviteMember';
import { getUsers } from '@/app/api/actions/user/getUsers';
import { Users } from '@/app/types';
import { io } from 'socket.io-client';
import { useNotifications } from '@/app/context/NotificationContext';

interface CollabMembersModalProps {
  partnership: Partnership;
  onClose: () => void;
}

const CollabMembersModal: React.FC<CollabMembersModalProps> = ({ partnership, onClose }) => {
  const { theme } = useTheme();
  const { currentUser } = useUser();
  const isOwner = partnership.ownerId === currentUser?.id;
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteUserId, setInviteUserId] = useState('');
  const [inviteRole, setInviteRole] = useState('COLABORATOR');
  const [searchQuery, setSearchQuery] = useState('');
  const [inviteSearchQuery, setInviteSearchQuery] = useState('');
  const [users, setUsers] = useState<Users[]>([]);
  const [suggestions, setSuggestions] = useState<Users[]>([]);
  const { notificationCount } = useNotifications();
  const [prevNotificationCount, setPrevNotificationCount] = useState(notificationCount);


  const members = partnership.members || [];
  const filteredMembers = members.filter((member) => {
    const fullName = `${member.user.firstName} ${member.user.lastName}`.toLowerCase();
    return (
      fullName.includes(searchQuery.toLowerCase()) ||
      member.user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  useEffect(() => {
    if (notificationCount > prevNotificationCount && !isOwner) {
      toast.success(`Received a new invitation to join ${partnership.name} as ${inviteRole}`);
    }
    setPrevNotificationCount(notificationCount);
  }, [notificationCount, prevNotificationCount, isOwner, partnership.name, inviteRole]);

  // useEffect(() => {
  //   if (!currentUser?.id) return;
  //   const token = localStorage.getItem('token'); // Adjust based on your auth
  //   const notificationSocket = io(`${process.env.NEXT_PUBLIC_WS}/notifications`, {
  //     withCredentials: true,
  //     query: { userId: currentUser.id, token },
  //     transports: ['websocket', 'polling'],
  //     reconnection: true,
  //     reconnectionAttempts: 3,
  //     reconnectionDelay: 1000,
  //   });

  //   notificationSocket.on('connect', () => {
  //     console.log('Connected to notifications WebSocket');
  //   });

  //   notificationSocket.on('inviteReceived', (invite) => {
  //     toast.success(`Invited to join ${invite.partnership.name} as ${invite.role}`);
  //   });

  //   notificationSocket.on('connect_error', (error) => {
  //     console.error('Notification socket connection error:', error);
  //   });

  //   return () => {
  //     notificationSocket.disconnect();
  //   };
  // }, [currentUser?.id]);

  // Fetch users for invite modal
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

  // Debounced search for invite modal
  useEffect(() => {
    const debounce = setTimeout(() => {
      if (inviteSearchQuery.length > 0 && users.length > 0) {
        const filtered = users
          .filter((user) => {
            const firstName = user.firstName || '';
            const lastName = user.lastName || '';
            const fullName = `${firstName} ${lastName}`.trim();
            return fullName.toLowerCase() === inviteSearchQuery.toLowerCase();
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
    setInviteSearchQuery(`${user.firstName || ''} ${user.lastName || ''}`.trim());
    setSuggestions([]);
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteUserId) {
      toast.error('Please select a user to invite.');
      return;
    }
    try {
      const user = users.find((u) => u.id === inviteUserId);
      if (!user) throw new Error('User not found.');
      // toast.success(user.email)
      await inviteMember(partnership.id, user.email, currentUser?.id || '', inviteRole);
      toast.success(`Invitation sent to ${user.email}`);
      setIsInviteModalOpen(false);
      setInviteUserId('');
      setInviteSearchQuery('');
      setInviteRole('COLABORATOR');
    } catch (error) {
      toast.error('Failed to send invitation');
      console.error('Invite error:', error);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`p-6 rounded-lg w-[800px] h-[600px] ${theme === 'light' ? 'bg-white text-gray-900' : 'bg-slate-800 text-neutral-200'
          } flex flex-col transition-all duration-300`}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Partnership members</h2>
          <button
            onClick={onClose}
            className={`p-1 rounded-lg ${theme === 'light' ? 'text-gray-600 hover:bg-gray-200' : 'text-neutral-200 hover:bg-slate-700'
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
              className={`w-full pl-10 pr-3 py-2 rounded-md border ${theme === 'light' ? 'border-gray-300 bg-white text-gray-900' : 'border-slate-600 bg-slate-700 text-neutral-200'
                }`}
            />
          </div>
        </div>

        {/* Member List */}
        <div className="flex-1 overflow-y-auto">
          {filteredMembers.length === 0 ? (
            <p className="text-center text-gray-500 mt-8">
              {searchQuery ? 'No members match your search.' : 'No members found.'}
            </p>
          ) : (
            <div className="space-y-3 pr-2">
              {filteredMembers.map((member) => (
                <div
                  key={member.user.id}
                  className={`flex items-center p-3 rounded-lg ${theme === 'light' ? 'bg-gray-50 hover:bg-gray-100' : 'bg-slate-700 hover:bg-slate-600'
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
                      disabled
                      className={`text-sm capitalize rounded-md border px-2 py-1 ${theme === 'light'
                        ? 'border-gray-300 bg-gray-200 text-gray-600'
                        : 'border-slate-600 bg-slate-700 text-neutral-400'
                        }`}
                    >
                      <option value="COLABORATOR">Colaborator</option>
                      <option value="ADMIN">Admin</option>
                      <option value="OWNER">Owner</option>
                    </select>
                    <button
                      disabled
                      className={`text-xs px-2 py-1 rounded-md ${theme === 'light' ? 'bg-red-200 text-red-600' : 'bg-red-900 text-red-300'
                        } opacity-50 cursor-not-allowed`}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Invite Section */}
        {isOwner && (
          <div
            className={`sticky bottom-0 mt-4 pt-4 border-t ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-slate-800 border-slate-600'
              }`}
          >
            <button
              className={`flex items-center px-3 py-1 rounded-lg ${theme === 'light' ? 'bg-fuchsia-600 text-white hover:bg-fuchsia-700' : 'bg-fuchsia-700 text-neutral-200 hover:bg-fuchsia-800'
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
          >
            <div
              className={`p-6 rounded-lg w-96 ${theme === 'light' ? 'bg-white text-gray-900' : 'bg-slate-800 text-neutral-200'
                }`}
            >
              <h2 className="text-lg font-semibold mb-4">Invite Member</h2>
              <form onSubmit={handleInviteSubmit}>
                <div className="mb-4">
                  <label htmlFor="user" className="block text-sm font-medium mb-1">
                    User
                  </label>
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      id="user"
                      type="text"
                      value={inviteSearchQuery}
                      onChange={(e) => {
                        setInviteSearchQuery(e.target.value);
                        setInviteUserId('');
                      }}
                      className={`w-full pl-10 pr-3 py-2 rounded-md border ${theme === 'light' ? 'border-gray-300 bg-white text-gray-900' : 'border-slate-600 bg-slate-700 text-neutral-200'
                        }`}
                      placeholder="Search by name..."
                    />
                    {suggestions.length > 0 && (
                      <div
                        className={`absolute w-full mt-1 rounded-lg shadow-lg z-10 ${theme === 'light' ? 'bg-white' : 'bg-slate-700'
                          } max-h-40 overflow-y-auto`}
                      >
                        {suggestions.map((user) => (
                          <div
                            key={user.id}
                            className={`p-2 cursor-pointer ${theme === 'light' ? 'hover:bg-neutral-100' : 'hover:bg-slate-600'
                              }`}
                            onClick={() => handleSelectUser(user)}
                          >
                            {`${user.firstName || ''} ${user.lastName || ''}`.trim()}
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
                    className={`w-full px-3 py-2 rounded-md border ${theme === 'light' ? 'border-gray-300 bg-white text-gray-900' : 'border-slate-600 bg-slate-700 text-neutral-200'
                      }`}
                  >
                    <option value="COLABORATOR">Colaborator</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsInviteModalOpen(false)}
                    className={`px-3 py-1 rounded-lg ${theme === 'light' ? 'bg-gray-200 text-gray-900' : 'bg-slate-600 text-neutral-200'
                      }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`px-3 py-1 rounded-lg ${theme === 'light' ? 'bg-neutral-900 text-white' : 'bg-black text-neutral-200'
                      }`}
                  >
                    Send Invite
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollabMembersModal;