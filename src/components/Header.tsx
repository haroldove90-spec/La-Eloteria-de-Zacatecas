/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Menu, User, Shield, Users, Clock, ShoppingCart, BarChart3, HelpCircle, ChevronDown } from 'lucide-react';
import { Role, Employee, Branch, ClockInLog } from '../types';
import Logo from './Logo';

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  currentRole: Role;
  setCurrentRole: (role: Role) => void;
  currentEmployee: Employee;
  setCurrentEmployee: (emp: Employee) => void;
  currentBranchId: string;
  setCurrentBranchId: (branchId: string) => void;
  employees: Employee[];
  branches: Branch[];
  clockIns: ClockInLog[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onInstall?: () => void;
}

export default function Header({
  sidebarOpen,
  setSidebarOpen,
  currentRole,
  setCurrentRole,
  currentEmployee,
  setCurrentEmployee,
  currentBranchId,
  setCurrentBranchId,
  employees,
  branches,
  clockIns,
  activeTab,
  setActiveTab,
  onInstall,
}: HeaderProps) {
  const [showSimulator, setShowSimulator] = useState(false);

  // Filter employees for role selection
  const handleRoleChange = (role: Role) => {
    setCurrentRole(role);
    // Auto-select first active employee with that role
    const matching = employees.find(e => e.role === role && e.active);
    if (matching) {
      setCurrentEmployee(matching);
      if (role === 'admin') {
        setCurrentBranchId('all');
        setActiveTab('dashboard');
      } else {
        setCurrentBranchId(matching.branchId);
        setActiveTab(role === 'staff' ? 'asistencia' : role === 'cajero' ? 'pos' : 'dashboard');
      }
    }
    setShowSimulator(false);
  };

  const handleEmployeeChange = (empId: string) => {
    const emp = employees.find(e => e.id === empId);
    if (emp) {
      setCurrentEmployee(emp);
      setCurrentRole(emp.role);
      if (emp.role === 'admin') {
        setCurrentBranchId('all');
        setActiveTab('dashboard');
      } else {
        setCurrentBranchId(emp.branchId);
        setActiveTab(emp.role === 'staff' ? 'asistencia' : emp.role === 'cajero' ? 'pos' : 'dashboard');
      }
    }
    setShowSimulator(false);
  };

  const getRoleBadgeColor = (role: Role) => {
    switch (role) {
      case 'admin': return 'bg-[#155E37] text-white';
      case 'gerente': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'cajero': return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'staff': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: Role) => {
    switch (role) {
      case 'admin': return '👑';
      case 'gerente': return '🏢';
      case 'cajero': return '🛒';
      case 'staff': return '⏱️';
    }
  };

  const getRoleLabel = (role: Role) => {
    switch (role) {
      case 'admin': return 'Dueño / Admin';
      case 'gerente': return 'Supervisor / Gerente';
      case 'cajero': return 'Cajero';
      case 'staff': return 'Preparación (Staff)';
    }
  };

  const getActiveClockInCount = () => {
    return clockIns.filter(c => !c.clockOut).length;
  };

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between w-full h-16 px-4 bg-white border-b border-gray-100 shadow-sm md:px-6">
      <div className="flex items-center gap-3">
        {/* Hamburger Menu - visible on fullscreen and tablet (not mobile where bottom nav is fixed) */}
        {currentRole !== 'staff' && (
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 focus:outline-none"
            aria-label="Menu"
            id="hamburger_btn"
          >
            <Menu className="w-6 h-6" />
          </button>
        )}
        <Logo size="sm" />
      </div>

      {/* Center banner with active Branch info */}
      <div className="hidden lg:flex items-center gap-2 text-xs text-gray-500 font-mono">
        <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
        <span>Zacatecas:</span>
        <span className="font-semibold text-gray-800">
          {currentBranchId === 'all'
            ? 'Visión Multi-Sucursal'
            : branches.find(b => b.id === currentBranchId)?.name || 'Sucursal Seleccionada'}
        </span>
      </div>

      {/* Role Switcher & User profile */}
      <div className="flex items-center gap-3">
        {onInstall && (
          <button
            onClick={onInstall}
            className="flex items-center gap-1.5 bg-[#155E37] text-white hover:bg-[#0E4025] px-3 py-1.5 rounded-full text-xs font-bold transition shadow-sm cursor-pointer"
            title="Instalar aplicación"
            id="pwa_install_nav_btn"
          >
            <span>📱</span>
            <span className="hidden xs:inline">Instalar App</span>
          </button>
        )}

        {/* Global Cerrar Sesion Button */}
        {activeTab !== 'home' && (
          <button
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-1.5 rounded-full text-xs font-extrabold transition shadow-md cursor-pointer border border-rose-700 anim-pulse animate-fadeIn"
            title="Cerrar sesión y volver al Portal de Inicio"
            id="global_logout_header_btn"
          >
            <span>🚪</span>
            <span className="hidden sm:inline">Cerrar Sesión</span>
            <span className="sm:hidden">Salir</span>
          </button>
        )}

        <div className="relative">
          {/* Active Sim Badge */}
          <button
            onClick={() => setShowSimulator(!showSimulator)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border border-gray-200 shadow-sm bg-stone-50 hover:bg-stone-100 text-stone-700 transition"
            id="sim_switch_btn"
          >
            <Shield className="w-3.5 h-3.5 text-[#155E37]" />
            <span className="hidden sm:inline">Simulador:</span>
            <span className="font-bold flex items-center gap-1 text-[#155E37]">
              {getRoleIcon(currentRole)} {currentRole.toUpperCase()}
            </span>
            <ChevronDown className="w-3 h-3 text-stone-500" />
          </button>

          {/* Simulator Panel - Floating Modal Dropdown */}
          {showSimulator && (
            <div className="absolute right-0 mt-2 w-72 md:w-80 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-50 animate-fadeIn" id="sim_panel">
              <div className="bg-[#155E37] text-white p-3.5">
                <h4 className="font-bold text-sm tracking-tight flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#FBBF24]" />
                  Cambiar Rol o Empleado
                </h4>
                <p className="text-[11px] text-amber-100 mt-1 font-sans leading-tight">
                  Toca cualquier rol para simular sus vistas, permisos de caja, inventarios y el reloj checador.
                </p>
              </div>

              <div className="p-3 max-h-96 overflow-y-auto space-y-3">
                {/* Roles Selector Row */}
                <div className="grid grid-cols-2 gap-1.5">
                  {(['admin', 'gerente', 'cajero', 'staff'] as Role[]).map(r => (
                    <button
                      key={r}
                      onClick={() => handleRoleChange(r)}
                      className={`p-2 rounded-lg text-left text-xs border transition flex flex-col justify-between h-14 ${
                        currentRole === r
                          ? 'border-[#155E37] bg-green-50/50 text-[#155E37] font-bold'
                          : 'border-gray-100 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-base">{getRoleIcon(r)}</span>
                      <span className="truncate text-[11px] font-sans">{getRoleLabel(r)}</span>
                    </button>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-2">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 font-mono">
                    Seleccionar Empleado Activo:
                  </label>
                  <div className="space-y-1">
                    {employees.map(emp => {
                      const branch = branches.find(b => b.id === emp.branchId);
                      return (
                        <button
                          key={emp.id}
                          onClick={() => handleEmployeeChange(emp.id)}
                          className={`w-full flex items-center justify-between p-2 rounded-lg text-xs hover:bg-gray-50 text-left transition ${
                            currentEmployee.id === emp.id
                              ? 'bg-amber-50/75 border border-amber-200 font-semibold'
                              : 'border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="text-sm">{getRoleIcon(emp.role)}</span>
                            <div className="truncate">
                              <p className="text-gray-800 font-medium truncate">{emp.name}</p>
                              <p className="text-[10px] text-gray-500 truncate font-mono">
                                {emp.role === 'admin' ? 'Todo el negocio' : branch?.name || 'Zacatecas'}
                              </p>
                            </div>
                          </div>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${getRoleBadgeColor(emp.role)}`}>
                            PIN: {emp.pin}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="bg-stone-50 p-2.5 text-[10px] text-center text-gray-500 border-t border-gray-100 font-mono">
                La Elotería de Zacatecas • v1.0 • {getActiveClockInCount()} Activos en Reloj
              </div>
            </div>
          )}
        </div>

        {/* User Card */}
        <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
          <div className="hidden md:block text-right">
            <p className="text-xs font-semibold text-gray-800 leading-tight">{currentEmployee.name}</p>
            <p className="text-[10px] text-gray-500 tracking-tight leading-none uppercase font-semibold font-mono mt-0.5">
              {getRoleLabel(currentRole)}
            </p>
          </div>
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#155E37]/10 border border-[#155E37]/20 text-[#155E37] overflow-hidden">
            <User className="w-4 h-4" />
          </div>
        </div>
      </div>
    </header>
  );
}
