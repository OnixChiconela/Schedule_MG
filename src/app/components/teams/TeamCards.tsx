'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import sodium from 'libsodium-wrappers';
import { useTheme } from '@/app/themeContext';
import { getMasterKey } from '@/app/api/actions/user/getMasterKey';

export interface Team {
  id: string;
  encryptedName: string;
  description: string; // Adicionar descrição criptografada
  encryptedKeys: Record<string, { encryptedKey: string; nonce: string }>;
  role: string;
  createdAt: string;
  nameNonce: string;
  descriptionNonce: string; // Adicionar descriptionNonce
}

interface TeamCardsProps {
  teams: Team[];
  userId: string;
  theme: string;
  onSelectTeam: (team: Team) => void;
}

export default function TeamCards({ teams, userId, theme, onSelectTeam }: TeamCardsProps) {
  const [decryptedNames, setDecryptedNames] = useState<Record<string, string>>({});
  const [decryptedDescriptions, setDecryptedDescriptions] = useState<Record<string, string>>({});

  useEffect(() => {
    const decryptData = async () => {
      await sodium.ready;
      const decryptedNames: Record<string, string> = {};
      const decryptedDescriptions: Record<string, string> = {};

      try {
        const userPassword = 'testpassword'; // TODO: Substituir por autenticação real
        const userMasterKey = await getMasterKey(userId, userPassword);
        if (!userMasterKey) {
          throw new Error('Failed to retrieve master key');
        }
        const masterKeyBuffer = Buffer.from(userMasterKey, 'base64');

        for (const team of teams) {
          try {
            const userKeyEntry = team.encryptedKeys[userId];
            if (
              !userKeyEntry ||
              !userKeyEntry.encryptedKey ||
              !userKeyEntry.nonce ||
              !team.nameNonce ||
              !team.descriptionNonce
            ) {
              throw new Error('Missing or invalid encrypted key, nonce, nameNonce, or descriptionNonce');
            }

            if (
              !isValidBase64(userKeyEntry.encryptedKey) ||
              !isValidBase64(userKeyEntry.nonce) ||
              !isValidBase64(team.nameNonce) ||
              !isValidBase64(team.descriptionNonce)
            ) {
              throw new Error('Invalid base64 format for encryptedKey, nonce, nameNonce, or descriptionNonce');
            }

            // Descriptografar a chave original
            const encryptedKeyBuffer = Buffer.from(userKeyEntry.encryptedKey, 'base64');
            const keyNonceBuffer = Buffer.from(userKeyEntry.nonce, 'base64');

            const originalKey = sodium.crypto_secretbox_open_easy(
              encryptedKeyBuffer,
              keyNonceBuffer,
              masterKeyBuffer
            );
            if (originalKey.length !== sodium.crypto_secretbox_KEYBYTES) {
              throw new Error(`Invalid key length after decryption: ${originalKey.length}, expected ${sodium.crypto_secretbox_KEYBYTES}`);
            }

            // Descriptografar o nome
            const encryptedNameBuffer = Buffer.from(team.encryptedName, 'base64');
            const nameNonceBuffer = Buffer.from(team.nameNonce, 'base64');
            const decryptedName = sodium.crypto_secretbox_open_easy(
              encryptedNameBuffer,
              nameNonceBuffer,
              originalKey
            );
            decryptedNames[team.id] = Buffer.from(decryptedName).toString('utf8');

            // Descriptografar a descrição (se existir)
            if (team.description) {
              const encryptedDescriptionBuffer = Buffer.from(team.description, 'base64');
              const descriptionNonceBuffer = Buffer.from(team.descriptionNonce, 'base64');
              const decryptedDescription = sodium.crypto_secretbox_open_easy(
                encryptedDescriptionBuffer,
                descriptionNonceBuffer,
                originalKey
              );
              decryptedDescriptions[team.id] = Buffer.from(decryptedDescription).toString('utf8');
            } else {
              decryptedDescriptions[team.id] = '';
            }
          } catch (error: any) {
            console.error(`Error decrypting team ${team.id}:`, error.message);
            decryptedNames[team.id] = `Decryption Error: ${team.encryptedName}`;
            decryptedDescriptions[team.id] = team.description ? `Decryption Error: ${team.description}` : '';
          }
        }
      } catch (error) {
        console.error('Error fetching master key or decrypting teams:', error);
        teams.forEach((team) => {
          decryptedNames[team.id] = `Master Key Error: ${team.encryptedName}`;
          decryptedDescriptions[team.id] = team.description ? `Master Key Error: ${team.description}` : '';
        });
      }

      setDecryptedNames(decryptedNames);
      setDecryptedDescriptions(decryptedDescriptions);
    };

    const isValidBase64 = (str: string): boolean => {
      try {
        return /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(str);
      } catch {
        return false;
      }
    };

    if (teams.length > 0) decryptData();
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
          {decryptedDescriptions[team.id] && (
            <p className="text-sm">Description: {decryptedDescriptions[team.id]}</p>
          )}
          <p className="text-sm">Role: {team.role}</p>
          <p className="text-sm">Created: {new Date(team.createdAt).toLocaleDateString()}</p>
        </motion.div>
      ))}
    </div>
  );
}