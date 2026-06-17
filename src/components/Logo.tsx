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
  // Let's determine dimensions based on size, keeping them generous as requested.
  const getDims = () => {
    switch (size) {
      case 'sm': return { height: 'h-8 md:h-10', img: 'https://appdesignproyectos.com/laeloterialogo.png' };
      case 'lg': return { height: 'h-24 md:h-32', img: 'https://appdesignproyectos.com/laeloteria.png' };
      default: return { height: 'h-14 md:h-18', img: 'https://appdesignproyectos.com/laeloteria.png' };
    }
  };

  const config = getDims();

  return (
    <div className={`flex items-center gap-3 ${className}`} id="app_logo_container">
      <img
        src={config.img}
        alt="La Elotería de Zacatecas"
        referrerPolicy="no-referrer"
        className={`${config.height} w-auto object-contain transition-transform duration-300 hover:scale-105`}
        id="app_logo_image"
      />
    </div>
  );
}
