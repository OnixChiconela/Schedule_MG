"use client"

import { completeInvite } from "@/app/api/actions/collaboration/completeInvite"
import { acceptInviteToken, getInvite } from "@/app/api/actions/collaboration/getInvite"
import ClientOnly from "@/app/components/ClientOnly"
import Navbar from "@/app/components/navbars/Navbar"
import SideNavbar from "@/app/components/navbars/SideNavbar"
import { useUser } from "@/app/context/UserContext"
import { useTheme } from "@/app/themeContext"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { motion } from "framer-motion"

interface InviteDate {
    inviteToken: string
    partnershipId: string
    partnershipName: string
    email: string
    role: string
    inviteLink: string
}

const InvitePage = () => {
    const { theme, toggleTheme } = useTheme()
    const { currentUser, userLoading } = useUser()
    const router = useRouter()
    const { inviteToken } = useParams()
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [inviteData, setInviteData] = useState<InviteDate | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const toggleSideBar = () => setIsSidebarOpen(!isSidebarOpen)

    useEffect(() => {
    if (!inviteToken) {
      setError('Invalid invite link.');
      toast.error('Invalid invite link.');
      setIsLoading(false);
      return;
    }

    const loadInvite = async () => {
      try {
        setIsLoading(true);
        const data = await getInvite(inviteToken as string);
        setInviteData(data);
      } catch (err: any) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadInvite();
  }, [inviteToken]);

  const handleAcceptInvite = async () => {
    if (!currentUser) {
      toast.error('You must be logged in to accept the invite.');
      router.push(`/my-space/auth/register?inviteToken=${inviteToken}&email=${encodeURIComponent(inviteData?.email || '')}`);
      return;
    }

    try {
      setIsLoading(true);
      const data = await acceptInviteToken(inviteToken as string, currentUser.id);
      toast.success(`Successfully joined ${data.partnership.name}!`);
      router.push(`/collaboration-space/${data.partnership.id}`);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

   return (
    <ClientOnly>
      <Navbar
        themeButton={false}
        showToggleSidebarButton={true}
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSideBar}
        showNotificationBell={true}
      />
      <div
        className={`min-h-screen flex ${theme === 'light' ? 'bg-white' : 'bg-slate-900'} transition-colors duration-300`}
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <SideNavbar
          theme={theme}
          toggleTheme={toggleTheme}
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
          isVisible={isSidebarOpen}
        />
        <main
          className="flex-1 p-4 sm:p-6 lg:ml-[260px] sm:pt-20 max-w-screen-2xl mx-auto"
          style={{ paddingTop: `calc(5rem + env(safe-area-inset-top, 0px))` }}
        >
          <div className="flex flex-col gap-4">
            <h1
              className={`text-2xl font-semibold ${theme === 'light' ? 'text-neutral-800' : 'text-neutral-200'}`}
            >
              Partnership Invitation
            </h1>
            {isLoading || userLoading ? (
              <p className={theme === 'light' ? 'text-neutral-600' : 'text-neutral-400'}>Loading invite...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : inviteData ? (
              <div className="flex flex-col gap-4">
                <p className={theme === 'light' ? 'text-neutral-600' : 'text-neutral-400'}>
                  You have been invited to join <strong>{inviteData.partnershipName}</strong> as a{' '}
                  <strong>{inviteData.role.toLowerCase()}</strong>.
                </p>
                {currentUser ? (
                  <div className="flex gap-4">
                    <motion.button
                      className={`p-2 rounded-lg ${theme === 'light' ? 'bg-neutral-800 text-white hover:bg-neutral-900' : 'bg-neutral-900 text-white hover:bg-black'}`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleAcceptInvite}
                      disabled={isLoading}
                    >
                      Accept Invite
                    </motion.button>
                    <motion.button
                      className={`p-2 rounded-lg ${theme === 'light' ? 'bg-neutral-200 text-neutral-800 hover:bg-neutral-300' : 'bg-slate-800 text-neutral-200 hover:bg-slate-700'}`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => router.push('/dashboard')}
                    >
                      Cancel
                    </motion.button>
                  </div>
                ) : (
                  <motion.button
                    className={`p-2 rounded-lg ${theme === 'light' ? 'bg-neutral-100 hover:bg-neutral-200' : 'bg-slate-800/50 hover:bg-neutral-800'}`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => router.push(`/my-space/auth/register?inviteToken=${inviteToken}&email=${encodeURIComponent(inviteData.email)}`)}
                  >
                    Register to Join
                  </motion.button>
                )}
              </div>
            ) : null}
          </div>
        </main>
      </div>
    </ClientOnly>
  );
};

export default InvitePage