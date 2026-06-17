/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function Logo({ className = '', showText = true, size = 'md' }: LogoProps) {
  const getDims = () => {
    switch (size) {
      case 'sm': return { width: 32, height: 32 };
      case 'lg': return { width: 80, height: 80 };
      default: return { width: 48, height: 48 };
    }
  };

  const dims = getDims();

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Interactive Custom SVG Mascot matching the uploaded Logo */}
      <svg
        width={dims.width}
        height={dims.height}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-md select-none transition-transform duration-300 hover:scale-105"
        id="elote_logo_svg"
      >
        {/* Background Blue Aura Ring */}
        <circle cx="50" cy="50" r="42" fill="#0096FF" fillOpacity="0.15" stroke="#FFFFFF" strokeWidth="2" />
        <circle cx="50" cy="50" r="36" fill="#0082C8" />

        {/* Corn Leaves / Husks (Green) in Background */}
        <path d="M22 65C30 50 40 40 48 65C38 75 28 75 22 65Z" fill="#2E7D32" />
        <path d="M78 65C70 50 60 40 52 65C62 75 72 75 78 65Z" fill="#2E7D32" />
        <path d="M35 78C42 62 50 60 52 80C45 85 38 85 35 78Z" fill="#4CAF50" />
        <path d="M65 78C58 62 50 60 48 80C55 85 62 85 65 78Z" fill="#4CAF50" />

        {/* Corn Body (Bright Yellow with grain texture) */}
        <ellipse cx="50" cy="55" rx="14" ry="22" fill="#FFC72C" />
        {/* Grain grid detail lines */}
        <path d="M42 42C44 50 44 60 42 68 M47 38C50 48 50 62 47 72 M53 38C50 48 50 62 53 72 M58 42C56 50 56 60 58 68" stroke="#F5A623" strokeWidth="1" strokeDasharray="2 3" />

        {/* Sombrero Hat (Charming Brown & Golden Embroidery) */}
        {/* Sombrero Base Crown */}
        <path d="M32 30C32 12 68 12 68 30H32Z" fill="#5C3A21" stroke="#FFC300" strokeWidth="1.5" />
        {/* Sombrero Ribbon */}
        <path d="M32 29C38 31 62 31 68 29V25C62 27 38 27 32 25V29Z" fill="#155E37" />
        {/* Sombrero Brim */}
        <ellipse cx="50" cy="31" rx="26" ry="6" fill="#624A3F" stroke="#FBBF24" strokeWidth="2" />
        {/* Sombrero Embroidery Loops */}
        <path d="M26 31C28 29 32 29 34 31 M38 31C40 29 44 29 46 31 M54 31C56 29 60 29 62 31 M66 31C68 29 72 29 74 31" stroke="#FBBF24" strokeWidth="1" fill="none" />

        {/* Happy Eyes (Big anime style eyes matching the original) */}
        <ellipse cx="45" cy="48" rx="3.5" ry="5.5" fill="#FFFFFF" />
        <ellipse cx="55" cy="48" rx="3.5" ry="5.5" fill="#FFFFFF" />
        <ellipse cx="44.5" cy="47.5" rx="2" ry="3.5" fill="#1E1E1C" />
        <ellipse cx="54.5" cy="47.5" rx="2" ry="3.5" fill="#1E1E1C" />
        <circle cx="43.5" cy="45.5" r="1" fill="#FFFFFF" />
        <circle cx="53.5" cy="45.5" r="1" fill="#FFFFFF" />

        {/* Wide Grinning Mouth & Pink Tongue */}
        <path d="M40 54C42 62 58 62 60 54H40Z" fill="#1E1E1C" />
        <path d="M43 57.5C45 61 55 61 57 57.5C53 56 47 56 43 57.5Z" fill="#FF5E7E" />
        <path d="M40 54M40 54C45 52 55 52 60 54" stroke="#1E1E1C" strokeWidth="1" fill="none" />

        {/* Cheerful Red Arms (Red outline/gloves) */}
        {/* Left Arm */}
        <path d="M30 58C22 55 20 62 26 64" stroke="#1E1E1C" strokeWidth="1.5" fill="none" />
        <circle cx="21" cy="56" r="4.5" fill="#155E37" stroke="#FFFFFF" strokeWidth="1" />
        {/* Right Arm */}
        <path d="M70 58C78 55 80 62 74 64" stroke="#1E1E1C" strokeWidth="1.5" fill="none" />
        <circle cx="79" cy="56" r="4.5" fill="#155E37" stroke="#FFFFFF" strokeWidth="1" />
      </svg>

      {showText && (
        <div className="flex flex-col select-none">
          <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#155E37] via-[#1C7A48] to-[#FBBF24] leading-none text-lg md:text-xl font-sans tracking-tight uppercase">
            LA ELOTERÍA
          </span>
          <span className="font-semibold text-xs tracking-widest text-[#155E37] uppercase font-mono mt-0.5">
            DE ZACATECAS
          </span>
        </div>
      )}
    </div>
  );
}
