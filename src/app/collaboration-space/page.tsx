"use client"

import { useRouter } from "next/navigation"
import { useTheme } from "../themeContext"
import { useEffect, useState } from "react"
import { useUser } from "../context/UserContext"
import toast from "react-hot-toast"
import { duration } from "moment"
import ClientOnly from "../components/ClientOnly"
import Navbar from "../components/navbars/Navbar"
import SideNavbar from "../components/navbars/SideNavbar"
import { motion } from "framer-motion"
import { Edit, MoreHorizontal, Plus, Trash, X } from "lucide-react"
import CollaborationTeamCards, { Partnership } from "../components/collaboration/CollaborationCard"
import CreatePartnershipModal from "../components/collaboration/CollaborationModal"
import { getUserCollabSpace } from "../api/actions/collaboration/getUserCollabSpace"

export default function CollaborationSpace() {
    const { theme, toggleTheme } = useTheme();
    const router = useRouter()
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [partnerships, setPartnerships] = useState<Partnership[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const { currentUser } = useUser();

    useEffect(() => {
        if (!currentUser) {
            setLoading(false)
            toast.error("Oops, seems like you're not logged in!")
            return
        }

        const fetchPartnerships = async () => {
            try {
                setLoading(true);
                const response = await getUserCollabSpace(currentUser.id);
                // Garantir que members seja um array válido
                const normalizedPartnerships = response.map((p: any) => ({
                    ...p,
                    members: Array.isArray(p.members) ? p.members : [],
                }));
                setPartnerships(normalizedPartnerships);
            } catch (error) {
                console.error("Error fetching partnerships:", error);
                setError("Failed to load partnerships. Try again.");
                toast.error("Failed to load partnerships. Try again");
            } finally {
                setLoading(false);
            }
        };

        fetchPartnerships();
    }, [currentUser, router]);


    // const filteredPartnerships = partnerships.filter((partnership) =>
    //     partnership.name.toLowerCase().includes(searchQuery.toLowerCase()))

    // const partnership = [{
    //     id: "sahdgajshdgas",
    //     name: "where's the party",
    //     description: "still lokking for the party",
    //     ownerId: 'asdgajkdgaks',
    //     role: "OWNER",
    //     createdAt: new Date(),
    //     updatedAt: new Date,
    //     status: "pending"
    // }]

    const filteredPartnership = partnerships && partnerships.filter((partnership) =>
        partnership.name.toLowerCase().includes(searchQuery.toLowerCase()))

    const toggleSidebar = () => { setIsSidebarOpen(!isSidebarOpen) }
    const buttonVariants = {
        hover: { scale: 1.05, transition: { duration: 0.2 } },
        tap: { scale: 0.95 }
    }

    const handleCreateSucess = (newPartnership: Partnership) => {
        setPartnerships([...partnerships, newPartnership])
        setIsCreateModalOpen(false);
        toast.success("Partnership created successfully!")
    }

    const openCreateModal = () => {
        if (!currentUser) {
            toast.error("login to create your partnership")
            router.push("/my-space/auth/login")
        }
        setIsCreateModalOpen(true)
    }

    const clearSearch = () => {
        setSearchQuery("")
    }

    const [activeButton, setActiveButton] = useState<'create' | 'edit' | 'remove' | null>(null);


    return (
        <ClientOnly>
            <Navbar
                themeButton={false}
                showToggleSidebarButton={true}
                isSidebarOpen={isSidebarOpen}
                toggleSidebar={toggleSidebar}
                showNotificationBell={true}
            />
            <div
                className={`min-h-screen flex ${theme === "light" ? "bg-white" : "bg-slate-900"} transition-colors duration-300`}
                style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
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
                        <div className="flex items-center justify-between">
                            <h1
                                className={`text-2xl font-semibold ${theme === "light" ? "text-neutral-800" : "text-neutral-200"}`}
                            >
                                Partnerships
                            </h1>
                            <div className={`flex gap-2 ${theme === "light" ? "text-neutral-800" : "text-neutral-200"}`}>
                                <motion.button
                                    className={`p-2 cursor-pointer rounded-full items-center ${theme === "light" ? "bg-neutral-100 hover:bg-neutral-200" : "bg-slate-800/50 hover:bg-neutral-800"
                                        }`}
                                    variants={buttonVariants}
                                    whileHover="hover"
                                    whileTap="tap"
                                    onClick={openCreateModal}
                                >
                                    <Plus />
                                </motion.button>
                                <motion.button
                                    className={`p-2 cursor-pointer rounded-full flex items-center gap-2 ${theme === 'light'
                                        ? 'bg-neutral-100 hover:bg-neutral-200'
                                        : 'bg-slate-800/50 hover:bg-neutral-800'}`}
                                    variants={buttonVariants}
                                    whileHover="hover"
                                    whileTap="tap"
                                    onClick={() => toast.error("disabled!")}
                                >
                                    more <MoreHorizontal />
                                </motion.button>
                            </div>
                        </div>
                        <div className="flex justify-center md:px-20">
                            <div
                                className={`flex flex-col gap-2 ${theme === 'light'
                                    ? 'bg-neutral-100 text-neutral-700'
                                    : 'bg-slate-700 text-white'} px-2 py-2 rounded-lg w-full`}
                            >
                                <motion.textarea
                                    placeholder={
                                        activeButton === 'create'
                                            ? 'Create a new team...'
                                            : activeButton === 'edit'
                                                ? 'Edit team name...'
                                                : activeButton === 'remove'
                                                    ? 'Remove team...'
                                                    : 'Search or enter command...'
                                    }
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    rows={1}
                                    className={`w-full p-1 rounded-lg ${theme === 'light'
                                        ? 'bg-neutral-100 text-neutral-700'
                                        : 'bg-slate-700 text-white'} focus:outline-none resize-none overflow-hidden`}
                                    style={{ minHeight: '2rem' }}
                                    onInput={(e) => {
                                        const target = e.target as HTMLTextAreaElement;
                                        target.style.height = 'auto';
                                        target.style.height = `${target.scrollHeight}px`;
                                    }}
                                    whileFocus={{ scale: 1.005 }}
                                />
                                <div className="flex items-center gap-1 mt-2">
                                    <motion.button
                                        className={`px-2 py-1 cursor-pointer rounded-full items-center ${theme === 'light'
                                            ? activeButton === 'create'
                                                ? 'bg-neutral-200 border-2 border-neutral-500'
                                                : 'bg-neutral-100 hover:bg-neutral-200'
                                            : activeButton === 'create'
                                                ? 'bg-neutral-950/50 border-2 border-fuchsia-300/20'
                                                : 'bg-slate-800/50 hover:bg-neutral-800'} flex gap-1`}
                                        variants={buttonVariants}
                                        whileHover="hover"
                                        whileTap="tap"
                                    // onClick={handleCreateWithAI}
                                    >
                                        <Plus size={16} />
                                        <span className="text-base">Create</span>
                                    </motion.button>
                                    <motion.button
                                        className={`px-2 py-1 cursor-pointer rounded-full items-center ${theme === 'light'
                                            ? activeButton === 'edit'
                                                ? 'bg-neutral-200 border-2 border-neutral-500'
                                                : 'bg-neutral-100 hover:bg-neutral-200'
                                            : activeButton === 'edit'
                                                ? 'bg-neutral-950/50 border-2 border-fuchsia-300/20'
                                                : 'bg-slate-800/50 hover:bg-neutral-800'} flex gap-1`}
                                        variants={buttonVariants}
                                        whileHover="hover"
                                        whileTap="tap"
                                    // onClick={handleEditWithAI}
                                    >
                                        <Edit size={16} />
                                        <span className="text-base">Edit</span>
                                    </motion.button>
                                    <motion.button
                                        className={`px-2 py-1 cursor-pointer rounded-full items-center ${theme === 'light'
                                            ? activeButton === 'remove'
                                                ? 'bg-neutral-200 border-2 border-neutral-500'
                                                : 'bg-neutral-100 hover:bg-neutral-200'
                                            : activeButton === 'remove'
                                                ? 'bg-neutral-950/50 border-2 border-fuchsia-300/20'
                                                : 'bg-slate-800/50 hover:bg-neutral-800'} flex gap-1`}
                                        variants={buttonVariants}
                                        whileHover="hover"
                                        whileTap="tap"
                                    // onClick={handleRemoveWithAI}
                                    >
                                        <Trash size={16} />
                                        <span className="text-base">Remove</span>
                                    </motion.button>
                                    {searchQuery && (
                                        <motion.button
                                            onClick={clearSearch}
                                            className={`px-2 py-1 rounded-full ${theme === 'light'
                                                ? 'bg-neutral-100 hover:bg-neutral-200'
                                                : 'bg-slate-800/50 hover:bg-neutral-800'}`}
                                            variants={buttonVariants}
                                            whileHover="hover"
                                            whileTap="tap"
                                        >
                                            <X size={16} />
                                        </motion.button>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="mt-8">
                            {loading ? (
                                <p className={theme === "light" ? "text-neutral-600" : "text-neutral-400"}>Loading partnerships...</p>
                            ) : error ? (
                                <p className="text-neutral-500">{`${partnerships.length == 0 ? "Seems like you're not in any partnership" : "Something went wrong"}`}</p>
                            ) : !currentUser ? (
                                <p className="text-neutral-500">Please log in to view partnerships.</p>
                            ) : (
                                <div>
                                    {filteredPartnership && filteredPartnership.length > 0 ? (
                                        <CollaborationTeamCards partnerships={filteredPartnership} userId={currentUser.id} theme={theme} />
                                    ) : (
                                        <p className="text-neutral-500">No partnerships found.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
            {currentUser && (
                <CreatePartnershipModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onCreate={handleCreateSucess}
                    userId={currentUser.id}
                />
            )}
        </ClientOnly>
    )
}