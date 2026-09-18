import React, { useState } from 'react';

interface FlagProps {
  iso: string;
  name?: string;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

export const Flag: React.FC<FlagProps> = ({
  iso,
  name = 'Country Flag',
  className = '',
  size = 'sm',
}) => {
  const [error, setError] = useState(false);

  const sizeClasses = {
    xs: 'w-4 h-3',
    sm: 'w-5 h-3.5',
    md: 'w-6 h-4',
    lg: 'w-7 h-5',
  }[size] || 'w-5 h-3.5';

  if (!iso || error) {
    return (
      <span
        className={`inline-block rounded-xs bg-slate-200 text-[10px] text-center font-bold text-slate-600 ${sizeClasses} ${className}`}
      >
        {iso?.toUpperCase()?.slice(0, 2) || '🏳️'}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 overflow-hidden rounded-xs shadow-2xs border border-slate-200/80 bg-slate-50 ${sizeClasses} ${className}`}
    >
      <img
        src={`https://flagcdn.com/w40/${iso.toLowerCase()}.png`}
        alt={name}
        onError={() => setError(true)}
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </span>
  );
};
