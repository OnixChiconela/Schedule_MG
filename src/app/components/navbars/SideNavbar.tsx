'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BriefcaseBusiness,
  Calendar,
  Car,
  Home,
  Mail,
  MoonStar,
  Notebook,
  PenBox,
  Sparkles,
  Sun,
  X,
} from 'lucide-react';
import { IconType } from 'react-icons';

interface SideNavbarProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  isOpen?: boolean;
  setIsOpen?: (isOpen: boolean) => void;
  isVisible?: boolean;
}

export default function SideNavbar({
  theme,
  toggleTheme,
  isOpen: controlledIsOpen,
  setIsOpen: controlledSetIsOpen,
  isVisible = true,
}: SideNavbarProps) {
  const [isDesktop, setIsDesktop] = useState(false);
  const [localIsOpen, setLocalIsOpen] = useState(false);

  // Use controlled or local state
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : localIsOpen;
  const setIsOpen = controlledSetIsOpen || setLocalIsOpen;

  // Handle window resize and SSR safety
  useEffect(() => {
    const updateIsDesktop = () => {
      if (typeof window !== 'undefined') {
        const isDesktopView = window.innerWidth >= 1024;
        setIsDesktop(isDesktopView);
        if (isDesktopView && !isOpen) {
          setIsOpen(true);
        }
      }
    };

    updateIsDesktop();
    window.addEventListener('resize', updateIsDesktop);
    return () => window.removeEventListener('resize', updateIsDesktop);
  }, [isOpen, setIsOpen]);

  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95 },
  };

  return (
    <>
      {/* Overlay (Mobile Only) */}
      <AnimatePresence>
        {isOpen && !isDesktop && (
          <motion.div
            key="overlay"
            className="lg:hidden fixed inset-0 bg-black/50 z-[800]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => {
              setIsOpen(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {(isOpen || isDesktop) && (
          <motion.nav
            key="sidebar"
            className={`fixed w-[260px] h-screen p-4 ${theme === 'light' ? 'bg-gray-100' : 'bg-slate-950'
              } z-[900] flex flex-col top-0 left-0`}
            initial={{ x: (isDesktop && !isVisible) || (!isDesktop && !isOpen) ? -260 : 0 }}
            animate={{ x: (isDesktop && !isVisible) || (!isDesktop && !isOpen) ? -260 : 0 }}
            exit={{ x: (isDesktop && !isVisible) || (!isDesktop && !isOpen) ? -260 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col w-full h-full">
              <div className="flex mb-6 items-center justify-between">
                <h2
                  className={`text-2xl font-bold ${theme === 'light' ? 'text-gray-900' : 'text-gray-100'
                    }`}
                >
                  Scheuor
                </h2>
                <div className="flex items-center gap-2">
                  <motion.button
                    onClick={() => {
                      toggleTheme();
                    }}
                    whileHover="hover"
                    whileTap="tap"
                    variants={buttonVariants}
                    className={`px-3 py-2 rounded-lg ${theme === 'light' ? 'bg-gray-200 text-gray-900' : 'bg-slate-800 text-gray-200'
                      }`}
                  >
                    {theme === 'light' ? <Sun size={20} /> : <MoonStar size={20} />}
                  </motion.button>
                  {!isDesktop && (
                    <motion.button
                      onClick={() => {
                        setIsOpen(false);
                      }}
                      className="lg:hidden p-2 rounded-lg bg-fuchsia-600 text-white shadow-md border border-fuchsia-700 hover:shadow-lg hover:shadow-fuchsia-500/50"
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <X size={20} />
                    </motion.button>
                  )}
                </div>
              </div>
              <ul>
                <li>
                  <SideNavButton title="Home" link="/dashboard" icon={Home} theme={theme} />
                </li>
              </ul>
              <Divider theme={theme} />
              <ul className="flex flex-col">
                <li>
                  <SideNavButton title="Tasks" link="/tasks" icon={PenBox} theme={theme} />
                </li>
                <li>
                  <SideNavButton title="Calendar" link="/calendar" icon={Calendar} theme={theme} />
                </li>
                <Divider theme={theme} />
                <li>
                  <SideNavButton
                    title="My business"
                    link="/business"
                    icon={BriefcaseBusiness}
                    theme={theme}
                  />
                </li>
                <li>
                  <SideNavButton title="Roadmap" link="/tracking" icon={Car} theme={theme} />
                </li>
                <Divider theme={theme} />
                  <li>
                    <div className={`flex items-center gap-2 mb-2 ${theme == "light" ? "text-neutral-900" : "text-neutral-200"} font-semibold`}>
                      AI Partner
                      <Sparkles size={16}/>
                    </div>
                    <SideNavButton title='Smart notes' link='/smart/smart-notes' icon={Notebook} theme={theme}/>
                  </li>
                <Divider theme={theme}/>
                <li>
                  <SideNavButton title="Feedback" link="/feedback" icon={Mail} theme={theme} />
                </li>
              </ul>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}

const Divider = ({ theme }: { theme: 'light' | 'dark' }) => (
  <div className="py-2">
    <hr className={`${theme === 'light' ? 'text-gray-300' : 'text-neutral-700'}`} />
  </div>
);

const SideNavButton = ({
  title,
  link,
  icon: Icon,
  theme,
}: {
  title: string;
  link?: string;
  icon: IconType;
  theme: 'light' | 'dark';
}) => {
  return (
    <Link href={link!}>
      <span
        className={`flex gap-1 p-2 rounded-lg hover:bg-fuchsia-800/50 hover:text-white ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'
          }`}
      >
        <Icon size={22} />
        {title}
      </span>
    </Link>
  );
};