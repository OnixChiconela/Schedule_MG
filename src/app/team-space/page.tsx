'use client';

import { useRouter } from 'next/navigation';
import ClientOnly from '../components/ClientOnly';
import SideNavbar from '../components/navbars/SideNavbar';
import { useTheme } from '../themeContext';
import { motion } from 'framer-motion';
import Navbar from '../components/navbars/Navbar';
import { useEffect, useState } from 'react';
import { Edit, MoreHorizontal, Plus, Sparkles, Trash, X } from 'lucide-react';
import TeamCards, { Team } from '../components/teams/TeamCards';
import CreateTeamModal from '../components/teams/CreateTeamModal';
import { getTeamSpace } from '../api/actions/teams/getTeamSpace';

export default function TeamSpace() {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [activeButton, setActiveButton] = useState<'create' | 'edit' | 'remove' | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const userId = '6836d333b32f9e7199d4c265';

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await getTeamSpace(userId);
        console.log('Fetched teams with nonces:', response);
        const teamsWithNonces = response.map((team: any) => ({
          ...team,
          nameNonce: team.nameNonce || '',
          descriptionNonce: team.descriptionNonce || '', // Garantir que descriptionNonce esteja presente
          description: team.description || '', // Garantir que description esteja presente
        }));
        setTeams(teamsWithNonces);
      } catch (error) {
        console.error('Error fetching teams:', error);
        setError('Failed to load teams. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchTeams();
  }, [userId]);

  const filteredTeams = teams.filter((team) => {
    const teamName = team.encryptedName || '';
    console.log(`Filtering team ${team.id}: ${teamName}`);
    return teamName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95 },
  };

  const handleCreateSuccess = (newTeam: Team) => {
    setTeams([...teams, newTeam]); // newTeam já inclui nameNonce e descriptionNonce
    setIsCreateModalOpen(false);
  };

  const handleCreateWithAI = () => {
    setActiveButton(activeButton === 'create' ? null : 'create');
    if (activeButton !== 'create') {
      setSearchQuery('');
      console.log('Edit team with query:', searchQuery);
    }
  };

  const handleEditWithAI = () => {
    setActiveButton(activeButton === 'edit' ? null : 'edit');
    if (activeButton !== 'edit') {
      setSearchQuery('');
      console.log('Edit team with query:', searchQuery);
    }
  };

  const handleRemoveWithAI = () => {
    setActiveButton(activeButton === 'remove' ? null : 'remove');
    if (activeButton !== 'remove') {
      setSearchQuery('');
      console.log('Remove team with query:', searchQuery);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setActiveButton(null);
  };

  return (
    <ClientOnly>
      <Navbar
        themeButton={false}
        showToggleSidebarButton={true}
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
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
            <div className="flex items-center justify-between">
              <h1
                className={`text-2xl font-semibold ${theme === 'light' ? 'text-neutral-800' : 'text-neutral-200'}`}
              >
                Teams
              </h1>
              <div
                className={`flex gap-2 ${theme === 'light' ? 'text-neutral-800' : 'text-neutral-200'}`}
              >
                <motion.button
                  className={`p-2 cursor-pointer rounded-full items-center ${theme === 'light'
                    ? 'bg-neutral-100 hover:bg-neutral-200'
                    : 'bg-slate-800/50 hover:bg-neutral-800'}`}
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Sparkles />
                </motion.button>
                <motion.button
                  className={`p-2 cursor-pointer rounded-full items-center ${theme === 'light'
                    ? 'bg-neutral-100 hover:bg-neutral-200'
                    : 'bg-slate-800/50 hover:bg-neutral-800'}`}
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={() => setIsCreateModalOpen(true)}
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
                >
                  more <MoreHorizontal />
                </motion.button>
              </div>
            </div>
            <div className="flex justify-center px-20">
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
                      : 'Search or enter command (e.g., "delete where user X exists")...'
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
                <div className="flex gap-1 mt-1">
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
                    onClick={handleCreateWithAI}
                  >
                    <Plus size={16} />
                    <span className="text-sm">Create</span>
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
                    onClick={handleEditWithAI}
                  >
                    <Edit size={16} />
                    <span className="text-sm">Edit</span>
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
                    onClick={handleRemoveWithAI}
                  >
                    <Trash size={16} />
                    <span className="text-sm">Remove</span>
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
            <div className="mt-12">
              {loading ? (
                <p className={theme === 'light' ? 'text-neutral-600' : 'text-neutral-400'}>Loading teams...</p>
              ) : error ? (
                <p className="text-red-500">{error}</p>
              ) : (
                <TeamCards
                  teams={filteredTeams}
                  userId={userId}
                  theme={theme}
                  onSelectTeam={(team) => setSelectedTeam(team)}
                />
              )}
            </div>
          </div>
        </main>
      </div>
      <CreateTeamModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateSuccess}
        userId={userId}
      />
    </ClientOnly>
  );
}