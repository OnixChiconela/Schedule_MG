'use client'

import { useTheme } from "@/app/themeContext"
import Container from "../Container";
import { ChevronLeft, ChevronRight, MoonStar, Sun } from "lucide-react";
import { useRouter } from "next/navigation";

const TrackingNav = ({ themeButton }: { themeButton?: boolean }) => {
    const router = useRouter()
    const { theme, toggleTheme } = useTheme()

    return (
        <div
            className={`fixed w-full z-20 shadow-sm ${theme === "light" ? "bg-white" : "bg-slate-700"}
            transition-colors duration-300`}
        >
            <Container>
                <div className="flex flex-row items-center justify-between py-6 mx-auto">
                    {/*main buttons */}
                    <div className="flex items-center gap-2">
                        {themeButton ? (
                            <div />
                        ) : (
                            <button
                                onClick={toggleTheme}
                                className={`p-2 rounded-full ${theme === 'light' ? 'bg-gray-200 text-gray-900' : 'bg-slate-600 text-neutral-200'
                                    } hover:bg-fuchsia-700 transition`}
                                aria-label="Toggle theme"
                            >
                                {theme === 'light' ? <MoonStar size={20} /> : <Sun size={20} />}
                            </button>
                        )}

                        <div className="flex gap-3">
                            <div className={`cursor-pointer hover:text-fuchsia-800 ${theme === "light" ? "text-gray-800" : "text-neutral-200"}`}
                                onClick={() => router.back()}
                            >
                                <ChevronLeft size={20} />
                            </div>
                            <div className={`cursor-pointer hover:text-fuchsia-800 ${theme === "light" ? "text-gray-800" : "text-neutral-200"}`}
                                onClick={() => router.forward()}>
                                <ChevronRight size={20} />
                            </div>
                        </div>

                    </div>
                </div>
            </Container>
        </div>
    )
}

export default TrackingNav