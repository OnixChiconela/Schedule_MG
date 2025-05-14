"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type SubfolderContextType = {
  activeTool: string;
  setActiveTool: (tool: string) => void;
};

const SubfolderContext = createContext<SubfolderContextType | undefined>(undefined);

export const SubfolderProvider = ({ children }: { children: ReactNode }) => {
  const [activeTool, setActiveTool] = useState("text");

  return (
    <SubfolderContext.Provider value={{ activeTool, setActiveTool }}>
      {children}
    </SubfolderContext.Provider>
  );
};

export const useSubfolderContext = () => {
  const context = useContext(SubfolderContext);
  if (!context) {
    throw new Error("useSubfolderContext must be used within a SubfolderProvider");
  }
  return context;
};

export default SubfolderContext;