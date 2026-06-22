import React, { useState } from 'react';

interface AvatarProps {
  src?: string;
  name?: string;
  className?: string; // e.g. "w-9 h-9"
}

export const Avatar: React.FC<AvatarProps> = ({ src, name = 'User', className = 'w-9 h-9' }) => {
  const [imgFailed, setImgFailed] = useState(false);

  // Compute initials
  const parts = name.trim().split(/\s+/);
  let initials = '';
  if (parts.length > 0) {
    if (parts.length === 1) {
      initials = parts[0].substring(0, 2).toUpperCase();
    } else {
      initials = (parts[0][0] + (parts[parts.length - 1]?.[0] || '')).toUpperCase();
    }
  }
  if (!initials) initials = 'U';

  // Compute a professional background color based on name
  const colors = [
    'bg-indigo-50 text-indigo-700 border-indigo-100',
    'bg-emerald-50 text-emerald-700 border-emerald-100',
    'bg-teal-50 text-teal-700 border-teal-100',
    'bg-blue-50 text-blue-700 border-blue-100',
    'bg-purple-50 text-purple-700 border-purple-100',
    'bg-amber-50 text-amber-700 border-amber-100',
    'bg-rose-50 text-rose-700 border-rose-100',
    'bg-sky-50 text-sky-700 border-sky-100',
  ];

  let sum = 0;
  for (let i = 0; i < name.length; i++) {
    sum += name.charCodeAt(i);
  }
  const colorClass = colors[sum % colors.length];

  if (src && !imgFailed) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setImgFailed(true)}
        referrerPolicy="no-referrer"
        className={`${className} rounded-full border border-slate-200 shadow-3xs object-cover shrink-0`}
      />
    );
  }

  // Adjust text size based on className height / width (usually text-xs works great for w-9 h-9, let's auto scale slightly if needed)
  let textSize = 'text-[11px]';
  if (className.includes('w-12') || className.includes('h-12')) {
    textSize = 'text-sm';
  } else if (className.includes('w-14') || className.includes('h-14') || className.includes('w-16') || className.includes('w-20')) {
    textSize = 'text-lg';
  } else if (className.includes('w-6') || className.includes('h-6') || className.includes('w-7') || className.includes('h-7') || className.includes('w-8') || className.includes('h-8')) {
    textSize = 'text-[9px]';
  }

  return (
    <div
      className={`${className} rounded-full border flex items-center justify-center font-sans font-extrabold tracking-tight select-none shrink-0 ${textSize} ${colorClass} shadow-3xs`}
    >
      {initials}
    </div>
  );
};
