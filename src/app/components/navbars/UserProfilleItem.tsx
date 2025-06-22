'use client';

import { useTheme } from '@/app/themeContext';
import { ReactNode } from 'react';
import { useState } from 'react';

import { MoreVertical } from 'lucide-react';
import ProfileVisualDropdown from '../ProfileVisualDropdown';
import UserProfileMenuModal from '../modals/UserProfileMenuModal';
import toast from 'react-hot-toast';
import { getAvatarFallback } from '../avatarUtils';
import { updateUserProfile } from '@/app/api/actions/user/updateUserProfile';
import Avatar from '../Avatar';

interface UserProfileItemProps {
  userId: string;
  name: string;
  email?: string;
  visualType?: "emoji" | "initial";
  visualValue?: string;
  onVisualChange: (visual: { type: "emoji" | "initial"; value: string }) => void;
  onSettingsClick: () => void;
  onProfileClick: () => void;
  onLogoutClick: () => void;
}

const UserProfileItem: React.FC<UserProfileItemProps> = ({
  userId,
  name,
  email,
  visualType,
  visualValue,
  onVisualChange,
  onSettingsClick,
  onProfileClick,
  onLogoutClick,
}) => {
  const { theme } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleVisualChange = async (visual: { type: "emoji" | "initial"; value: string }) => {
    try {
      await updateUserProfile(userId, {
        visualType: visual.type,
        visualValue: visual.value,
      });
      onVisualChange(visual);
      setIsDropdownOpen(false);
    } catch (error) {
      toast.error("Failed to update profile visual");
      console.error("Error updating visual:", error);
    }
  };

  // const getVisual = () => {
  //     if (imageUrl) {
  //         return <img src={imageUrl} alt={name} className="w-8 h-8 rounded-full mr-2" />;
  //     }
  //     if (icon) {
  //         return <span className="text-xl mr-2">{icon}</span>;
  //     }
  //     return <span className="text-xl mr-2">{emoji || '👤'}</span>;
  // };

  const getVisual = () => {
    if (visualType === "emoji" && visualValue) {
      return <span className="text-xl mr-2">{visualValue}</span>;
    }
    if (visualType === "initial" && visualValue) {
      return (
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xl font-semibold mr-2"
          style={{ backgroundColor: visualValue }}
        >
          {getAvatarFallback(name)}
        </div>
      );
    }
    // Fallback: letra inicial com cor padrão
    return (
      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-500 text-white text-xl font-semibold mr-2">
        {getAvatarFallback(name)}
      </div>
    );
  };

  return (
    <div className="relative">
      <div
        className={`flex items-center justify-between p-2 rounded-lg ${theme === "light" ? "hover:bg-gray-100" : "hover:bg-gray-700"
          }`}
      >
        <div className="flex items-center gap-1 cursor-pointer" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
          <Avatar
            name={name}
            visualType={visualType}
            visualValue={visualValue}
            size="medium"
          />
          <span className={`${theme === "light" ? "text-gray-800" : "text-gray-100"}`}>{name}</span>
        </div>
        <button
          className={`p-1 rounded-lg ${theme === "light" ? "hover:bg-gray-200" : "hover:bg-gray-700"}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <MoreVertical size={16} className={theme === "light" ? "text-gray-600" : "text-gray-300"} />
        </button>
      </div>
      <ProfileVisualDropdown
        isOpen={isDropdownOpen}
        onClose={() => setIsDropdownOpen(false)}
        onSelect={handleVisualChange}
        emojis={["😊", "🚀", "🌟", "👤", "🎉", "🐱", "🦁", "🌈", "🍎", "💡"]}
        name={name}
      />
      <UserProfileMenuModal
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        name={name}
        email={email}
        visual={getVisual()}
        onSettingsClick={onSettingsClick}
        onProfileClick={onProfileClick}
        onLogoutClick={onLogoutClick}
      />
    </div>
  );

  // return (
  //     <div className="relative">
  //         <div
  //             className={`flex items-center justify-between p-2 rounded-md ${theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-slate-700'}`}
  //         >
  //             <div
  //                 className="flex items-center cursor-pointer"
  //                 onClick={() => setIsDropdownOpen(!isDropdownOpen)}
  //             >
  //                 {getVisual()}
  //                 <span className={` ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`}>
  //                     {name}
  //                 </span>
  //             </div>
  //             <button
  //                 className={`p-1 rounded-md ${theme === 'light' ? 'hover:bg-gray-200' : 'hover:bg-slate-600'}`}
  //                 onClick={() => setIsMenuOpen(!isMenuOpen)}
  //             >
  //                 <MoreVertical size={16} className={theme === 'light' ? 'text-gray-600' : 'text-gray-300'} />
  //             </button>
  //         </div>
  //         <ProfileVisualDropdown
  //             isOpen={isDropdownOpen}
  //             onClose={() => setIsDropdownOpen(false)}
  //             onSelect={onVisualChange}
  //         />
  //         <UserProfileMenuModal
  //             isOpen={isMenuOpen}
  //             onClose={() => setIsMenuOpen(false)}
  //             name={name}
  //             email={email}
  //             visual={getVisual()}
  //             onSettingsClick={onSettingsClick}
  //             onProfileClick={onProfileClick}
  //             onLogoutClick={onLogoutClick}
  //         />
  //     </div>
  // );
};

export default UserProfileItem;