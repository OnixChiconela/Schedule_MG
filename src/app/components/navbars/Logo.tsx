'use client';

import Image from "next/image";
import { useRouter } from "next/navigation"
import React from "react";


interface LogoProps {
    height?: number
    width?: number
}

const Logo: React.FC<LogoProps> = ({
    height = 55,
    width = 55
}) => {
    const router = useRouter();

    return (

        <div className="flex items-center">
            <Image
                onClick={() => router.push('/')}
                alt="Logo"
                className="md:block cursor-pointer"
                height={height}
                width={width}
                src={require("@/../public/scheuor_logo.png")}
            />
        </div>

    )
}

export default Logo;