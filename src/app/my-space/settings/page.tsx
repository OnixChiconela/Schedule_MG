"use client"

import ClientOnly from "@/app/components/ClientOnly"
import Container from "@/app/components/Container"
import MainNavbar from "@/app/components/navbars/MainNavbar"
import { useTheme } from "@/app/themeContext"
import { AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { DollarSign, MoonStar, Sun, X } from "lucide-react"
import { Divider, SideNavButton } from "@/app/components/navbars/SideNavbar"
import { MdPerson } from "react-icons/md"
import { HiCash } from "react-icons/hi"

const SettingsPage = () => {
    const { theme } = useTheme()
    const [localIsOpen, setLocalIsOpen] = useState(false)
    // const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : localIsOpen;

    return (
        <ClientOnly>
            <div className={`${theme == "light" ? "bg-white" : "bg-slate-900"} min-h-screen transition-colors duration-300`}>
                <div className="z-30">
                    <MainNavbar
                        themeButton={true}
                        showToggleSidebarButton={true}
                        // isSidebarOpen={isSidebarOpen}
                        // toggleSidebar={toggleSidebar}
                        showNotificationBell={true}
                    />
                </div>
                <Container>
                    <div
                        className={`min-h-screen flex ${theme === 'light' ? 'bg-white' : 'bg-slate-900'} transition-colors duration-300`}
                        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
                    >
                        <SettingSidenav theme={theme} />
                    </div>
                </Container>
            </div>
        </ClientOnly>
    )
}

export default SettingsPage

interface sideNav {
    theme: string
    isOpen?: boolean
    setIsOpen?: (isOpen: boolean) => void
    isVisible?: boolean
}
const SettingSidenav: React.FC<sideNav> = ({
    theme,
    isOpen: controlledIsOpen,
    setIsOpen: controlledSetIsOpen,
    isVisible = true
}) => {
    const [isDesktop, setIsDesktop] = useState(false)
    const [localIsOpen, setLocalIsOpen] = useState(false);
    const router = useRouter()
    const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : localIsOpen;
    const setIsOpen = controlledSetIsOpen || setLocalIsOpen;

    useEffect(() => {
        const updateIsDesktop = () => {
            if (typeof window !== 'undefined') {
                const isDesktopView = window.innerWidth >= 1024;
                setIsDesktop(isDesktopView);
                if (isDesktopView && !isOpen) {
                    setIsOpen(true);
                }
            }
        }

        updateIsDesktop()
        window.addEventListener('resize', updateIsDesktop)
    }, [isOpen, setIsOpen])

    const buttonVariants = {
        hover: { scale: 1.05, transition: { duration: 0.2 } },
        tap: { scale: 0.95 },
    };

    return (
        <>
            <AnimatePresence>
                {isOpen && !isDesktop && (
                    <motion.div
                        key="overlay"
                        className="lg:hidden fixed inset-0 bg-black/50 z-10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        onClick={() => setIsOpen(false)}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {(isOpen || isDesktop) && (
                    <motion.div
                        key="setting_sidenav"
                        className={`fixed w-[240px] h-screen p-4 ${theme === "light" ? "bg-gray-100" : "bg-slate-950"
                            } z-20 flex flex-col top-0 left-0`}
                        initial={{ x: (isDesktop && !isVisible) || (!isDesktop && !isOpen) ? -260 : 0 }}
                        animate={{ x: (isDesktop && !isVisible) || (!isDesktop && !isOpen) ? -260 : 0 }}
                        exit={{ x: (isDesktop && !isVisible) || (!isDesktop && !isOpen) ? -260 : 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="flex flex-col w-full h-full">
                            {/* <Container> */}
                            <div className="flex items-center justify-between mt-20 gap-10 pl-2 ">
                                <h2 className={`text-2xl font-bold ${theme === "light" ? "text-gray-900" : "text-gray-100"}`}>
                                    Settings
                                </h2>
                                <div className="flex items-center gap-2">
                                    {!isDesktop && (
                                        <motion.button
                                            onClick={() => setIsOpen(false)}
                                            className="lg:hidden p-2 rounded-lg bg-fuchsia-600 text-white shadow-md border 
                                            border-fuchsia-700 hover:shadow-lg hover:shadow-fuchsia-500/50 hover:cursor-pointer"
                                            variants={buttonVariants}
                                            whileHover="hover"
                                            whileTap="tap"
                                        >
                                            <X size={20} />
                                        </motion.button>
                                    )}
                                </div>
                            </div>
                            <div className="mt-3">
                                <Divider theme={theme} />
                                <ul className="mt-3 flex flex-col gap-2">
                                    <li>
                                        <SideNavButton
                                            title="Account"
                                            link="/account"
                                            icon={MdPerson}
                                            theme={theme}
                                        />
                                    </li>
                                    <li>
                                        <SideNavButton
                                            title="Billing"
                                            link="/billing"
                                            icon={DollarSign}
                                            theme={theme}
                                        />
                                    </li>
                                </ul>
                            </div>
                            {/* </Container> */}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence >
        </>
    )
}
