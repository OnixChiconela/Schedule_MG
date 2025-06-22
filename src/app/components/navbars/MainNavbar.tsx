"use client"
import { useTheme } from "@/app/themeContext";
import { Bell, ChevronLeft, ChevronRight, Menu, MoonStar, Sun, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useNotifications } from "@/app/context/NotificationContext";

interface MainNavbarProps {
  themeButton?: boolean;
  showToggleSidebarButton?: boolean;
  isSidebarOpen?: boolean;
  toggleSidebar?: () => void;
  showNotificationBell?: boolean;
}

const MainNavbar = ({
  themeButton = true,
  showToggleSidebarButton = false,
  isSidebarOpen = false,
  toggleSidebar,
  showNotificationBell = false,
}: MainNavbarProps) => {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { notificationCount } = useNotifications();

  return (
    <div
      className={`fixed w-full z-50 shadow-md ${
        theme === "light" ? "bg-white" : "bg-slate-700"
      } transition-colors duration-300`}
    >
      <div className="px-5">
        <div className="flex flex-row items-center justify-between py-4 mx-auto">
          <div className="flex items-center gap-4">
            {showToggleSidebarButton && toggleSidebar && (
              <motion.button
                onClick={() => {
                  toggleSidebar();
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`p-2 rounded-lg ${
                  theme === "light" ? "bg-gray-200 text-gray-900" : "bg-slate-600 text-neutral-200"
                } hover:bg-fuchsia-600 hover:text-white transition shadow-md lg:hidden`}
                aria-label="Toggle sidebar"
              >
                {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </motion.button>
            )}
            {themeButton && (
              <motion.button
                onClick={() => {
                  console.log("MainNavbar theme toggle clicked");
                  toggleTheme();
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`p-2 rounded-lg ${
                  theme === "light" ? "bg-gray-200 text-gray-900" : "bg-slate-600 text-neutral-200"
                } hover:bg-fuchsia-600 hover:text-white transition shadow-md`}
                aria-label="Toggle theme"
              >
                {theme === "light" ? <Sun size={20} /> : <MoonStar size={20} />}
              </motion.button>
            )}
            <div className="flex gap-3">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`cursor-pointer p-2 rounded-lg ${
                  theme === "light" ? "text-gray-800" : "text-neutral-200"
                } hover:bg-fuchsia-600 hover:text-white transition shadow-md`}
                onClick={() => {
                  console.log("MainNavbar back clicked");
                  router.back();
                }}
              >
                <ChevronLeft size={20} />
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`cursor-pointer p-2 rounded-lg ${
                  theme === "light" ? "text-gray-800" : "text-neutral-200"
                } hover:bg-fuchsia-600 hover:text-white transition shadow-md`}
                onClick={() => {
                  console.log("MainNavbar forward clicked");
                  router.forward();
                }}
              >
                <ChevronRight size={20} />
              </motion.div>
            </div>
          </div>
          {showNotificationBell && (
            <motion.div
              className="relative"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <motion.button
                onClick={() => {
                  console.log("Notification bell clicked");
                  router.push("/notifications");
                }}
                className={`p-2 rounded-lg ${
                  theme === "light" ? "bg-gray-200 text-gray-900" : "bg-slate-600 text-neutral-200"
                } hover:bg-fuchsia-600 hover:text-white transition shadow-md`}
                aria-label="Notifications"
              >
                <Bell size={20} />
              </motion.button>
              {notificationCount > 0 && (
                <span
                  className={`absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs font-semibold rounded-full ${
                    theme === "light" ? "bg-red-500 text-white" : "bg-red-600 text-neutral-200"
                  }`}
                >
                  {notificationCount > 9 ? "9+" : notificationCount}
                </span>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MainNavbar;