/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  INITIAL_BRANCHES,
  INITIAL_EMPLOYEES,
  INITIAL_SUPPLIERS,
  INITIAL_RAW_INGREDIENTS,
  INITIAL_MENU_ITEMS,
  INITIAL_SALES,
  INITIAL_TRANSFERS,
  INITIAL_AUDITS,
  INITIAL_CORTES,
  INITIAL_CLOCK_INS
} from './data';
import {
  Employee, Branch, MenuItem, RawIngredient, Supplier, Sale, StockTransfer, InventoryAudit, CorteCaja, ClockInLog, Role
} from './types';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';

// Specialized role viewports
import AdminDashboard from './components/admin/AdminDashboard';
import GerenteDashboard from './components/gerente/GerenteDashboard';
import CajeroPOS from './components/cajero/CajeroPOS';
import StaffClock from './components/staff/StaffClock';
import HomePortal from './components/HomePortal';

// Helper storage function
function useLocalStorageState<T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) return JSON.parse(stored) as T;
    } catch (e) {
      console.error(`Error loading state for key ${key}`, e);
    }
    return defaultValue;
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (e) {
      console.error(`Error writing state for key ${key}`, e);
    }
  }, [key, state]);

  return [state, setState];
}

export default function App() {
  // 1. Durably Persistent Business Tables
  const [branches, setBranches] = useLocalStorageState<Branch[]>('eloteria_branches', INITIAL_BRANCHES);
  const [employees, setEmployees] = useLocalStorageState<Employee[]>('eloteria_employees', INITIAL_EMPLOYEES);
  const [suppliers, setSuppliers] = useLocalStorageState<Supplier[]>('eloteria_suppliers', INITIAL_SUPPLIERS);
  const [rawIngredients, setRawIngredients] = useLocalStorageState<RawIngredient[]>('eloteria_raw_ingredients', INITIAL_RAW_INGREDIENTS);
  const [menuItems, setMenuItems] = useLocalStorageState<MenuItem[]>('eloteria_menu_items', INITIAL_MENU_ITEMS);
  const [sales, setSales] = useLocalStorageState<Sale[]>('eloteria_sales', INITIAL_SALES);
  const [transfers, setTransfers] = useLocalStorageState<StockTransfer[]>('eloteria_transfers', INITIAL_TRANSFERS);
  const [audits, setAudits] = useLocalStorageState<InventoryAudit[]>('eloteria_audits', INITIAL_AUDITS);
  const [cortes, setCortes] = useLocalStorageState<CorteCaja[]>('eloteria_cortes', INITIAL_CORTES);
  const [clockIns, setClockIns] = useLocalStorageState<ClockInLog[]>('eloteria_clock_ins', INITIAL_CLOCK_INS);

  // 2. Active Session & Role Switch State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentRole, setCurrentRole] = useState<Role>('admin');
  const [currentEmployee, setCurrentEmployee] = useState<Employee>(() => {
    const adminEmp = INITIAL_EMPLOYEES.find(e => e.role === 'admin');
    return adminEmp || INITIAL_EMPLOYEES[0];
  });
  const [currentBranchId, setCurrentBranchId] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<string>('home');

  // 3. PWA Installation Handler State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallHelp, setShowInstallHelp] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`PWA install response: ${outcome}`);
      setDeferredPrompt(null);
    } else {
      setShowInstallHelp(true);
    }
  };

  // Multi-viewport switcher based on current role permissions
  const renderActiveModule = () => {
    if (currentRole === 'staff') {
      return (
        <StaffClock
          employees={employees}
          clockIns={clockIns}
          setClockIns={setClockIns}
        />
      );
    }

    switch (activeTab) {
      case 'home':
        return (
          <HomePortal
            currentRole={currentRole}
            setCurrentRole={setCurrentRole}
            currentEmployee={currentEmployee}
            setCurrentEmployee={setCurrentEmployee}
            employees={employees}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onInstall={handleInstallApp}
          />
        );
      case 'dashboard':
        if (currentRole === 'admin') {
          return (
            <AdminDashboard
              employees={employees}
              setEmployees={setEmployees}
              branches={branches}
              setBranches={setBranches}
              menuItems={menuItems}
              setMenuItems={setMenuItems}
              rawIngredients={rawIngredients}
              setRawIngredients={setRawIngredients}
              suppliers={suppliers}
              setSuppliers={setSuppliers}
              sales={sales}
              setSales={setSales}
              audits={audits}
              setAudits={setAudits}
              cortes={cortes}
              setCortes={setCortes}
            />
          );
        } else if (currentRole === 'gerente') {
          return (
            <GerenteDashboard
              currentEmployee={currentEmployee}
              branches={branches}
              menuItems={menuItems}
              rawIngredients={rawIngredients}
              setRawIngredients={setRawIngredients}
              employees={employees}
              sales={sales}
              setSales={setSales}
              transfers={transfers}
              setTransfers={setTransfers}
              audits={audits}
              setAudits={setAudits}
              cortes={cortes}
              setCortes={setCortes}
              clockIns={clockIns}
            />
          );
        }
        return <div className="text-stone-400 text-xs text-center py-10 font-mono">⚠️ Acceso Restringido a este Módulo para tu Rol actual.</div>;

      case 'pos':
        return (
          <CajeroPOS
            currentEmployee={currentEmployee}
            menuItems={menuItems}
            rawIngredients={rawIngredients}
            setRawIngredients={setRawIngredients}
            sales={sales}
            setSales={setSales}
            cortes={cortes}
            setCortes={setCortes}
          />
        );

      case 'menu':
        if (currentRole === 'admin') {
          return (
            <AdminDashboard
              employees={employees}
              setEmployees={setEmployees}
              branches={branches}
              setBranches={setBranches}
              menuItems={menuItems}
              setMenuItems={setMenuItems}
              rawIngredients={rawIngredients}
              setRawIngredients={setRawIngredients}
              suppliers={suppliers}
              setSuppliers={setSuppliers}
              sales={sales}
              setSales={setSales}
              audits={audits}
              setAudits={setAudits}
              cortes={cortes}
              setCortes={setCortes}
            />
          );
        }
        return <div className="text-stone-400 text-xs text-center py-10 font-mono">⚠️ Módulo de Menús restringido únicamente para Administración Global.</div>;

      case 'inventario':
        if (currentRole === 'admin') {
          return (
            <AdminDashboard
              employees={employees}
              setEmployees={setEmployees}
              branches={branches}
              setBranches={setBranches}
              menuItems={menuItems}
              setMenuItems={setMenuItems}
              rawIngredients={rawIngredients}
              setRawIngredients={setRawIngredients}
              suppliers={suppliers}
              setSuppliers={setSuppliers}
              sales={sales}
              setSales={setSales}
              audits={audits}
              setAudits={setAudits}
              cortes={cortes}
              setCortes={setCortes}
            />
          );
        } else if (currentRole === 'gerente') {
          return (
            <GerenteDashboard
              currentEmployee={currentEmployee}
              branches={branches}
              menuItems={menuItems}
              rawIngredients={rawIngredients}
              setRawIngredients={setRawIngredients}
              employees={employees}
              sales={sales}
              setSales={setSales}
              transfers={transfers}
              setTransfers={setTransfers}
              audits={audits}
              setAudits={setAudits}
              cortes={cortes}
              setCortes={setCortes}
              clockIns={clockIns}
            />
          );
        }
        return <div className="text-stone-400 text-xs text-center py-10 font-mono">⚠️ No posees autorización para alterar almacenes o reportar inventarios.</div>;

      case 'personal':
        if (currentRole === 'admin') {
          return (
            <AdminDashboard
              employees={employees}
              setEmployees={setEmployees}
              branches={branches}
              setBranches={setBranches}
              menuItems={menuItems}
              setMenuItems={setMenuItems}
              rawIngredients={rawIngredients}
              setRawIngredients={setRawIngredients}
              suppliers={suppliers}
              setSuppliers={setSuppliers}
              sales={sales}
              setSales={setSales}
              audits={audits}
              setAudits={setAudits}
              cortes={cortes}
              setCortes={setCortes}
            />
          );
        } else if (currentRole === 'gerente') {
          return (
            <GerenteDashboard
              currentEmployee={currentEmployee}
              branches={branches}
              menuItems={menuItems}
              rawIngredients={rawIngredients}
              setRawIngredients={setRawIngredients}
              employees={employees}
              sales={sales}
              setSales={setSales}
              transfers={transfers}
              setTransfers={setTransfers}
              audits={audits}
              setAudits={setAudits}
              cortes={cortes}
              setCortes={setCortes}
              clockIns={clockIns}
            />
          );
        }
        return <div className="text-stone-400 text-xs text-center py-10 font-mono">Restringido para este Rol.</div>;

      case 'cortes':
        if (currentRole === 'admin') {
          return (
            <AdminDashboard
              employees={employees}
              setEmployees={setEmployees}
              branches={branches}
              setBranches={setBranches}
              menuItems={menuItems}
              setMenuItems={setMenuItems}
              rawIngredients={rawIngredients}
              setRawIngredients={setRawIngredients}
              suppliers={suppliers}
              setSuppliers={setSuppliers}
              sales={sales}
              setSales={setSales}
              audits={audits}
              setAudits={setAudits}
              cortes={cortes}
              setCortes={setCortes}
            />
          );
        } else if (currentRole === 'gerente') {
          return (
            <GerenteDashboard
              currentEmployee={currentEmployee}
              branches={branches}
              menuItems={menuItems}
              rawIngredients={rawIngredients}
              setRawIngredients={setRawIngredients}
              employees={employees}
              sales={sales}
              setSales={setSales}
              transfers={transfers}
              setTransfers={setTransfers}
              audits={audits}
              setAudits={setAudits}
              cortes={cortes}
              setCortes={setCortes}
              clockIns={clockIns}
            />
          );
        } else if (currentRole === 'cajero') {
          return (
            <CajeroPOS
              currentEmployee={currentEmployee}
              menuItems={menuItems}
              rawIngredients={rawIngredients}
              setRawIngredients={setRawIngredients}
              sales={sales}
              setSales={setSales}
              cortes={cortes}
              setCortes={setCortes}
            />
          );
        }
        return <div className="text-stone-400 text-xs text-center py-10 font-mono">Cortes de Caja restringidos.</div>;

      case 'asistencia':
        return (
          <StaffClock
            employees={employees}
            clockIns={clockIns}
            setClockIns={setClockIns}
          />
        );

      default:
        return (
          <div className="bg-white p-6 rounded-xl border border-gray-100 text-center font-mono text-xs text-gray-400 shadow-sm col-span-full">
            Módulo no encontrado o cargando...
          </div>
        );
    }
  };

  const getActiveBranchLabel = () => {
    if (currentBranchId === 'all') return 'Todas las Sucursales';
    return branches.find(b => b.id === currentBranchId)?.name || 'Sucursal Seleccionada';
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FEF9E7] font-sans antialiased" id="main_app_wrapper">
      {/* Top Header Panel */}
      <Header
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        currentEmployee={currentEmployee}
        setCurrentEmployee={setCurrentEmployee}
        currentBranchId={currentBranchId}
        setCurrentBranchId={setCurrentBranchId}
        employees={employees}
        branches={branches}
        clockIns={clockIns}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onInstall={handleInstallApp}
      />

      <div className="flex flex-row flex-1 w-full relative">
        {/* Left Side menu – hidden on mobile entirely */}
        <Sidebar
          sidebarOpen={sidebarOpen}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentRole={currentRole}
        />

        {/* Dynamic content viewport */}
        <main
          className={`flex-1 p-4 md:p-6 pb-24 md:pb-6 transition-all duration-300 w-full ${
            currentRole !== 'staff' && sidebarOpen ? 'md:pl-72' : 'md:pl-26'
          }`}
          id="active_viewport_panel"
        >
          {/* Quick diagnostic alert if current Role restricts access */}
          {currentRole !== 'staff' && !['home', 'dashboard', 'pos', 'inventario', 'menu', 'personal', 'cortes', 'asistencia'].includes(activeTab) && (
            <div className="p-3 bg-amber-50 border border-amber-205 rounded-xl font-mono text-xs text-amber-700 font-semibold mb-4 text-center">
              Aviso: Ruta actual vacía. Por favor, selecciona un módulo del menú lateral.
            </div>
          )}

          {renderActiveModule()}
        </main>
      </div>

      {/* Fixed bottom navigation for smaller screens (Mobile version layout) */}
      <MobileNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentRole={currentRole}
      />

      {/* PWA Install Help Modal */}
      {showInstallHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 animate-fadeIn" id="pwa_install_help_modal">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-md overflow-hidden text-stone-800">
            <div className="bg-[#155E37] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src="https://appdesignproyectos.com/laeloterialogo.png" className="w-10 h-10 object-contain rounded-xl" alt="Mascota" />
                <div>
                  <h3 className="font-bold text-sm tracking-tight">Instalar La Elotería</h3>
                  <p className="text-[10px] text-amber-100 font-medium">Lleva el control de tu sucursal en tu pantalla de inicio</p>
                </div>
              </div>
              <button 
                onClick={() => setShowInstallHelp(false)}
                className="text-white/80 hover:text-white font-bold text-lg p-1"
                aria-label="Cerrar modal de instalación"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-xs space-y-3 leading-relaxed">
                <p>
                  Esta Web App (PWA) está optimizada para ser instalada en cualquier dispositivo móvil o de escritorio como si fuese una aplicación nativa.
                </p>
                
                {/* Visual Instructions */}
                <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-3 text-stone-700">
                  <div className="flex gap-2.5 items-start">
                    <span className="bg-[#155E37]/10 text-[#155E37] font-bold text-xs rounded-full w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">1</span>
                    <p className="font-sans">
                      <strong>Si estás en Android / Chrome:</strong> Pulsa los tres puntos de opciones y selecciona <strong>&ldquo;Instalar aplicación&rdquo;</strong> o <strong>&ldquo;Añadir a pantalla de inicio&rdquo;</strong>.
                    </p>
                  </div>
                  <div className="flex gap-2.5 items-start">
                    <span className="bg-[#155E37]/10 text-[#155E37] font-bold text-xs rounded-full w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">2</span>
                    <p className="font-sans">
                      <strong>Si estás en iOS / Safari:</strong> Pulsa el botón de <strong>Compartir</strong> (flecha arriba) y desplázate hacia abajo hasta seleccionar <strong>&ldquo;Añadir a pantalla de inicio&rdquo;</strong>.
                    </p>
                  </div>
                  <div className="flex gap-2.5 items-start">
                    <span className="bg-[#155E37]/10 text-[#155E37] font-bold text-xs rounded-full w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">3</span>
                    <p className="font-sans">
                      <strong>Si estás en el Iframe de AI Studio:</strong> Te recomendamos abrir la app en una <strong>nueva pestaña</strong> externa usando el icono de la esquina superior, y desde ahí pulsar el botón <strong>&ldquo;Instalar Aplicación&rdquo;</strong> en la barra de navegación.
                    </p>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => setShowInstallHelp(false)}
                className="w-full bg-[#155E37] hover:bg-[#0E4025] text-white p-3 rounded-xl font-bold text-xs transition shadow-md"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
