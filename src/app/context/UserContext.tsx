"use client";

import { getUserWithToken } from "../api/actions/user/getuserWithToken";
import { User } from "../types/back-front";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface UserContextType {
  currentUser: User | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
  userLoading: boolean; // Adiciona o estado de userLoading
}

interface UserProviderProps {
  children: ReactNode;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userLoading, setLoading] = useState(true); // Renomeei para userLoading

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { user } = await getUserWithToken();
        setCurrentUser(user);
      } catch (error) {
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser, userLoading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }

  return context;
};