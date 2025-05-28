'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import sodium from 'libsodium-wrappers';
import { useTheme } from '@/app/themeContext';
import { getMasterKey } from '@/app/api/actions/user/getMasterKey';

export interface Team {
  id: string;
  encryptedName: string;

  encryptedKeys: Record<string, { encryptedKey: string; nonce: string }>;
  role: string;
  createdAt: string;
}

interface TeamCardsProps {
  teams: Team[];
  userId: string;
  theme: string;
  onSelectTeam: (team: Team) => void;
}

export default function TeamCards({ teams, userId, theme, onSelectTeam }: TeamCardsProps) {
  const [decryptedNames, setDecryptedNames] = useState<Record<string, string>>({});

  useEffect(() => {
    const decryptNames = async () => {
      await sodium.ready;
      const decrypted: Record<string, string> = {};

      try {
        // Substituir por senha real (e.g., via login ou prompt)
        const userPassword = 'testpassword'; // TODO: Obter a senha do usuário
        const userMasterKey = await getMasterKey(userId, userPassword);
        if (!userMasterKey) {
          throw new Error('Failed to retrieve master key');
        }

        for (const team of teams) {
          try {
            const userKeyEntry = team.encryptedKeys[userId]
            if (!userKeyEntry || !userKeyEntry.encryptedKey || !userKeyEntry.nonce) {
              throw new Error('Missing or invalid encrypted key or nonce')
            }

            const encryptedKeyBuffer = Buffer.from(userKeyEntry.encryptedKey, 'base64')
            const nonceBuffer = Buffer.from(userKeyEntry.nonce, 'base64')
            const masterKeyBuffer = Buffer.from(userMasterKey)

            const originalKey = sodium.crypto_secretbox_open_easy(
              encryptedKeyBuffer,
              nonceBuffer,
              masterKeyBuffer
            )
            if (originalKey.length !== sodium.crypto_secretbox_KEYBYTES) {
              throw new Error('Invalid key lenght after decryption')
            }

            //Decrypting teams nama by using original key
            const encryptedNameBuffer = Buffer.from(team.encryptedName, 'base64');
            const decryptedName = sodium.crypto_secretbox_open_easy(
              encryptedNameBuffer,
              nonceBuffer,
              originalKey
            )
            decrypted[team.id] = Buffer.from(decryptedName).toString()
          } catch (error: any) {
            console.error(`Error decrypting team ${team.id}:`, error.message);
            decrypted[team.id] = `Decrypted Error: ${team.encryptedName}`;
          }
        }
      } catch (error) {
        console.error('Error fetching master key:', error);
        teams.forEach((team) => {
          decrypted[team.id] = `Master Key Error: ${team.encryptedName}`;
        });
      }

      setDecryptedNames(decrypted);
    };

    const isValidBase64 = (str: string): boolean => {
      try {
        const base64Regex = /^[A-Za-z0-9+/=]+$/;
        return base64Regex.test(str) && (str.length % 4 === 0);
      } catch {
        return false;
      }
    };

    if (teams.length > 0) decryptNames();
  }, [teams, userId]);

  if (!teams.length) return <p className={theme === 'light' ? 'text-neutral-600' : 'text-neutral-400'}>No teams available.</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {teams.map((team) => (
        <motion.div
          key={team.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg shadow ${theme === 'light' ? 'bg-neutral-100 text-neutral-800' : 'bg-slate-700 text-neutral-200'} cursor-pointer hover:${theme === 'light' ? 'bg-neutral-200' : 'bg-slate-600'}`}
          onClick={() => onSelectTeam(team)}
        >
          <h3 className="text-lg font-semibold">{decryptedNames[team.id] || team.encryptedName}</h3>
          <p className="text-sm">Role: {team.role}</p>
          <p className="text-sm">Created: {new Date(team.createdAt).toLocaleDateString()}</p>
        </motion.div>
      ))}
    </div>
  );
}