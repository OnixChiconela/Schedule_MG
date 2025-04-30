"use client"

import { useTheme } from '../themeContext'; 
import { ScaleLoader } from 'react-spinners';

const Loader = () => {
  const { theme } = useTheme();
  const loaderColor = theme === 'light' ? '#a855f7' : '#7e22ce';

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