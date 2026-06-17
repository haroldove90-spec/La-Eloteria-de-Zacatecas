import React from 'react';
import {
  Shield, Users, ShoppingCart, Layers, Clock, ArrowRight, BarChart3,
  CheckCircle2, Activity, FileText, MapPin, TrendingUp, Sparkles, HelpCircle
} from 'lucide-react';
import { Employee, Role } from '../types';

interface HomePortalProps {
  currentRole: Role;
  setCurrentRole: (role: Role) => void;
  currentEmployee: Employee;
  setCurrentEmployee: (emp: Employee) => void;
  employees: Employee[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function HomePortal({
  currentRole,
  setCurrentRole,
  currentEmployee,
  setCurrentEmployee,
  employees,
  activeTab,
  setActiveTab
}: HomePortalProps) {

  // Representative employees for quick swap
  const roleRepresentatives: Record<Role, { empId: string; defaultTab: string }> = {
    admin: { empId: 'emp_admin', defaultTab: 'dashboard' },
    gerente: { empId: 'emp_gerente1', defaultTab: 'dashboard' },
    cajero: { empId: 'emp_cajero1', defaultTab: 'pos' },
    staff: { empId: 'emp_staff1', defaultTab: 'asistencia' }
  };

  const currentRep = roleRepresentatives[currentRole];

  const handleSelectRole = (role: Role) => {
    const rep = roleRepresentatives[role];
    const empObj = employees.find(e => e.id === rep.empId);
    if (empObj) {
      setCurrentRole(role);
      setCurrentEmployee(empObj);
      setActiveTab(rep.defaultTab);
      
      // Small alert feedback
      const welcomeMessages: Record<Role, string> = {
        admin: `👑 Acceso concedido como Don Eladio (Dueño) de La Elotería. Tienes control de todas las sucursales, finanzas y recetas globales.`,
        gerente: `📋 Iniciando sesión de Supervisor local como Gaby Gómez. Tienes control de traslados de almacén, stock crítico y autorizaciones de descuento.`,
        cajero: `🛒 Iniciando sesión de Punto de Venta (POS) como Chela Torres. Listo para ingresar órdenes, modificadores y arqueo ciego.`,
        staff: `⏱️ Cargando Reloj Checador para Staff. Ingresa tu asistencia diaria con PIN de seguridad.`
      };
      
      // Let's create an elegant overlay or show immediate toast
      alert(welcomeMessages[role]);
    }
  };

  const roleCards = [
    {
      role: 'admin' as Role,
      title: 'Administrador Global',
      subtitle: 'Don Eladio (Dueño)',
      icon: Shield,
      color: 'border-red-500 text-red-600 bg-red-50',
      badgeColor: 'bg-red-500 text-white',
      avatar: '👑',
      description: 'Acceso total y vision consolidada del negocio. Configura el catálogo, las recetas, aprueba auditorías y visualiza finanzas completas.',
      modules: [
        'Módulo Multi-Sucursal en tiempo real',
        'Finanzas: Ganancia Bruta y Neta',
        'Rendimiento: Top/Bottom de productos',
        'Menú, Precios y Explosión de Recetas',
        'Auditoría y Validación de Arqueos',
        'Control y Nónimas de Personal Global'
      ]
    },
    {
      role: 'gerente' as Role,
      title: 'Supervisor / Gerente',
      subtitle: 'Gaby Gómez (Suc. Centro)',
      icon: Users,
      color: 'border-amber-500 text-amber-600 bg-amber-50',
      badgeColor: 'bg-amber-500 text-white',
      avatar: '📋',
      description: 'Supervisión de almacenes, control de rotación de insumos de la sucursal asignada y autorizaciones rápidas de personal.',
      modules: [
        'Control de Stock Físico Local',
        'Traspasos entre Sucursales (Envío/Recepción)',
        'Alertas automáticas de Stock Mínimo',
        'Autorización de descuentos en POS',
        'Control de asistencias y personal local'
      ]
    },
    {
      role: 'cajero' as Role,
      title: 'Cajero de Sucursal',
      subtitle: 'Chela Torres (Punto de Venta)',
      icon: ShoppingCart,
      color: 'border-emerald-500 text-emerald-600 bg-emerald-50',
      badgeColor: 'bg-[#155E37] text-white',
      avatar: '🛒',
      description: 'Operación diaria en mostrador. Cobros rápidos, personalización de recetas (modificadores) y blind-cut de caja al cierre de turno.',
      modules: [
        'Punto de Venta (POS) con modificadores',
        'Registrar Cobro: Efectivo, Tarjeta, Transf.',
        'Emisión de tickets de venta detallados',
        'Gastos Rápidos en Efectivo (Caja Chica)',
        'Corte de turno con Arqueo de Caja'
      ]
    },
    {
      role: 'staff' as Role,
      title: 'Preparación (Staff)',
      subtitle: 'Juan Rulfo (Reloj Checador)',
      icon: Clock,
      color: 'border-blue-500 text-blue-600 bg-blue-50',
      badgeColor: 'bg-blue-600 text-white',
      avatar: '⏱️',
      description: 'Acceso simplificado de mostrador. Reloj Checador para inicio/término de jornada o pausas de comida mediante PIN seguro.',
      modules: [
        'Registro de Entrada con PIN de 4 dígitos',
        'Salidas y Retornos de Almuerzo/Comida',
        'Registro de Salida con cálculo de horas',
        'Listado de personal activo trabajando'
      ]
    }
  ];

  return (
    <div className="space-y-6 animate-fadeIn" id="home_portal_view">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-[#155E37] to-[#1c7a48] rounded-2xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Decorative Mexican Ornament background accent */}
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-y-4 translate-x-4">
          <span className="text-[140px] leading-none">🌽</span>
        </div>
        
        <div className="relative z-10 space-y-3 max-w-2xl">
          <span className="bg-[#FBBF24] text-[#155E37] font-extrabold text-[10px] tracking-widest px-2.5 py-1 rounded-full uppercase font-mono">
            Portal Unificado de Operaciones
          </span>
          <h1 className="text-xl md:text-3xl font-black tracking-tight font-sans">
            ¡Bienvenidos a La Elotería de Zacatecas! 🌽✨
          </h1>
          <p className="text-xs md:text-sm text-amber-50/90 font-medium leading-relaxed">
            Sistema operativo centralizado para la venta de elotes, esquites y especialidades tradicionales. 
            Alterna entre los roles de simulador para verificar la explosión automática de recetas, control de personal, arqueos y auditorías gerenciales.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg text-[10px] font-semibold font-mono">
              <span className="w-2 h-2 rounded-full bg-yellow-405 animate-pulse"></span>
              Zacatecas Multi-Sucursal Activo
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg text-[10px] font-semibold font-mono">
              ⚡ Recetas Automatizadas Corriendo
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Role Switcher Panel */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-gray-250 pb-2">
          <div>
            <h2 className="text-sm font-black text-stone-800 uppercase tracking-wider font-mono">Selección de Roles Activos</h2>
            <p className="text-stone-400 text-[10.5px]">Haz clic en cualquier rol para iniciar sesión simulada y explorar sus funciones:</p>
          </div>
          <span className="text-[10px] font-mono text-stone-500 font-semibold bg-stone-100 rounded-full px-2 py-0.5">
            Rol actual simulado: <strong>{currentRole.toUpperCase()}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {roleCards.map(card => {
            const Icon = card.icon;
            const isCurrent = currentRole === card.role;
            return (
              <div
                key={card.role}
                onClick={() => handleSelectRole(card.role)}
                className={`group border rounded-2xl p-4.5 transition duration-300 cursor-pointer flex flex-col justify-between h-[300px] select-none hover:shadow-lg relative overflow-hidden bg-white ${
                  isCurrent
                    ? 'border-[#155E37] ring-2 ring-[#155E37]/10'
                    : 'border-stone-200 hover:border-amber-400'
                }`}
                id={`role_card_${card.role}`}
              >
                {/* Active Indicator Top Corner */}
                {isCurrent && (
                  <div className="absolute top-0 right-0 bg-[#155E37] text-white font-mono font-black text-[9px] px-2.5 py-1 rounded-bl-xl uppercase tracking-wider">
                    Activo
                  </div>
                )}

                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2.5 rounded-xl ${isCurrent ? 'bg-[#155E37]/10 text-[#155E37]' : 'bg-stone-50 text-stone-600 group-hover:bg-amber-400/10 group-hover:text-amber-600'} transition duration-200 shadow-sm`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className={`font-extrabold text-xs tracking-tight ${isCurrent ? 'text-[#155E37]' : 'text-stone-800'}`}>
                        {card.title}
                      </h3>
                      <p className="text-[9.5px] text-stone-400 font-medium">{card.subtitle}</p>
                    </div>
                  </div>

                  <p className="text-[10px] text-stone-500 leading-relaxed font-sans mt-1">
                    {card.description}
                  </p>

                  <div className="pt-2 border-t border-stone-50 space-y-1">
                    <p className="text-[9px] font-extrabold text-stone-400 uppercase tracking-widest font-mono">Módulos que opera:</p>
                    <ul className="space-y-0.5">
                      {card.modules.map((mod, i) => (
                        <li key={i} className="flex items-center gap-1 text-[9.5px] text-stone-605">
                          <CheckCircle2 className="w-2.5 h-2.5 text-[#155E37] shrink-0" />
                          <span className="truncate">{mod}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectRole(card.role);
                  }}
                  className={`w-full mt-3.5 flex items-center justify-between p-2.5 rounded-xl font-bold text-[10.5px] transition duration-200 shadow-sm ${
                    isCurrent
                      ? 'bg-[#155E37] text-white hover:bg-[#0E4025]'
                      : 'bg-stone-50 text-stone-600 border border-stone-100 hover:bg-stone-100'
                  }`}
                >
                  <span>Ingresar como {card.role.toUpperCase()}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Detailed Checklist Mapping to user requirements */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 mt-6 space-y-4 shadow-sm">
        <div className="border-b border-stone-100 pb-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#155E37]" />
            <div>
              <h3 className="font-extrabold text-stone-800 text-xs uppercase font-mono tracking-wider">Bitácora de Cumplimiento Técnico (Checklist del Negocio)</h3>
              <p className="text-[10px] text-stone-500">Mapeo de requerimientos funcionales solicitados y su estatus de implementación actual.</p>
            </div>
          </div>
          <span className="bg-emerald-50 text-emerald-700 font-black text-[9.5px] px-2.5 py-1 rounded-full uppercase font-mono border border-emerald-250">
            ✓ 100% Completados en Frontend
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Req 1: Ventas y Caja */}
          <div className="bg-stone-50/50 rounded-xl p-3.5 border border-stone-150 space-y-2.5 text-[10px]">
            <p className="font-mono font-bold text-[#155E37] text-[10.5px] uppercase tracking-wider border-b border-stone-150 pb-1 flex items-center justify-between">
              <span>🛒 1. Ventas y Caja (POS)</span>
              <span className="text-[9px] text-[#155E37] font-semibold bg-green-50 px-1.5 py-0.5 rounded">Operativo</span>
            </p>
            <ul className="space-y-2 text-stone-700 leading-snug">
              <li>
                <strong className="block text-stone-800">🌽 Cobro en Caja con Modificadores:</strong>
                Pantalla interactiva en POS para personalizar elote clásico o esquite con chile que pica/no pica, aderezos (mayonesa artesanal, crema ácida de huanusco, mantequilla derretida) y porción extra de queso Cotija.
              </li>
              <li>
                <strong className="block text-stone-800">🧾 Arqueo de Caja y Caja Chica:</strong>
                Fondo de caja inicial, registro rápido de gastos inmediatos/entradas (compra de hielo, propinas) y cierre con comparativa de efectivo esperada vs. declarada de forma ciega.
              </li>
              <li>
                <strong className="block text-stone-800">🛡️ Descuentos Co-Autorizados:</strong>
                En POS se pueden aplicar descuentos, pero exige pin de supervisor válido (e.g. Sergio Salazar: <code>3333</code> o Gaby Gómez: <code>2222</code>).
              </li>
            </ul>
          </div>

          {/* Req 2: Inventarios */}
          <div className="bg-stone-50/50 rounded-xl p-3.5 border border-stone-150 space-y-2.5 text-[10px]">
            <p className="font-mono font-bold text-amber-705 text-[10.5px] uppercase tracking-wider border-b border-stone-150 pb-1 flex items-center justify-between">
              <span>📦 2. Almacén e Insumos</span>
              <span className="text-[9px] text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded">Operativo</span>
            </p>
            <ul className="space-y-2 text-stone-700 leading-snug">
              <li>
                <strong className="block text-stone-800">⚖️ Descuento por Platillo (Explosión):</strong>
                Al vender un platillo, las porciones exactas (ej. 200g de grano de elote, 1 vaso, 1 cuchara, 30g de mayonesa en Esquite Mediano) se debitan automáticamente del stock de la sucursal actual.
              </li>
              <li>
                <strong className="block text-stone-800">🚛 Traspaso Blindado entre Sucursales:</strong>
                Módulo para transferir insumos entre almacenes locales con un tracker de estatus: "Pendiente" e "Ingreso Confirmado" para eliminar robos hormiga.
              </li>
              <li>
                <strong className="block text-stone-800">⚠️ Alertas de Mínimos de Seguridad:</strong>
                Coloraciones y alertas de alerta en panel cuando algún ingrediente crítico (ej. queso Cotija, tuétano) cae por debajo del umbral mínimo de stock.
              </li>
            </ul>
          </div>

          {/* Req 3, 4, 5: RH, Multi, Dashboard */}
          <div className="bg-stone-50/50 rounded-xl p-3.5 border border-stone-150 space-y-2.5 text-[10px]">
            <p className="font-mono font-bold text-blue-600 text-[10.5px] uppercase tracking-wider border-b border-stone-150 pb-1 flex items-center justify-between">
              <span>📊 3-5. RH, Sucursales y Analítica</span>
              <span className="text-[9px] text-blue-600 font-semibold bg-blue-50 px-1.5 py-0.5 rounded">Operativo</span>
            </p>
            <ul className="space-y-2 text-stone-700 leading-snug">
              <li>
                <strong className="block text-stone-800">⏰ Reloj Checador & Cálculo de Horas:</strong>
                Asistencia empleando PIN. Resumen automático de horas semanales/diarias acumuladas por empleado para la dispersión exacta de nóminas.
              </li>
              <li>
                <strong className="block text-stone-800">🏘️ Centralización Multi-Sucursal:</strong>
                Selector global de sucursales en panel superior para filtrar stock, ventas y personal por local o visión consolidad del corporativo.
              </li>
              <li>
                <strong className="block text-stone-800">💵 Ganancia Bruta vs. Ganancia Neta:</strong>
                Ganancia bruta basada en costo directo de materia prima e ingredientes, y ganancia neta restando gastos operativos como sueldos, rentas, luz y gastos rápidos declarados en caja.
              </li>
            </ul>
          </div>
        </div>

        {/* Dynamic prompt tracker or interactive helper */}
        <div className="bg-amber-50/60 rounded-xl border border-amber-200/65 p-3 text-[10px] text-amber-900 leading-relaxed font-sans flex items-start gap-2.5">
          <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">💡 Consejo para Demostración / Evaluación de Funcionalidades:</p>
            Para realizar un flujo completo: ingresa como <strong>Cajero</strong>, añade un elote o esquite al carrito para configurarlo, aplica un descuento con PIN <code>2222</code>, registra cobro, y luego ve al panel de <strong>Gerente o Admin</strong> para corroborar el reporte financiero con costos reducidos, la explosión automática de materias primas del stock de la sucursal, y las discrepancias de arqueo.
          </div>
        </div>
      </div>
    </div>
  );
}
