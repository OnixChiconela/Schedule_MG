"use client"

import { useTheme } from "@/app/themeContext";

interface Props {
    children: React.ReactNode
    className?: string
}

const Card: React.FC<Props> = ({ children, className }) => {
    const { theme } = useTheme();

    return (
        <div className={`
            ${theme === "light" ? 'bg-gray-100' : 'bg-slate-950/50'}
            rounded-lg 
            shadow-md 
            hover:shadow-lg 
            transition-shadow
            ${className}
            `}
        >
            {children}
        </div>
    )
}

export default Card