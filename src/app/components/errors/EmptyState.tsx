"use client"

import { useTheme } from "@/app/themeContext"
import Heading from "../Heading"
import Navbar from "../navbars/Navbar"
import MainNavbar from "../navbars/MainNavbar"

interface EmptyState {
    title?: string
    subtitle?: string
    dashboard?: boolean
    reload?: boolean
}

const EmptyState: React.FC<EmptyState> = ({
    title = "Uh oh",
    subtitle = "Something went wrong. Try again!",
    dashboard,
    reload
}) => {
    const { theme } = useTheme()

    return (
        <div className="">
            {/* <MainNavbar /> */}
            <div className={`
            min-h-screen
            flex
            flex-col
            gap-2
            justify-center
            items-center
            ${theme == "light" ? "bg-white" : "bg-slate-900"}
        `}>
                <div className="-mt-10 flex flex-col justify-center items-center">
                    <Heading
                        center
                        title={title}
                        subtitle={subtitle}
                    />
                    <div className={`w-48 mt-4`}>
                        <div className={`flex justify-center border py-1 rounded-md transition-all cursor-pointer ${theme == "light"
                            ? "border-neutral-800 text-neutral-800" : "border-neutral-200 text-neutral-200"} hover:-translate-y-0.5`}>
                            Reload
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EmptyState