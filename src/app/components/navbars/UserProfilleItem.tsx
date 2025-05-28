'use client';

import { useTheme } from '@/app/themeContext';
import { ReactNode } from 'react';
import { useState } from 'react';

import { MoreVertical } from 'lucide-react';
import ProfileVisualDropdown from '../ProfileVisualDropdown';
import UserProfileMenuModal from '../modals/UserProfileMenuModal';

interface UserProfileItemProps {
    name: string;
    email?: string;
    imageUrl?: string | undefined;
    icon?: ReactNode | undefined;
    emoji?: string | undefined;
    onVisualChange: (visual: { type: 'image' | 'icon' | 'emoji'; value: string | ReactNode }) => void;
    onSettingsClick: () => void;
    onProfileClick: () => void;
    onLogoutClick: () => void;
}

const UserProfileItem: React.FC<UserProfileItemProps> = ({
    name,
    email,
    imageUrl,
    icon,
    emoji,
    onVisualChange,
    onSettingsClick,
    onProfileClick,
    onLogoutClick,
}) => {
    const { theme } = useTheme();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const getVisual = () => {
        if (imageUrl) {
            return <img src={imageUrl} alt={name} className="w-8 h-8 rounded-full mr-2" />;
        }
        if (icon) {
            return <span className="text-xl mr-2">{icon}</span>;
        }
        return <span className="text-xl mr-2">{emoji || '👤'}</span>;
    };

    return (
        <div className="relative">
            <div
                className={`flex items-center justify-between p-2 rounded-md ${theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-slate-700'}`}
            >
                <div
                    className="flex items-center cursor-pointer"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                    {getVisual()}
                    <span className={` ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`}>
                        {name}
                    </span>
                </div>
                <button
                    className={`p-1 rounded-md ${theme === 'light' ? 'hover:bg-gray-200' : 'hover:bg-slate-600'}`}
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    <MoreVertical size={16} className={theme === 'light' ? 'text-gray-600' : 'text-gray-300'} />
                </button>
            </div>
            <ProfileVisualDropdown
                isOpen={isDropdownOpen}
                onClose={() => setIsDropdownOpen(false)}
                onSelect={onVisualChange}
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
};

export default UserProfileItem;