"use client"

import { useTheme } from '../themeContext'; 
import { ScaleLoader } from 'react-spinners';

const Loader = () => {
  const { theme } = useTheme();
  const loaderColor = theme === 'light' ? '#ff6a00' : '#60a5fa';

  return (
    <div
      className={`
        h-screen
        flex
        flex-col
        justify-center
        items-center
        ${theme === 'light' ? 'bg-gray-100' : 'bg-slate-900'}
      `}
    >
      <ScaleLoader
        height={50}
        width={10}
        color={loaderColor}
        speedMultiplier={1.2}
        radius={20}
      />
    </div>
  );
};

export default Loader;