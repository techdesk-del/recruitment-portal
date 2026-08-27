import React from 'react';
import iconPng from '../assets/urbangaon-icon.png';
import logoPng from '../assets/urbangaon-logo.png';

interface UrbanGaonLogoProps {
  variant?: 'full' | 'icon-only' | 'image-full';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  taglineText?: string;
  theme?: 'dark' | 'light';
  className?: string;
}

export const UrbanGaonIcon: React.FC<{ size?: number | string; className?: string }> = ({ 
  size = 36, 
  className = '' 
}) => {
  const pixelSize = typeof size === 'number' ? `${size}px` : size;
  return (
    <img 
      src={iconPng} 
      alt="UrbanGaon Logo"
      style={{ width: pixelSize, height: pixelSize }}
      className={`rounded-full object-cover shrink-0 select-none shadow-sm ${className}`}
    />
  );
};

export const UrbanGaonLogo: React.FC<UrbanGaonLogoProps> = ({
  variant = 'full',
  size = 'md',
  showTagline = true,
  taglineText = 'a perfect balance',
  theme = 'light',
  className = ''
}) => {
  const iconSizes = {
    sm: 28,
    md: 40,
    lg: 48,
    xl: 60
  };

  const titleSizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  const taglineSizes = {
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-sm',
    xl: 'text-base'
  };

  if (variant === 'icon-only') {
    return <UrbanGaonIcon size={iconSizes[size]} className={className} />;
  }

  if (variant === 'image-full') {
    const heights = {
      sm: 'h-8',
      md: 'h-11',
      lg: 'h-14',
      xl: 'h-16'
    };
    return (
      <img 
        src={logoPng} 
        alt="UrbanGaon - a perfect balance"
        className={`${heights[size]} object-contain select-none rounded-lg ${className}`}
      />
    );
  }

  const textColor = theme === 'dark' ? 'text-white' : 'text-slate-900';
  const taglineColor = theme === 'dark' ? 'text-slate-300' : 'text-slate-600';

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Exact Attached Brand Icon */}
      <div className="relative group">
        <UrbanGaonIcon size={iconSizes[size]} className="drop-shadow-md group-hover:scale-105 transition-transform" />
      </div>

      {/* Brand Typography & Exact Tagline */}
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-1 leading-none">
          <span className={`font-extrabold tracking-tight ${titleSizes[size]} ${textColor} font-sans`}>
            UrbanGaon
          </span>
          <span className={`text-[10px] -mt-1 font-bold ${textColor}`}>
            ®
          </span>
        </div>

        {showTagline && (
          <span className={`font-semibold tracking-wide ${taglineSizes[size]} ${taglineColor} mt-0.5 font-sans lowercase`}>
            {taglineText}
          </span>
        )}
      </div>
    </div>
  );
};
