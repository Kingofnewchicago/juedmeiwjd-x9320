import React from 'react';

// Classic, serious emblem for the "Tdata" brand (public site + employee panel):
// a calm sage-green square with a serif "T".
export const TdataLogo = ({ className = "" }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Tdata"
    >
      <rect x="10" y="10" width="180" height="180" rx="14" fill="#659A65" />
      <rect x="10" y="10" width="180" height="180" rx="14" fill="none" stroke="#507D50" strokeWidth="3" />
      <g fill="#FFFFFF">
        <rect x="46" y="52" width="108" height="20" rx="2" />
        <rect x="90" y="52" width="20" height="96" rx="2" />
        <rect x="74" y="140" width="52" height="12" rx="2" />
        <rect x="46" y="52" width="12" height="16" rx="2" />
        <rect x="142" y="52" width="12" height="16" rx="2" />
      </g>
    </svg>
  );
};
