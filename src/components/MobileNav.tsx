/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BarChart3, ShoppingCart, BookOpen, Users, ClipboardCheck, Clock, Layers } from 'lucide-react';
import { Role } from '../types';

interface MobileNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentRole: Role;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: Role[];
}

export default function MobileNav({ activeTab, setActiveTab, currentRole }: MobileNavProps) {
  // Staff do not see navigation panels, they are forced to the Clock-In screen
  if (currentRole === 'staff') return null;

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Estadísticas', icon: BarChart3, roles: ['admin', 'gerente'] },
    { id: 'pos', label: 'POS Venta', icon: ShoppingCart, roles: ['admin', 'gerente', 'cajero'] },
    { id: 'inventario', label: 'Inventario', icon: Layers, roles: ['admin', 'gerente'] },
    { id: 'menu', label: 'Menú', icon: BookOpen, roles: ['admin'] },
    { id: 'personal', label: 'Personas', icon: Users, roles: ['admin', 'gerente'] },
    { id: 'cortes', label: 'Cortes', icon: ClipboardCheck, roles: ['admin', 'gerente', 'cajero'] },
    { id: 'asistencia', label: 'Reloj', icon: Clock, roles: ['admin', 'gerente', 'cajero'] },
  ];

  const filteredItems = navItems.filter(item => item.roles.includes(currentRole));

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-100 flex items-center justify-around px-2 pb-safe z-40 md:hidden shadow-[0_-2px_10px_rgba(0,0,0,0.05)]"
      id="mobile_bottom_nav"
    >
      {filteredItems.map(item => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            id={`mob_tab_${item.id}`}
            className="flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition"
          >
            <div
              className={`p-1.5 rounded-lg transition-transform duration-200 ${
                isActive
                  ? 'bg-[#155E37]/10 text-[#155E37] scale-110'
                  : 'text-gray-400'
              }`}
            >
              <Icon className="w-5 h-5" />
            </div>
            <span
              className={`text-[9px] font-medium tracking-tight mt-0.5 truncate max-w-[50px] leading-none ${
                isActive ? 'text-[#155E37] font-bold' : 'text-gray-500'
              }`}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
