'use client';

import Image from "next/image";
import { useRouter } from "next/navigation"


const Logo = () => {
    const router = useRouter();

    return (

        <div className="flex items-center">
            <Image
                onClick={() => router.push('/')}
                alt="Logo"
                className="hidden md:block cursor-pointer"
                height="55"
                width="55"
                src={require("@/../public/scheuor_logo.png")}
            />
        </div>

    )
}

export default Logo;