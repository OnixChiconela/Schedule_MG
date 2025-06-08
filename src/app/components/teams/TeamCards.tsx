'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import sodium from 'libsodium-wrappers';
import { getTeamKey } from '@/app/api/actions/teams/getTeamKey';
import { getUserMasterKey } from '@/app/api/actions/user/getUserMasterkey';

export interface Team {
  id: string;
  encryptedName: string;
  description: string;
  encryptedKeys: Record<string, { encryptedKey: string; nonce: string }>;
  role: string;
  createdAt: string;
  nameNonce: string;
  descriptionNonce: string;
}

interface TeamCardsProps {
  teams: Team[];
  userId: string;
  theme: string;
}

export default function TeamCards({ teams, userId, theme }: TeamCardsProps) {
  const router = useRouter();
  const [decryptedNames, setDecryptedNames] = useState<Record<string, string>>({});
  const [decryptedDescriptions, setDecryptedDescriptions] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const decryptData = async () => {
      setIsLoading(true);
      try {
        await sodium.ready;

        // Obter a masterKey do backend (já descriptografada)
        const userMasterKey = await getUserMasterKey(userId);
        console.log("user master: ", userMasterKey)
        if (!userMasterKey || typeof userMasterKey !== 'string') {
          throw new Error('Invalid or missing master key: ' + (userMasterKey ? typeof userMasterKey : 'undefined'));
        }
        const masterKeyBuffer = Buffer.from(userMasterKey, 'base64');
        console.log("Master key buffer length:", masterKeyBuffer.length, "content (hex):", masterKeyBuffer.toString('hex'));

        const decryptedNamesTemp: Record<string, string> = {};
        const decryptedDescriptionsTemp: Record<string, string> = {};

        for (const team of teams) {
          try {
            const { encryptedKey, nonce } = await getTeamKey(team.id, userId);
            console.log('Fetched team key for userId', userId, ':', { encryptedKey, nonce });

            if (!isValidBase64(encryptedKey) || !isValidBase64(nonce)) {
              throw new Error('Invalid base64 format for encryptedKey or nonce');
            }

            const encryptedKeyBuffer = Buffer.from(encryptedKey, 'base64');
            console.log("Encrypted key buffer length:", encryptedKeyBuffer.length, "content (hex):", encryptedKeyBuffer.toString('hex'));

            const keyNonceBuffer = Buffer.from(nonce, 'base64');
            console.log("Nonce buffer length:", keyNonceBuffer.length, "content (hex):", keyNonceBuffer.toString('hex'));

            const originalKey = sodium.crypto_secretbox_open_easy(encryptedKeyBuffer, keyNonceBuffer, masterKeyBuffer);
            console.log('Decrypted original key:', Buffer.from(originalKey).toString('base64'));

            const encryptedNameBuffer = Buffer.from(team.encryptedName, 'base64');
            const nameNonceBuffer = Buffer.from(team.nameNonce, 'base64');
            const decryptedName = sodium.crypto_secretbox_open_easy(encryptedNameBuffer, nameNonceBuffer, originalKey);
            decryptedNamesTemp[team.id] = Buffer.from(decryptedName).toString('utf8');

            if (team.description) {
              const encryptedDescriptionBuffer = Buffer.from(team.description, 'base64');
              const descriptionNonceBuffer = Buffer.from(team.descriptionNonce, 'base64');
              const decryptedDescription = sodium.crypto_secretbox_open_easy(encryptedDescriptionBuffer, descriptionNonceBuffer, originalKey);
              decryptedDescriptionsTemp[team.id] = Buffer.from(decryptedDescription).toString('utf8');
            } else {
              decryptedDescriptionsTemp[team.id] = '';
            }
          } catch (error: any) {
            console.error(`Error decrypting team ${team.id}:`, error.message);
            decryptedNamesTemp[team.id] = `Decryption Error: ${team.encryptedName}`;
            decryptedDescriptionsTemp[team.id] = team.description ? `Decryption Error: ${team.description}` : '';
          }
        }

        setDecryptedNames(decryptedNamesTemp);
        setDecryptedDescriptions(decryptedDescriptionsTemp);
      } catch (error) {
        console.error('Error fetching master key or decrypting teams:', error);
        teams.forEach((team) => {
          setDecryptedNames((prev) => ({ ...prev, [team.id]: `Master Key Error: ${team.encryptedName}` }));
          setDecryptedDescriptions((prev) => ({
            ...prev,
            [team.id]: team.description ? `Master Key Error: ${team.description}` : '',
          }));
        });
      } finally {
        setIsLoading(false);
      }
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

  if (isLoading) return <p className={theme === 'light' ? 'text-neutral-600' : 'text-neutral-400'}>Loading teams...</p>;
  if (!teams.length) return <p className={theme === 'light' ? 'text-neutral-600' : 'text-neutral-400'}>No teams available.</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {teams.map((team) => (
        <motion.div
          key={team.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg shadow ${theme === 'light' ? 'bg-neutral-100 text-neutral-800' : 'bg-slate-700 text-neutral-200'} cursor-pointer hover:${theme === 'light' ? 'bg-neutral-200' : 'bg-slate-600'}`}
          onClick={() => router.push(`/team-space/team/${team.id}`)}
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