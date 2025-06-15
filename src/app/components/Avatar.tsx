"use client"

import { useTheme } from "../themeContext"
import { getAvatarFallback } from "./avatarUtils"

interface AvatarProps {
    name: string
    visualType?: 'emoji' | 'initial'
    visualValue?: string
    imageUrl?: string
    size?: "small" | "medium" | "large"
}

const Avatar: React.FC<AvatarProps> = ({
    name,
    visualType,
    visualValue,
    imageUrl,
    size = "medium"
}) => {
    const { theme } = useTheme()

    const sizeStyles = {
        small: "w-6 h-6 text-sm",
        medium: "w-8 h-8 text-xl",
        large: "w-12 h-12 text-2xl",
    };

    const baseStyles = `rounded-full flex items-center justify-center font-semibold ${sizeStyles[size]}`

    if (imageUrl) {
        <img
            src={imageUrl}
            alt="Avatar"
            className={`${baseStyles} object-cover`}
        />
    }

    if (visualType === "emoji" && visualValue) {
        return (
            <span className={`${baseStyles} ${theme === "light" ? "text-gray-800" : "text-gray-100"}`}>
                {visualValue}
            </span>
        )
    }

    if (visualType === "initial" && visualValue) {
        return (
            <div
                className={`${baseStyles} text-white`}
                style={{ backgroundColor: visualValue }}
            >
                {getAvatarFallback(name)}
            </div>
        );
    }

    // Fallback: inicial com cor padrão
    return (
        <div
            className={`${baseStyles} text-white ${theme === "light" ? "bg-gray-500" : "bg-gray-600"
                }`}
        >
            {getAvatarFallback(name)}
        </div>
    );
}

export default Avatar