import React, { useId } from 'react';

// Modern brand mark for "MORE Applications GmbH":
// a rounded square with an indigo→cyan gradient and a geometric white "M".
export const MoreLogo = ({ className = "" }) => {
  const rawId = useId();
  const gid = rawId.replace(/:/g, '');
  return (
    <svg
      className={className}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="MORE Applications"
    >
      <defs>
        <linearGradient id={`g-${gid}`} x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#6366F1" />
          <stop offset="0.55" stopColor="#4F46E5" />
          <stop offset="1" stopColor="#22D3EE" />
        </linearGradient>
      </defs>
      <rect x="8" y="8" width="184" height="184" rx="42" fill={`url(#g-${gid})`} />
      {/* Geometric "M" */}
      <path
        d="M52 146 V70 L100 116 L148 70 V146"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="18"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* app dot */}
      <circle cx="100" cy="150" r="9" fill="#A5F3FC" />
    </svg>
  );
};

// Backward-compatible alias so all existing imports keep working after the rebrand.
export const TdataLogo = MoreLogo;
export default MoreLogo;
