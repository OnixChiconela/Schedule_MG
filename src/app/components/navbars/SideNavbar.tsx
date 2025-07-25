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
  User,
  X,
} from 'lucide-react';
import { IconType } from 'react-icons';
import UserProfileItem from './UserProfilleItem';
import { useRouter } from 'next/navigation';
import { MdPeopleOutline, MdPerson, MdPersonOutline } from 'react-icons/md';
import { useUser } from '@/app/context/UserContext';
import toast from 'react-hot-toast';
import { updateUserProfile } from '@/app/api/actions/user/updateUserProfile';
import api from '@/app/api/api';
import { clearTokenFromStorage } from '@/app/api/actions/auth/clearTokenFromStorage';

interface SideNavbarProps {
  theme: string;
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
  const { currentUser, setCurrentUser } = useUser()
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
    };

    updateIsDesktop();
    window.addEventListener('resize', updateIsDesktop);
    return () => window.removeEventListener('resize', updateIsDesktop);
  }, [isOpen, setIsOpen]);

  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95 },
  };

  // const [userVisual, setUserVisual] = useState<{
  //   // type: 'image' | 'icon' | 'emoji';
  //   type: "emoji" | "initial";
  //   value: string | React.ReactNode
  // }>({ type: 'emoji', value: "🚀" })

  // useEffect(() => {
  //   const savedVisual = localStorage.getItem('userVisual');
  //   if (savedVisual) {
  //     const parsed = JSON.parse(savedVisual);
  //     if (parsed.type === 'icon') {
  //       const iconMap: { [key: string]: React.ReactNode } = {
  //         'User': <User />,
  //       };
  //       setUserVisual({ ...parsed, value: iconMap[parsed.value as string] || parsed.value });
  //     } else {
  //       setUserVisual(parsed);
  //     }
  //   }
  // }, []);

  const handleVisualChange = async (visual: { type: "emoji" | "initial"; value: string }) => {
    if (!currentUser) {
      toast.error("User not logged in");
      return;
    }
    try {
      const updatedUser = await updateUserProfile(currentUser.id, {
        visualType: visual.type,
        visualValue: visual.value,
      });
      setCurrentUser({
        ...currentUser,
        visualType: updatedUser.visualType,
        visualValue: updatedUser.visualValue,
      });
      toast.success("Profile visual updated successfully");
    } catch (error: any) {
      console.error("Error updating visual:", error);
      toast.error("Failed to update profile visual");
    }
  };

  const handleSettingsClick = () => {
    router.push('/my-space/settings');
  };
  const handleProfileClick = () => {
    toast.success("coming soon")
    // router.push('/profile');
  };
  const handleLogoutClick = async () => {
    if (currentUser) {
      const toastId = toast.loading("Logging out...", {
        style: {
          background: theme === "light" ? "#fff" : "#1e293b",
          color: theme === "light" ? "#1f2937" : "#f3f4f6",
          border: `1px solid ${theme === "light" ? "#e5e7eb" : "#374151"}`,
        },
      })
      try {
        const logout = await api.post("/auth/logout")
        if (logout) {
          await clearTokenFromStorage()
          setCurrentUser(null)
          router.refresh()
          toast.dismiss(toastId)
          toast.success("Logged out")
        }
      } catch (error) {
        toast.dismiss(toastId)
        toast.error("Oops. Something went wrong while logging out. Try again!")
      } finally {
        toast.dismiss()
      }
    }
    router.push("my-space/auth/login")
  };

  return (
    <>
      {/* Overlay (Mobile Only) */}
      <AnimatePresence>
        {isOpen && !isDesktop && (
          <motion.div
            key="overlay"
            className="lg:hidden fixed inset-0 bg-black/50 z-50"
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
          <motion.nav
            key="sidebar"
            className={`fixed w-[260px] h-screen p-4 ${theme === "light" ? "bg-gray-100" : "bg-slate-950"
              } z-50 flex flex-col top-0 left-0`}
            initial={{ x: (isDesktop && !isVisible) || (!isDesktop && !isOpen) ? -260 : 0 }}
            animate={{ x: (isDesktop && !isVisible) || (!isDesktop && !isOpen) ? -260 : 0 }}
            exit={{ x: (isDesktop && !isVisible) || (!isDesktop && !isOpen) ? -260 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col w-full h-full">
              <div className="flex mb-6 items-center justify-between">
                <h2
                  className={`text-2xl font-bold ${theme === "light" ? "text-gray-900" : "text-gray-100"
                    }`}
                >
                  Scheuor
                </h2>
                <div className="flex items-center gap-2">
                  <motion.button
                    onClick={toggleTheme}
                    whileHover="hover"
                    whileTap="tap"
                    variants={buttonVariants}
                    className={`px-3 py-2 rounded-lg ${theme === "light"
                      ? "bg-gray-200 text-gray-900"
                      : "bg-slate-800 text-gray-200"
                      }`}
                  >
                    {theme === "light" ? <Sun size={20} /> : <MoonStar size={20} />}
                  </motion.button>
                  {!isDesktop && (
                    <motion.button
                      onClick={() => setIsOpen(false)}
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
                  <UserProfileItem
                    userId={currentUser?.id || ""}
                    name={
                      currentUser
                        ? `${currentUser.firstName} ${currentUser.lastName}`
                        : "Guest"
                    }
                    email={currentUser?.email}
                    visualType={currentUser?.visualType}
                    visualValue={currentUser?.visualValue}
                    onVisualChange={handleVisualChange}
                    onSettingsClick={handleSettingsClick}
                    onProfileClick={handleProfileClick}
                    onLogoutClick={handleLogoutClick}
                  />
                </li>
              </ul>
              <Divider theme={theme} />
              <ul>
                <li>
                  <SideNavButton title="Home" link="/dashboard" icon={Home} theme={theme} />
                </li>
              </ul>
              <Divider theme={theme} />
              {currentUser && (
                <div>
                  <ul className='flex flex-col'>
                    <li>
                      <SideNavButton
                        title="Partnership"
                        link="/collaboration-space"
                        icon={MdPeopleOutline}
                        theme={theme}
                      />
                    </li>
                  </ul>
                  <Divider theme={theme} />
                </div>
              )}
              <ul className="flex flex-col">
                <li>
                  <SideNavButton
                    title="My space"
                    link="/tasks"
                    icon={MdPersonOutline}
                    theme={theme} />
                </li>
                {/* <li>
                  <SideNavButton title="Tasks" link="/tasks" icon={PenBox} theme={theme} />
                </li>
                <li>
                  <SideNavButton
                    title="Calendar"
                    link="/calendar"
                    icon={Calendar}
                    theme={theme}
                  />
                </li> */}
                {/* <Divider theme={theme} />
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
                </li> */}
                <Divider theme={theme} />
                <li>
                  <div
                    className={`flex items-center gap-2 mb-2 ${theme == "light" ? "text-neutral-900" : "text-neutral-200"
                      } font-semibold`}
                  >
                    AI Partner
                    <Sparkles size={16} />
                  </div>
                  <SideNavButton
                    title="Smart notes"
                    link="/smart/smart-notes"
                    icon={Notebook}
                    theme={theme}
                  />
                </li>
                <Divider theme={theme} />
                <li>
                  <SideNavButton
                    title="Feedback"
                    link="/feedback"
                    icon={Mail}
                    theme={theme}
                  />
                </li>
              </ul>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}

export const Divider = ({ theme }: { theme: string }) => (
  <div className="py-2">
    <hr className={`${theme === 'light' ? 'text-gray-300' : 'text-neutral-700'}`} />
  </div>
);

export const SideNavButton = ({
  title,
  link,
  icon: Icon,
  theme,
}: {
  title: string;
  link?: string;
  icon: IconType;
  theme: string;
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