// /components/CreateTeamModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import sodium from 'libsodium-wrappers';
import { useTheme } from '@/app/themeContext';
import { Team } from './TeamCards';
import { User } from '@/app/types/back-front';
import { getUsers } from '@/app/api/actions/user/getUsers';
import { createTeam } from '@/app/api/actions/teams/createTeam';
import { getUserMasterKey } from '@/app/api/actions/user/getUserMasterkey';

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (newTeam: Team) => void;
  userId: string;
}

export default function CreateTeamModal({ isOpen, onClose, onCreate, userId }: CreateTeamModalProps) {
  const { theme } = useTheme();
  const [form, setForm] = useState({ name: '', description: '', members: [] as string[] });
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getUsers();
        console.log('Fetched users:', data);
        setUsers(data || []);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (searchQuery.length > 2 && users.length > 0) {
        const filtered = users
          .filter((user) => {
            const firstName = user.firstName || '';
            const lastName = user.lastName || '';
            const email = user.email || '';
            return (
              firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
              lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
              email.toLowerCase().includes(searchQuery.toLowerCase())
            );
          })
          .slice(0, 5);
        console.log('Suggestions:', filtered);
        setSuggestions(filtered);
      } else {
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, users]);

  const handleAddMember = (user: User) => {
    const fullName = `${user.firstName} ${user.lastName}`;
    if (!form.members.includes(fullName) && user.id !== userId) {
      setForm({
        ...form,
        members: [...form.members, fullName],
      });
      setSearchQuery('');
      setSuggestions([]);
    }
  };

  const handleRemoveMember = (memberToRemove: string) => {
    setForm({
      ...form,
      members: form.members.filter((m) => m !== memberToRemove),
    });
  };

  const handleCreate = async () => {
    if (!form.name) {
      setError('Team name is required.');
      return;
    }

    try {
      await sodium.ready;
      console.log('Sodium ready, proceeding with encryption');
      console.log('Form data before encryption:', form);

      // Obter a masterKey do owner
      const ownerMasterKey = await getUserMasterKey(userId);
      if (!ownerMasterKey) throw new Error('Failed to retrieve owner master key');
      const ownerMasterKeyBuffer = Buffer.from(ownerMasterKey, 'base64');

      // Gerar chave e nonces para a equipe
      const teamKey = sodium.randombytes_buf(sodium.crypto_secretbox_KEYBYTES);
      const nameNonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
      const descriptionNonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);

      // Criptografar nome e descrição com a teamKey
      const nameBuffer = Buffer.from(form.name, 'utf8');
      const encryptedName = Buffer.from(
        sodium.crypto_secretbox_easy(nameBuffer, nameNonce, teamKey)
      ).toString('base64');

      const descriptionBuffer = form.description ? Buffer.from(form.description, 'utf8') : Buffer.from('');
      const encryptedDescription = Buffer.from(
        sodium.crypto_secretbox_easy(descriptionBuffer, descriptionNonce, teamKey)
      ).toString('base64');

      // Gerar encryptedKeys para o owner e membros
      const encryptedKeys: Record<string, { encryptedKey: string; nonce: string }> = {};

      // Criptografar a teamKey para o owner
      const ownerKeyNonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
      const ownerEncryptedKey = sodium.crypto_secretbox_easy(teamKey, ownerKeyNonce, ownerMasterKeyBuffer);
      encryptedKeys[userId] = {
        encryptedKey: Buffer.from(ownerEncryptedKey).toString('base64'),
        nonce: Buffer.from(ownerKeyNonce).toString('base64'),
      };

      // Obter os userIds dos membros
      const memberIds = form.members
        .map((member) => {
          const matchedUser = users.find((user) =>
            `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase() === member.toLowerCase()
          );
          return matchedUser?.id || '';
        })
        .filter((id) => id && id !== userId);

      // Criptografar a teamKey para cada membro com sua própria masterKey
      for (const memberId of memberIds) {
        const memberMasterKey = await getUserMasterKey(memberId);
        if (!memberMasterKey) throw new Error(`Failed to retrieve master key for member ${memberId}`);
        const memberMasterKeyBuffer = Buffer.from(memberMasterKey, 'base64');

        const memberKeyNonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
        const memberEncryptedKey = sodium.crypto_secretbox_easy(teamKey, memberKeyNonce, memberMasterKeyBuffer);
        encryptedKeys[memberId] = {
          encryptedKey: Buffer.from(memberEncryptedKey).toString('base64'),
          nonce: Buffer.from(memberKeyNonce).toString('base64'),
        };
      }

      // Enviar os dados para o backend
      const data = {
        userId,
        encryptedName,
        encryptedDescription,
        encryptedKeys,
        nameNonce: Buffer.from(nameNonce).toString('base64'),
        descriptionNonce: Buffer.from(descriptionNonce).toString('base64'),
      };

      console.log('Team creation data:', data);

      const response = await createTeam(data);
      if (!response || !response.teamId) {
        throw new Error('Failed to create team: Invalid response from server');
      }

      const newTeam: Team = {
        id: response.teamId,
        encryptedName,
        description: encryptedDescription,
        encryptedKeys,
        role: 'OWNER',
        createdAt: new Date().toISOString(),
        nameNonce: data.nameNonce,
        descriptionNonce: data.descriptionNonce,
      };

      onCreate(newTeam);
      setForm({ name: '', description: '', members: [] });
      setSearchQuery('');
      onClose();
    } catch (error: any) {
      console.error('Error creating team:', error);
      setError(error.message || 'Failed to create team. Check console for details.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`p-6 rounded-lg w-full max-w-md ${theme === 'light' ? 'bg-white' : 'bg-slate-800'}`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-xl font-semibold ${theme === 'light' ? 'text-neutral-800' : 'text-neutral-200'}`}>
            Create New Team
          </h2>
          <button onClick={onClose}>
            <X size={24} className={theme === 'light' ? 'text-neutral-800' : 'text-neutral-200'} />
          </button>
        </div>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Team name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={`w-full p-2 rounded-lg ${theme === 'light'
              ? 'bg-neutral-100 text-neutral-700'
              : 'bg-slate-700 text-white'} focus:outline-none`}
            required
          />
          <input
            type="text"
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className={`w-full p-2 rounded-lg ${theme === 'light'
              ? 'bg-neutral-100 text-neutral-700'
              : 'bg-slate-700 text-white'} focus:outline-none`}
          />
          <div className="relative">
            <input
              type="text"
              placeholder="Search for a member..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full p-2 rounded-lg ${theme === 'light'
                ? 'bg-neutral-100 text-neutral-700'
                : 'bg-slate-700 text-white'} focus:outline-none`}
            />
            {suggestions.length > 0 && (
              <div className={`absolute top-full left-0 w-full mt-1 ${theme === 'light' ? 'bg-white' : 'bg-slate-700'} rounded-lg shadow-lg z-10`}>
                {suggestions.map((user) => (
                  <div
                    key={user.id || `suggestion-${Math.random()}`}
                    className={`p-2 cursor-pointer ${theme === 'light' ? 'hover:bg-neutral-100' : 'hover:bg-slate-600'}`}
                    onClick={() => handleAddMember(user)}
                  >
                    {`${user.firstName || ''} ${user.lastName || ''}`.trim()} ({user.email || 'No email'})
                  </div>
                ))}
              </div>
            )}
          </div>
          {form.members.length > 0 && (
            <div className="mt-2">
              <h3 className={`text-sm font-medium ${theme === 'light' ? 'text-neutral-800' : 'text-neutral-200'}`}>
                Selected Members:
              </h3>
              <ul className="mt-1">
                {form.members.map((member) => (
                  <li
                    key={member}
                    className={`flex justify-between items-center p-1 rounded ${theme === 'light' ? 'bg-neutral-100' : 'bg-slate-700'}`}
                  >
                    <span>{member}</span>
                    <button
                      onClick={() => handleRemoveMember(member)}
                      className={`p-1 rounded-full ${theme === 'light' ? 'hover:bg-neutral-200' : 'hover:bg-slate-600'}`}
                    >
                      <X size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCreate}
            className={`p-2 rounded-lg ${theme === 'light'
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-blue-600 text-white hover:bg-blue-700'}`}
          >
            Create Team
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}