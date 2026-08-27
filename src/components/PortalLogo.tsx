import React from 'react';
import { CandidateSource } from '../types';

import urbangaonImg from '../assets/urbangaon-icon.jpg';
import naukriImg from '../assets/naukri-logo.png';
import indeedImg from '../assets/indeed-logo.png';
import apnaImg from '../assets/apna-logo.jpg';

interface PortalLogoProps {
  source: CandidateSource | string;
  size?: number | string;
  className?: string;
}

// Exact official UrbanGaon icon attached by user
export const UrbanGaonPortalLogo: React.FC<{ size?: number | string; className?: string }> = ({ 
  size = 20, 
  className = '' 
}) => {
  const pixelSize = typeof size === 'number' ? `${size}px` : size;
  return (
    <img 
      src={urbangaonImg} 
      alt="UrbanGaon" 
      style={{ width: pixelSize, height: pixelSize }}
      className={`rounded-full object-cover shrink-0 select-none ${className}`}
    />
  );
};

// Exact official Naukri logo attached by user
export const NaukriLogo: React.FC<{ size?: number | string; className?: string }> = ({ 
  size = 20, 
  className = '' 
}) => {
  const pixelSize = typeof size === 'number' ? `${size}px` : size;
  return (
    <img 
      src={naukriImg} 
      alt="Naukri.com" 
      style={{ width: pixelSize, height: pixelSize }}
      className={`rounded-full object-cover shrink-0 select-none ${className}`}
    />
  );
};

// Exact official Indeed logo attached by user
export const IndeedLogo: React.FC<{ size?: number | string; className?: string }> = ({ 
  size = 20, 
  className = '' 
}) => {
  const pixelSize = typeof size === 'number' ? `${size}px` : size;
  return (
    <div 
      style={{ width: pixelSize, height: pixelSize }} 
      className={`rounded-md overflow-hidden bg-white shrink-0 flex items-center justify-center p-0.5 border border-slate-100 ${className}`}
    >
      <img 
        src={indeedImg} 
        alt="Indeed" 
        className="w-full h-full object-contain select-none"
      />
    </div>
  );
};

// Exact official Apna.co logo attached by user
export const ApnaLogo: React.FC<{ size?: number | string; className?: string }> = ({ 
  size = 20, 
  className = '' 
}) => {
  const pixelSize = typeof size === 'number' ? `${size}px` : size;
  return (
    <img 
      src={apnaImg} 
      alt="Apna.co" 
      style={{ width: pixelSize, height: pixelSize }}
      className={`rounded-md object-cover shrink-0 select-none border border-slate-100 ${className}`}
    />
  );
};

// Official LinkedIn Logo
export const LinkedInLogo: React.FC<{ size?: number | string; className?: string }> = ({ 
  size = 20, 
  className = '' 
}) => {
  const pixelSize = typeof size === 'number' ? `${size}px` : size;
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: pixelSize, height: pixelSize }}
      className={`shrink-0 select-none rounded-md ${className}`}
    >
      <rect width="24" height="24" rx="4.5" fill="#0A66C2" />
      <path 
        d="M19 19H16.27V14.73C16.27 13.71 16.25 12.4 14.85 12.4C13.43 12.4 13.21 13.51 13.21 14.65V19H10.48V10.27H13.1V11.46H13.14C13.5 10.77 14.39 10.04 15.71 10.04C18.46 10.04 18.97 11.85 18.97 14.21V19H19ZM7.46 9.07C6.58 9.07 5.88 8.36 5.88 7.49C5.88 6.61 6.59 5.9 7.46 5.9C8.34 5.9 9.04 6.61 9.04 7.49C9.04 8.36 8.33 9.07 7.46 9.07ZM8.82 19H6.1V10.27H8.82V19Z" 
        fill="#FFFFFF" 
      />
    </svg>
  );
};

// Official Internshala Logo
export const InternshalaLogo: React.FC<{ size?: number | string; className?: string }> = ({ 
  size = 20, 
  className = '' 
}) => {
  const pixelSize = typeof size === 'number' ? `${size}px` : size;
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: pixelSize, height: pixelSize }}
      className={`shrink-0 select-none rounded-md ${className}`}
    >
      <rect width="24" height="24" rx="4.5" fill="#1295D8" />
      <path 
        d="M5 12L19 6L14.5 18.5L11.5 13.5L5 12Z" 
        fill="#FFFFFF" 
      />
    </svg>
  );
};

// Referral Logo
export const ReferralLogo: React.FC<{ size?: number | string; className?: string }> = ({ 
  size = 20, 
  className = '' 
}) => {
  const pixelSize = typeof size === 'number' ? `${size}px` : size;
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: pixelSize, height: pixelSize }}
      className={`shrink-0 select-none rounded-md ${className}`}
    >
      <rect width="24" height="24" rx="4.5" fill="#8B5CF6" />
      <path 
        d="M16 11C17.1 11 18 10.1 18 9C18 7.9 17.1 7 16 7C14.9 7 14 7.9 14 9C14 10.1 14.9 11 16 11ZM8 11C9.1 11 10 10.1 10 9C10 7.9 9.1 7 8 7C6.9 7 6 7.9 6 9C6 10.1 6.9 11 8 11ZM8 13C6.3 13 3 13.9 3 15.5V17H13V15.5C13 13.9 9.7 13 8 13ZM16 13C15.7 13 15.3 13.05 14.9 13.12C15.9 13.8 16.5 14.7 16.5 15.5V17H21V15.5C21 13.9 17.7 13 16 13Z" 
        fill="#FFFFFF" 
      />
    </svg>
  );
};

// Main Unified Sourcing Portal Logo Component
export const PortalLogo: React.FC<PortalLogoProps> = ({ 
  source, 
  size = 20, 
  className = '' 
}) => {
  switch (source.toLowerCase()) {
    case 'urbangaon':
      return <UrbanGaonPortalLogo size={size} className={className} />;
    case 'linkedin':
      return <LinkedInLogo size={size} className={className} />;
    case 'naukri':
      return <NaukriLogo size={size} className={className} />;
    case 'indeed':
      return <IndeedLogo size={size} className={className} />;
    case 'apna':
      return <ApnaLogo size={size} className={className} />;
    case 'internshala':
      return <InternshalaLogo size={size} className={className} />;
    case 'referral':
      return <ReferralLogo size={size} className={className} />;
    default:
      return (
        <span 
          style={{ width: size, height: size }} 
          className={`inline-flex items-center justify-center bg-slate-200 text-slate-700 text-xs font-bold rounded ${className}`}
        >
          {source.charAt(0).toUpperCase()}
        </span>
      );
  }
};
