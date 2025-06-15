import { Users } from "@/app/types";

export const getAvatarFallback = (input: Users | string, userId?: string): string => {
  let name: string;
  if (typeof input === "string") {
    name = input.trim();
  } else {
    name = input ? `${input.firstName} ${input.lastName}`.trim() : `User ${userId || "Unknown"}`;
  }
  return name.charAt(0).toUpperCase() || "?";
};