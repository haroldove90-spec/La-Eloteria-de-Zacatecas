/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BarChart3, ShoppingCart, Beef, BookOpen, Users, ClipboardCheck, Clock, Layers } from 'lucide-react';
import { Role } from '../types';

interface SidebarProps {
  sidebarOpen: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentRole: Role;
}

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: Role[];
}

export default function Sidebar({ sidebarOpen, activeTab, setActiveTab, currentRole }: SidebarProps) {
  // Staff shouldn't see sidebar since they only have access to Clock-In screen
  if (currentRole === 'staff') return null;

  const menuItems: SidebarItem[] = [
    { id: 'dashboard', label: 'Estadísticas', icon: BarChart3, roles: ['admin', 'gerente'] },
    { id: 'pos', label: 'Punto de Venta POS', icon: ShoppingCart, roles: ['admin', 'gerente', 'cajero'] },
    { id: 'inventario', label: 'Inventario / Traspasos', icon: Layers, roles: ['admin', 'gerente'] },
    { id: 'menu', label: 'Menú y Recetas', icon: BookOpen, roles: ['admin'] },
    { id: 'personal', label: 'Empleados / Alianzas', icon: Users, roles: ['admin', 'gerente'] },
    { id: 'cortes', label: 'Cortes de Caja', icon: ClipboardCheck, roles: ['admin', 'gerente', 'cajero'] },
    { id: 'asistencia', label: 'Reloj Checador', icon: Clock, roles: ['admin', 'gerente', 'cajero'] },
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(currentRole));

  return (
    <aside
      className={`fixed top-16 left-0 h-[calc(100vh-4rem)] bg-[#155E37] border-r border-[#1c7a48]/40 transition-all duration-300 z-30 shadow-xl overflow-y-auto hidden md:block ${
        sidebarOpen ? 'w-64' : 'w-20'
      }`}
      id="sidebar_nav"
    >
      <div className="flex flex-col h-full justify-between p-4">
        <div className="space-y-1.5">
          <p className={`text-[10px] font-bold text-[#FBBF24] opacity-75 uppercase font-mono tracking-widest mb-4 px-3 select-none leading-none ${!sidebarOpen && 'scale-0 h-0 my-0 overflow-hidden'}`}>
            Módulos Autorizados
          </p>

          <nav className="space-y-1">
            {filteredItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  id={`side_tab_${item.id}`}
                  className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-lg text-xs md:text-sm transition-all relative ${
                    isActive
                      ? 'bg-[#FBBF24] text-[#155E37] font-bold shadow-md'
                      : 'text-white opacity-80 hover:bg-[#1C7A48] hover:opacity-100 hover:text-white'
                  }`}
                  title={item.label}
                >
                  <div className={`p-1 rounded-md shrink-0 ${isActive ? 'text-[#155E37]' : 'text-white/80'}`}>
                    <Icon className="w-4 h-4 md:w-5 md:h-5" />
                  </div>

                  <span className={`truncate transition-opacity duration-300 ${!sidebarOpen ? 'md:hidden opacity-0 w-0' : 'opacity-100'}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer info in Sidebar */}
        <div className={`border-t border-[#1C7A48] pt-4 flex flex-col gap-1 text-[10px] text-white/60 font-mono select-none px-2 ${!sidebarOpen && 'hidden md:hidden'}`}>
          <p className="font-bold text-[#FBBF24] opacity-90 text-center">La Elotería de Zacatecas</p>
          <p className="text-center">Soporte: 492-921-ELOTE</p>
        </div>
      </div>
    </aside>
  );
}
