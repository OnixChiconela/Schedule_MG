"use client"

import Link from "next/link";
import Container from "./Container";
import Image from "next/image";
import { useTheme } from "../themeContext";
import { useState } from "react";
import { MoonStar, Sun } from "lucide-react";
import { HiMenu, HiX } from "react-icons/hi";
import { AnimatePresence, motion } from "framer-motion";

const LandingNavbar = () => {
    const { theme, toggleTheme } = useTheme()
    const [isRegisterOpen, setIsRegisterOpen] = useState(false)
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleRegisterOpen = () => setIsRegisterOpen(true)
    const handleRegisterClose = () => setIsRegisterOpen(false)

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };


    return (
        <div
            className={`fixed w-full z-20 shadow-sm ${theme === 'light' ? 'bg-white' : 'bg-slate-700'
                } transition-colors duration-300`}
        >
            <Container>
                <div className="flex flex-row items-center justify-between py-6  mx-auto">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <Image
                            alt="Scheuor Logo"
                            className="h-12 w-auto"
                            height={48}
                            width={100}
                            src="/scheuor.png"
                            priority
                        />
                        <span
                            className={`text-sm font-medium ${theme === 'light' ? 'text-gray-900' : 'text-neutral-200'
                                } hidden sm:block`}
                        >
                            Scheuor
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div
                        className={`hidden md:flex items-center gap-4 ${theme === 'light' ? 'text-slate-800' : 'text-neutral-200'
                            }`}
                    >
                        <div className="flex gap-4 text-sm font-medium">
                            <Link
                                href="/features"
                                className={`px-3 py-2 rounded-md ${theme === 'light'
                                    ? 'hover:bg-gray-100 hover:text-fuchsia-600'
                                    : 'hover:bg-slate-600 hover:text-fuchsia-400'
                                    } transition`}
                            >
                                Features
                            </Link>
                            <Link
                                href="/demo"
                                className={`px-3 py-2 rounded-md ${theme === 'light'
                                    ? 'hover:bg-gray-100 hover:text-fuchsia-600'
                                    : 'hover:bg-slate-600 hover:text-fuchsia-400'
                                    } transition`}
                            >
                                Try Demo
                            </Link>
                            <a
                                href="mailto:contact@scheuor.com"
                                className={`px-3 py-2 rounded-md ${theme === 'light'
                                    ? 'hover:bg-gray-100 hover:text-fuchsia-600'
                                    : 'hover:bg-slate-600 hover:text-fuchsia-400'
                                    } transition`}
                            >
                                Contact
                            </a>
                            <Link
                                href="/login"
                                className={`px-3 py-2 rounded-md ${theme === 'light'
                                    ? 'hover:bg-gray-100 hover:text-fuchsia-600'
                                    : 'hover:bg-slate-600 hover:text-fuchsia-400'
                                    } transition`}
                            >
                                Log In
                            </Link>
                        </div>
                        <button
                            onClick={handleRegisterOpen}
                            className="text-sm font-semibold py-2 px-6 rounded-full bg-fuchsia-600 text-white hover:bg-fuchsia-700 transition hover:scale-105"
                        >
                            Sign Up
                        </button>
                        <button
                            onClick={toggleTheme}
                            className={`p-2 rounded-full ${theme === 'light' ? 'bg-gray-200 text-gray-900' : 'bg-slate-600 text-neutral-200'
                                } hover:bg-fuchsia-500 transition`}
                            aria-label="Toggle theme"
                        >
                            {theme === 'light' ? <MoonStar size={20} /> : <Sun size={20} />}
                        </button>
                    </div>

                    {/* Hamburger Menu Button (Mobile) */}
                    <button
                        className={`md:hidden p-2 rounded-md ${theme === 'light' ? 'text-gray-900' : 'text-neutral-200'
                            }`}
                        onClick={toggleMenu}
                        aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                    >
                        {isMenuOpen ? <HiX size={24} /> : <HiMenu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, x: '100%' }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: '100%' }}
                            transition={{ duration: 0.3 }}
                            className={`md:hidden fixed top-0 right-0 h-screen w-3/4 max-w-xs ${theme === 'light' ? 'bg-white' : 'bg-slate-700'
                                } shadow-lg z-30`}
                        >
                            <div className="flex flex-col p-6 gap-4">
                                <button
                                    className={`self-end p-2 rounded-md ${theme === 'light' ? 'text-gray-900' : 'text-neutral-200'
                                        }`}
                                    onClick={toggleMenu}
                                    aria-label="Close menu"
                                >
                                    <HiX size={24} />
                                </button>
                                <Link
                                    href="/features"
                                    className={`text-base font-medium py-2 px-4 rounded-md ${theme === 'light'
                                        ? 'hover:bg-gray-100 hover:text-fuchsia-600'
                                        : 'hover:bg-slate-600 hover:text-fuchsia-400 text-neutral-200'
                                        } transition`}
                                    onClick={toggleMenu}
                                >
                                    Features
                                </Link>
                                <Link
                                    href="/demo"
                                    className={`text-base font-medium py-2 px-4 rounded-md ${theme === 'light'
                                        ? 'hover:bg-gray-100 hover:text-fuchsia-600'
                                        : 'hover:bg-slate-600 hover:text-fuchsia-400 text-neutral-200'
                                        } transition`}
                                    onClick={toggleMenu}
                                >
                                    Try Demo
                                </Link>
                                <a
                                    href="mailto:contact@scheuor.com"
                                    className={`text-base font-medium py-2 px-4 rounded-md ${theme === 'light'
                                        ? 'hover:bg-gray-100 hover:text-fuchsia-600'
                                        : 'hover:bg-slate-600 hover:text-fuchsia-400 text-neutral-200'
                                        } transition`}
                                    onClick={toggleMenu}
                                >
                                    Contact
                                </a>
                                <Link
                                    href="/login"
                                    className={`text-base font-medium py-2 px-4 rounded-md ${theme === 'light'
                                        ? 'hover:bg-gray-100 hover:text-fuchsia-600'
                                        : 'hover:bg-slate-600 hover:text-fuchsia-400 text-neutral-200'
                                        } transition`}
                                    onClick={toggleMenu}
                                >
                                    Log In
                                </Link>
                                <button
                                    onClick={handleRegisterOpen}
                                    className="text-base font-semibold py-2 px-4 rounded-md bg-fuchsia-600 text-white hover:bg-fuchsia-700 transition text-left"
                                >
                                    Sign Up
                                </button>
                                <button
                                    onClick={() => {
                                        toggleTheme();
                                        toggleMenu();
                                    }}
                                    className={`text-base font-medium py-2 px-4 rounded-md flex items-center gap-2 ${theme === 'light'
                                        ? 'hover:bg-gray-100 hover:text-fuchsia-600'
                                        : 'hover:bg-slate-600 hover:text-fuchsia-400 text-neutral-200'
                                        } transition`}
                                >
                                    {theme === 'light' ? (
                                        <>
                                            <MoonStar size={20} /> Dark Mode
                                        </>
                                    ) : (
                                        <>
                                            <Sun size={20} /> Light Mode
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Container>
        </div>
    )
}
export default LandingNavbar