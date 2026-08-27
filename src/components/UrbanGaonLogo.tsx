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
      alt="UrbanGaon Icon"
      style={{ width: pixelSize, height: pixelSize }}
      className={`rounded-full object-cover shrink-0 select-none ${className}`}
    />
  );
};

export const UrbanGaonLogo: React.FC<UrbanGaonLogoProps> = ({
  variant = 'full',
  size = 'md',
  className = ''
}) => {
  const heights = {
    sm: 'h-7',
    md: 'h-10',
    lg: 'h-12',
    xl: 'h-16'
  };

  if (variant === 'icon-only') {
    const iconSizes = { sm: 28, md: 38, lg: 48, xl: 60 };
    return <UrbanGaonIcon size={iconSizes[size]} className={className} />;
  }

  // Exact attached logo image with exact mark and tagline
  return (
    <img 
      src={logoPng} 
      alt="UrbanGaon® a perfect balance"
      className={`${heights[size]} w-auto object-contain select-none ${className}`}
    />
  );
};
