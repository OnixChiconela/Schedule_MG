'use client';

import Image from 'next/image';
import Link from 'next/link';
import { IoLogoTwitter, IoLogoLinkedin, IoLogoInstagram } from 'react-icons/io';
import { motion } from 'framer-motion';
import { useTheme } from '@/app/themeContext';
import Container from '../Container';
import { useRouter } from 'next/navigation';

const LandingFooter = () => {
    const { theme } = useTheme()
    const router = useRouter()
    const currentYear = new Date().getFullYear();

    const tryDemo = () => {
        if (!localStorage.getItem("userPreferences")) return router.push("/onboarding")
        router.push("/dashboard")
    }

    return (
        <footer
            className={`w-full py-12 ${theme === 'light' ? 'bg-gray-100' : 'bg-slate-900'
                } transition-colors duration-300`}
        >
            <Container>
                <div className="grid grid-cols-1 md:flex md:justify-between gap-12">
                    {/* Brand */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex flex-col items-center md:items-start"
                    >
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <Image
                                alt="Scheuor Logo"
                                className="h-10 w-auto"
                                height={40}
                                width={80}
                                src="/scheuor.png"
                            />
                            <span
                                className={`text-lg font-semibold ${theme === 'light' ? 'text-gray-900' : 'text-neutral-200'
                                    }`}
                            >
                                Scheuor
                            </span>
                        </Link>
                        <p
                            className={`text-sm text-center md:text-left ${theme === 'light' ? 'text-gray-600' : 'text-neutral-400'
                                } max-w-xs`}
                        >
                            Connect with Scheuor.
                        </p>
                    </motion.div>

                    {/* Quick Links */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="flex flex-col items-center text-center md:text-start"
                    >
                        <h3
                            className={`text-lg font-semibold mb-4 ${theme === 'light' ? 'text-gray-900' : 'text-neutral-200'
                                }`}
                        >
                            Quick Links
                        </h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link
                                    href="/#"
                                    className={`${theme === 'light'
                                        ? 'text-gray-600 hover:text-fuchsia-600'
                                        : 'text-neutral-400 hover:text-fuchsia-400'
                                        } transition`}
                                >
                                    Features
                                </Link>
                            </li>
                            <li>
                                <div
                                    onClick={() => tryDemo()}
                                    className={`${theme === 'light'
                                        ? 'text-gray-600 hover:text-fuchsia-600'
                                        : 'text-neutral-400 hover:text-fuchsia-400'
                                        } transition cursor-pointer`}
                                >
                                    Try Demo
                                </div>
                            </li>
                            <li>
                                <a
                                    href="mailto:josechiconela@icloud.com"
                                    className={`${theme === 'light'
                                        ? 'text-gray-600 hover:text-fuchsia-600'
                                        : 'text-neutral-400 hover:text-fuchsia-400'
                                        } transition`}
                                >
                                    Contact Us
                                </a>
                            </li>
                            <li>
                                <Link
                                    href="/#"
                                    className={`${theme === 'light'
                                        ? 'text-gray-600 hover:text-fuchsia-600'
                                        : 'text-neutral-400 hover:text-fuchsia-400'
                                        } transition`}
                                >
                                    About
                                </Link>
                            </li>
                        </ul>
                    </motion.div>

                    {/* Legal */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="flex flex-col items-center md:items-start text-center md:text-start"
                    >
                        <h3
                            className={`text-lg font-semibold mb-4 ${theme === 'light' ? 'text-gray-900' : 'text-neutral-200'
                                }`}
                        >
                            Legal
                        </h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link
                                    href="/#"
                                    className={`${theme === 'light'
                                        ? 'text-gray-600 hover:text-fuchsia-600'
                                        : 'text-neutral-400 hover:text-fuchsia-400'
                                        } transition`}
                                >
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/terms"
                                    className={`${theme === 'light'
                                        ? 'text-gray-600 hover:text-fuchsia-600'
                                        : 'text-neutral-400 hover:text-fuchsia-400'
                                        } transition`}
                                >
                                    Terms of Service
                                </Link>
                            </li>
                        </ul>
                    </motion.div>

                    {/* Newsletter & Social */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="flex flex-col items-center  text-center md:text-start"
                    >
                        <h3
                            className={`text-lg font-semibold mb-4 ${theme === 'light' ? 'text-gray-900' : 'text-neutral-200'
                                }`}
                        >
                            Stay Connected
                        </h3>

                        <div className="flex gap-4">
                            <a
                                href="https://x.com/scheuor"
                                className={`${theme === 'light' ? 'text-gray-600' : 'text-neutral-400'
                                    } hover:text-fuchsia-600 transition`}
                                aria-label="Twitter"
                            >
                                <IoLogoTwitter size={24} />
                            </a>
                            <a
                                href="https://linkedin.com/company/scheuor"
                                className={`${theme === 'light' ? 'text-gray-600' : 'text-neutral-400'
                                    } hover:text-fuchsia-600 transition`}
                                aria-label="LinkedIn"
                            >
                                <IoLogoLinkedin size={24} />
                            </a>
                            <a
                                href="https://instagram.com/scheuor"
                                className={`${theme === 'light' ? 'text-gray-600' : 'text-neutral-400'
                                    } hover:text-fuchsia-600 transition`}
                                aria-label="Instagram"
                            >
                                <IoLogoInstagram size={24} />
                            </a>
                        </div>
                    </motion.div>
                </div>

                {/* Copyright */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className={`mt-12 pt-8 border-t ${theme === 'light' ? 'border-gray-200' : 'border-slate-700'
                        } text-center`}
                >
                    <p
                        className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-neutral-400'
                            }`}
                    >
                        © {currentYear} Scheuor. All rights reserved.
                    </p>
                </motion.div>
            </Container>
        </footer>
    );

}

export default LandingFooter