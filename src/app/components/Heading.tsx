'use client';

import { useTheme } from "../themeContext";

interface HeadingProps {
    title: string;
    subtitle?: string;
    center?: boolean;
}

const Heading: React.FC<HeadingProps> = ({
    title,
    subtitle,
    center
}) => {
    const {theme} = useTheme()
    return (
        <div className={center ? 'text-center' : 'text-start'}>
            <div className={`text-2xl font-bold ${theme == "light" ? "text-neutral-800" : "text-neutral-200"}`}>
                {title}
            </div>
            {subtitle && subtitle?.length > 0 && (
                <p className={`font-light mt-2 ${theme == "light" ? "text-neutral-500" : "text-neutral-400"}`}>
                    {subtitle}
                </p>
            )}
        </div>
    );
}

export default Heading;