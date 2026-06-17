/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  TrendingUp, TrendingDown, DollarSign, ShoppingBag, Plus, Edit, Trash2,
  Users, Home, Truck, ShieldAlert, CheckCircle, XCircle, AlertTriangle, Layers, Save, ShoppingCart
} from 'lucide-react';
import {
  Employee, Branch, MenuItem, RawIngredient, Supplier, Sale, StockTransfer, InventoryAudit, CorteCaja
} from '../../types';

interface AdminDashboardProps {
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  branches: Branch[];
  setBranches: React.Dispatch<React.SetStateAction<Branch[]>>;
  menuItems: MenuItem[];
  setMenuItems: React.Dispatch<React.SetStateAction<MenuItem[]>>;
  rawIngredients: RawIngredient[];
  setRawIngredients: React.Dispatch<React.SetStateAction<RawIngredient[]>>;
  suppliers: Supplier[];
  setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>;
  sales: Sale[];
  setSales: React.Dispatch<React.SetStateAction<Sale[]>>;
  audits: InventoryAudit[];
  setAudits: React.Dispatch<React.SetStateAction<InventoryAudit[]>>;
  cortes: CorteCaja[];
  setCortes: React.Dispatch<React.SetStateAction<CorteCaja[]>>;
}

type AdminSubTab = 'stats' | 'menu' | 'org' | 'audits';

export default function AdminDashboard({
  employees, setEmployees,
  branches, setBranches,
  menuItems, setMenuItems,
  rawIngredients, setRawIngredients,
  suppliers, setSuppliers,
  sales, setSales,
  audits, setAudits,
  cortes, setCortes
}: AdminDashboardProps) {
  const [activeSubTab, setActiveSubTab] = useState<AdminSubTab>('stats');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>('all');

  // Modal / Editing states
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [showEmpModal, setShowEmpModal] = useState(false);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);

  // States for adding menu items
  const [newMenuForm, setNewMenuForm] = useState({
    name: '',
    description: '',
    category: 'Elotes' as MenuItem['category'],
    price: 30,
    cost: 10,
    ingredients: [] as Array<{ rawItemId: string; quantity: number }>
  });

  // State for raw ingredient selectors inside recipe creator
  const [ingredientSelectorRawId, setIngredientSelectorRawId] = useState('');
  const [ingredientSelectorQty, setIngredientSelectorQty] = useState(0);

  // States for adding employees
  const [newEmpForm, setNewEmpForm] = useState({
    name: '',
    role: 'staff' as Employee['role'],
    pin: '',
    branchId: 'suc_centro',
    phone: '',
    email: '',
  });

  // 1. CALCULATE FINANCIALS
  const filteredSales = sales.filter(s =>
    (selectedBranchFilter === 'all' || s.branchId === selectedBranchFilter) &&
    s.status === 'completada'
  );

  const totalGross = filteredSales.reduce((sum, s) => sum + s.total, 0);
  const totalCost = filteredSales.reduce((sum, s) => {
    return sum + s.items.reduce((itemSum, item) => itemSum + (item.cost * item.quantity), 0);
  }, 0);
  const totalNet = totalGross - totalCost;
  const netMargin = totalGross > 0 ? (totalNet / totalGross) * 100 : 0;
  const ticketMedio = filteredSales.length > 0 ? totalGross / filteredSales.length : 0;

  // 2. ANALYZE MOST/LEAST SOLD ITEMS
  const itemSalesCount: Record<string, { name: string; qty: number; category: string }> = {};
  filteredSales.forEach(s => {
    s.items.forEach(item => {
      if (!itemSalesCount[item.menuItemId]) {
        itemSalesCount[item.menuItemId] = { name: item.name, qty: 0, category: '' };
      }
      itemSalesCount[item.menuItemId].qty += item.quantity;
    });
  });

  // Match menu item categories to item counts
  menuItems.forEach(mi => {
    if (itemSalesCount[mi.id]) {
      itemSalesCount[mi.id].category = mi.category;
    }
  });

  const sortedSalesData = Object.entries(itemSalesCount)
    .map(([id, val]) => ({ id, ...val }))
    .sort((a, b) => b.qty - a.qty);

  const topItems = sortedSalesData.slice(0, 3);
  const slowItems = sortedSalesData.length > 3 ? sortedSalesData.slice(-3).reverse() : [];

  // Low stock calculation
  const getLowStockIngredients = () => {
    return rawIngredients.filter(raw => {
      // Check if any branch is below minimum threshold
      return Object.entries(raw.currentStock).some(([brId, qty]) => {
        if (selectedBranchFilter !== 'all' && brId !== selectedBranchFilter) return false;
        return qty <= raw.minStock;
      });
    });
  };

  const lowStockList = getLowStockIngredients();

  // Audit Approvals Handlers
  const handleApproveAudit = (auditId: string) => {
    // Audit approval sets it to approved, and corrects actual stock inside raw ingredients
    const auditObj = audits.find(a => a.id === auditId);
    if (!auditObj) return;

    // Correct raw ingredient stock
    setRawIngredients(prev => prev.map(raw => {
      if (raw.id === auditObj.rawItemId) {
        const stocks = { ...raw.currentStock };
        stocks[auditObj.branchId] = auditObj.actualQty; // adjust stock to matches auditor quantity
        return { ...raw, currentStock: stocks };
      }
      return raw;
    }));

    setAudits(prev => prev.map(a => a.id === auditId ? { ...a, status: 'aprobado' } : a));
  };

  const handleApproveCorte = (corteId: string) => {
    setCortes(prev => prev.map(c => c.id === corteId ? { ...c, status: 'aprobado', validatedBy: 'emp_admin' } : c));
  };

  // Menu Items operations
  const handleSaveMenuItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      // update
      setMenuItems(prev => prev.map(mi => mi.id === editingItem.id ? { ...editingItem } : mi));
      setEditingItem(null);
    } else {
      // add
      const id = 'menu_' + Math.random().toString(36).substring(2, 9);
      const newItem: MenuItem = {
        id,
        name: newMenuForm.name,
        category: newMenuForm.category,
        price: Number(newMenuForm.price),
        cost: Number(newMenuForm.cost),
        description: newMenuForm.description,
        active: true,
        ingredients: newMenuForm.ingredients
      };
      setMenuItems(prev => [...prev, newItem]);
      setNewMenuForm({
        name: '', description: '', category: 'Elotes', price: 30, cost: 10, ingredients: []
      });
    }
    setShowItemModal(false);
  };

  const handleDeleteMenuItem = (id: string) => {
    if (confirm('¿Seguro que deseas desactivar este platillo del menú?')) {
      setMenuItems(prev => prev.map(mi => mi.id === id ? { ...mi, active: false } : mi));
    }
  };

  const handleAddIngredientToRecipe = () => {
    if (!ingredientSelectorRawId || ingredientSelectorQty <= 0) return;
    const exists = newMenuForm.ingredients.some(i => i.rawItemId === ingredientSelectorRawId);
    if (exists) {
      setNewMenuForm(prev => ({
        ...prev,
        ingredients: prev.ingredients.map(i =>
          i.rawItemId === ingredientSelectorRawId ? { ...i, quantity: i.quantity + ingredientSelectorQty } : i
        )
      }));
    } else {
      setNewMenuForm(prev => ({
        ...prev,
        ingredients: [...prev.ingredients, { rawItemId: ingredientSelectorRawId, quantity: ingredientSelectorQty }]
      }));
    }
    setIngredientSelectorQty(0);
    setIngredientSelectorRawId('');
  };

  // Employees actions
  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEmp) {
      setEmployees(prev => prev.map(emp => emp.id === editingEmp.id ? { ...editingEmp } : emp));
      setEditingEmp(null);
    } else {
      const id = 'emp_' + Math.random().toString(36).substring(2, 9);
      const newEmp: Employee = {
        id,
        name: newEmpForm.name,
        role: newEmpForm.role,
        pin: newEmpForm.pin || String(Math.floor(1000 + Math.random() * 9000)),
        branchId: newEmpForm.branchId,
        active: true,
        phone: newEmpForm.phone || '492-xxx-xxxx',
        email: newEmpForm.email || `${newEmpForm.name.toLowerCase().replace(/\s+/g, '')}@laeloteria.com`
      };
      setEmployees(prev => [...prev, newEmp]);
      setNewEmpForm({ name: '', role: 'staff', pin: '', branchId: 'suc_centro', phone: '', email: '' });
    }
    setShowEmpModal(false);
  };

  const toggleEmployeeActive = (id: string, currentStatus: boolean) => {
    setEmployees(prev => prev.map(emp => emp.id === id ? { ...emp, active: !currentStatus } : emp));
  };


  return (
    <div className="space-y-6" id="admin_dashboard_root">
      {/* Banner / Header local dashboard */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
            <span>👑</span> Central de Administración Global
          </h2>
          <p className="text-gray-500 text-xs mt-1">
            Revisión en tiempo real de márgenes de ganancia, recetas, personal, sucursales y ajustes extraordinarios de inventario de <strong>La Elotería de Zacatecas</strong>.
          </p>
        </div>

        {/* Branch Filter dropdown */}
        <div className="flex items-center gap-2.5">
          <label className="text-xs font-bold text-gray-500 font-mono">Filtrar Todo:</label>
          <select
            value={selectedBranchFilter}
            onChange={(e) => setSelectedBranchFilter(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg p-2 bg-stone-50 text-gray-700 font-sans focus:outline-none focus:ring-1 focus:ring-[#155E37]"
            id="branch_selector_admin"
          >
            <option value="all">Todas las Sucursales</option>
            {branches.map(br => (
              <option key={br.id} value={br.id}>{br.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="flex border-b border-gray-100 bg-white p-1 rounded-xl shadow-sm gap-1">
        <button
          onClick={() => setActiveSubTab('stats')}
          className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-bold transition ${activeSubTab === 'stats' ? 'bg-[#155E37] text-white shadow-sm' : 'text-gray-500 hover:text-gray-800 hover:bg-stone-50'}`}
        >
          📈 Stats Negocio
        </button>
        <button
          onClick={() => setActiveSubTab('menu')}
          className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-bold transition ${activeSubTab === 'menu' ? 'bg-[#155E37] text-white shadow-sm' : 'text-gray-500 hover:text-gray-800 hover:bg-stone-50'}`}
        >
          🌽 Menú y Receteas
        </button>
        <button
          onClick={() => setActiveSubTab('org')}
          className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-bold transition ${activeSubTab === 'org' ? 'bg-[#155E37] text-white shadow-sm' : 'text-gray-500 hover:text-gray-800 hover:bg-stone-50'}`}
        >
          🏢 Sucursales y Equipo
        </button>
        <button
          onClick={() => setActiveSubTab('audits')}
          className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-bold transition relative ${activeSubTab === 'audits' ? 'bg-[#155E37] text-white shadow-sm' : 'text-gray-500 hover:text-gray-800 hover:bg-stone-50'}`}
        >
          🔑 Cortes y Auditorías (Pendientes)
          {(audits.filter(a => a.status === 'pendiente_aprobacion').length > 0 ||
            cortes.filter(c => c.status === 'pendiente').length > 0) && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-bold flex items-center justify-center animate-bounce">
              {audits.filter(a => a.status === 'pendiente_aprobacion').length + cortes.filter(c => c.status === 'pendiente').length}
            </span>
          )}
        </button>
      </div>

      {/* SUB-TAB CONTENTS */}

      {/* TAB 1: FINANCIALS STATS */}
      {activeSubTab === 'stats' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Top KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400 font-mono">Ventas Brutas</p>
                <h3 className="text-xl font-extrabold text-[#155E37] mt-1">${totalGross.toFixed(2)}</h3>
                <span className="text-[10px] text-gray-500">Ingreso total en caja</span>
              </div>
              <div className="p-3 bg-green-50 text-[#155E37] rounded-lg">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400 font-mono">Ganancia Neta</p>
                <h3 className="text-xl font-extrabold text-emerald-700 mt-1">${totalNet.toFixed(2)}</h3>
                <span className="text-[10px] text-gray-500">Descontando insumos</span>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg animate-pulse">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400 font-mono">Margen de Ganancia</p>
                <h3 className="text-xl font-extrabold text-amber-600 mt-1">{netMargin.toFixed(1)}%</h3>
                <span className="text-[10px] text-gray-500">Excelente rentabilidad</span>
              </div>
              <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400 font-mono">Ticket Medio</p>
                <h3 className="text-xl font-extrabold text-sky-700 mt-1">${ticketMedio.toFixed(2)}</h3>
                <span className="text-[10px] text-gray-500">{filteredSales.length} compras totales</span>
              </div>
              <div className="p-3 bg-sky-50 text-sky-700 rounded-lg">
                <ShoppingBag className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Sales chart & popular/slow items */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Visual Column / Mini Sales Chart */}
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm lg:col-span-2">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider font-mono mb-4">
                Desglose de Ventas por Platillo (Piezas vendidas)
              </h3>
              {sortedSalesData.length === 0 ? (
                <div className="h-44 flex items-center justify-center text-xs text-gray-400">
                  Ninguna venta registrada para el filtro seleccionado.
                </div>
              ) : (
                <div className="space-y-3.5">
                  {sortedSalesData.map(item => {
                    const maxQty = Math.max(...sortedSalesData.map(i => i.qty));
                    const widthPct = (item.qty / maxQty) * 100;
                    return (
                      <div key={item.id} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-gray-700">{item.name}</span>
                          <span className="font-mono text-stone-500">{item.qty} piezas ({item.category})</span>
                        </div>
                        <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${widthPct}%` }}
                            className={`h-full rounded-full ${
                              item.category === 'Especialidades' ? 'bg-[#155E37]' : 'bg-amber-500'
                            }`}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Top / Slow Selling widgets */}
            <div className="space-y-4">
              {/* Product performance ranking */}
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider font-mono mb-3.5">
                  🔥 Los Más Vendidos
                </h4>
                {topItems.length === 0 ? (
                  <p className="text-xs text-gray-400">Sin estadísticas aún</p>
                ) : (
                  <div className="space-y-2">
                    {topItems.map((item, index) => (
                      <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 text-emerald-900 text-xs">
                        <span className="font-bold">{index + 1}. {item.name}</span>
                        <span className="font-semibold font-mono">{item.qty} pzas</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider font-mono mb-3.5">
                  ⚠️ Poca Demanda (Ajustar Promoción)
                </h4>
                {slowItems.length === 0 ? (
                  <p className="text-xs text-stone-400">Sin estadísticas aún</p>
                ) : (
                  <div className="space-y-2">
                    {slowItems.map((item, index) => (
                      <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-stone-50 text-stone-600 text-xs">
                        <span className="font-bold">{item.name}</span>
                        <span className="font-semibold font-mono">{item.qty} pzas</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Critical Raw Material Warnings */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider font-mono mb-3 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              Estado Crítico de Insumos Básicos (Por debajo de Stock Mínimo)
            </h3>
            {lowStockList.length === 0 ? (
              <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-lg flex items-center gap-2 font-medium">
                <CheckCircle className="w-4 h-4 text-emerald-600" /> Todas las materias primas se encuentran en niveles seguros en las sucursales.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {lowStockList.map(raw => (
                  <div key={raw.id} className="p-3 border border-red-100 bg-red-50/50 rounded-lg flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-gray-800">{raw.name}</p>
                      <p className="text-[10px] text-gray-500 font-mono mt-0.5">Mínimo requerido: {raw.minStock} {raw.unit}</p>
                    </div>
                    <div className="text-right">
                      {Object.entries(raw.currentStock).map(([branchId, qty]) => {
                        const br = branches.find(b => b.id === branchId);
                        if (qty > raw.minStock) return null;
                        return (
                          <span key={branchId} className="block text-[10px] font-bold text-red-600 font-mono">
                            {br?.name.split(' ')[0]}: {qty} {raw.unit}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MENU & FORMULA EDITOR */}
      {activeSubTab === 'menu' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between bg-stone-50 p-4 rounded-xl border border-stone-200">
            <div>
              <h3 className="text-sm font-extrabold text-[#155E37]">Menú Oficial y Recetario</h3>
              <p className="text-xs text-gray-500">Configura precios, costos y amarra los platillos a un consumo exacto de insumos crudos.</p>
            </div>
            <button
               onClick={() => {
                setEditingItem(null);
                setNewMenuForm({
                  name: '', description: '', category: 'Elotes', price: 35, cost: 12, ingredients: []
                });
                setShowItemModal(true);
              }}
              className="flex items-center gap-1 bg-[#155E37] hover:bg-[#0E4025] text-white font-bold text-xs py-2 px-3.5 rounded-lg shadow-sm transition"
              id="add_platillo_btn"
            >
              <Plus className="w-4 h-4" /> Agregar Platillo
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {menuItems.map(item => (
              <div key={item.id} className={`bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between ${!item.active ? 'opacity-55 border-dashed border-gray-200' : 'border-gray-100'}`}>
                {/* Visual header */}
                <div className="p-4 flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[9px] font-extrabold font-mono tracking-wider text-[#155E37] px-2 py-0.5 rounded-full bg-green-50 uppercase">
                        {item.category}
                      </span>
                      <h4 className="text-sm font-bold text-gray-800 mt-2">{item.name}</h4>
                    </div>
                    {!item.active && <span className="text-[10px] bg-gray-100 text-gray-500 font-bold px-1.5 py-0.5 rounded">Fuera de menú</span>}
                  </div>
                  <p className="text-xs text-stone-500 mt-2 line-clamp-2 leading-snug">{item.description}</p>

                  {/* Financial calculation */}
                  <div className="mt-4 pt-3.5 border-t border-gray-50 grid grid-cols-2 gap-2 text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-gray-400 block font-sans">Precio Cliente:</span>
                      <span className="font-extrabold text-[#155E37] text-sm">${item.price.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 block font-sans">Costo de Insumos:</span>
                      <span className="font-extrabold text-stone-700 text-sm">${item.cost.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Margen individual */}
                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-stone-600 bg-stone-50 p-2 rounded-lg font-mono">
                    <span>Margen Unitario:</span>
                    <span className="font-bold text-emerald-700">
                      ${(item.price - item.cost).toFixed(2)} ({(((item.price - item.cost) / item.price) * 100).toFixed(0)}%)
                    </span>
                  </div>

                  {/* Recipe ingredients */}
                  <div className="mt-3">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono mb-1">Receta / Insumos:</p>
                    {item.ingredients.length === 0 ? (
                      <p className="text-[10px] text-stone-400 italic">No requiere stock controlado</p>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {item.ingredients.map(ing => {
                          const rawName = rawIngredients.find(r => r.id === ing.rawItemId)?.name || ing.rawItemId;
                          return (
                            <span key={ing.rawItemId} className="text-[10px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded border border-stone-200/50">
                              {rawName}: {ing.quantity}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Operations */}
                <div className="bg-stone-50 px-4 py-2.5 border-t border-gray-100 flex items-center justify-end gap-2 text-xs">
                  <button
                    onClick={() => {
                      setEditingItem(item);
                      setShowItemModal(true);
                    }}
                    className="flex items-center gap-1 text-[#155E37] hover:text-green-905 font-bold p-1"
                    title="Editar receta y precio"
                  >
                    <Edit className="w-3.5 h-3.5" /> Editar
                  </button>
                  {item.active && (
                    <button
                      onClick={() => handleDeleteMenuItem(item.id)}
                      className="flex items-center gap-1 text-red-500 hover:text-red-700 font-bold p-1"
                      title="Quitar"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Desactivar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ORGANIZACION / EQUIPO */}
      {activeSubTab === 'org' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Sucursales list */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-4">
              <div>
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider font-mono">Sucursales Operativas</h3>
                <p className="text-xs text-gray-500 mt-0.5">Locales que registran ventas, cajeros y almacenes.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {branches.map(br => (
                <div key={br.id} className="p-4 border border-stone-100 bg-stone-50/50 rounded-xl flex items-start gap-3">
                  <div className="p-2.5 bg-[#155E37]/10 text-[#155E37] rounded-lg">
                    <Home className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-800">{br.name}</h4>
                    <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">{br.address}</p>
                    <p className="text-[10px] text-[#155E37] font-semibold mt-2 font-mono">☎ {br.phone}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Empleados list */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-4">
              <div>
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider font-mono">Personal & Roles</h3>
                <p className="text-xs text-gray-500 mt-0.5 font-sans">Administración de usuarios autorizados y claves PIN de acceso.</p>
              </div>
              <button
                onClick={() => {
                  setEditingEmp(null);
                  setNewEmpForm({ name: '', role: 'staff', pin: '', branchId: 'suc_centro', phone: '', email: '' });
                  setShowEmpModal(true);
                }}
                className="flex items-center gap-1 bg-[#155E37] hover:bg-[#0E4025] text-white font-bold text-xs py-2 px-3 rounded-lg shadow-sm transition"
              >
                <Plus className="w-3.5 h-3.5" /> Dar de Alta Empleado
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-gray-600">
                <thead className="bg-[#155E37]/5 text-[#155E37] font-mono select-none uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Nombre</th>
                    <th className="p-3">Fichaje PIN</th>
                    <th className="p-3">Rol asignado</th>
                    <th className="p-3">Sucursal Base</th>
                    <th className="p-3">Contacto</th>
                    <th className="p-3">Estatus</th>
                    <th className="p-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {employees.map(emp => {
                    const br = branches.find(b => b.id === emp.branchId);
                    return (
                      <tr key={emp.id} className={`hover:bg-stone-50/50 ${!emp.active ? 'opacity-50' : ''}`}>
                        <td className="p-3 font-bold text-stone-800">{emp.name}</td>
                        <td className="p-3 font-mono font-bold text-[#155E37]">{emp.pin}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                            emp.role === 'admin' ? 'bg-[#155E37] text-white' :
                            emp.role === 'gerente' ? 'bg-amber-100 text-amber-800' :
                            emp.role === 'cajero' ? 'bg-sky-100 text-sky-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {emp.role.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-3">{emp.role === 'admin' ? 'Global' : br?.name || 'Zacatecas'}</td>
                        <td className="p-3 font-mono text-[10.5px]">
                          <div>{emp.phone}</div>
                          <div className="text-gray-400 font-sans text-[10px]">{emp.email}</div>
                        </td>
                        <td className="p-3">
                          <span className={`inline-flex items-center gap-1 font-bold ${emp.active ? 'text-emerald-700' : 'text-red-500'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${emp.active ? 'bg-emerald-600' : 'bg-red-500'}`}></span>
                            {emp.active ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => {
                              setEditingEmp(emp);
                              setShowEmpModal(true);
                            }}
                            className="text-[#155E37] hover:underline font-bold mr-3"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => toggleEmployeeActive(emp.id, emp.active)}
                            className={`${emp.active ? 'text-red-500 hover:text-red-700' : 'text-emerald-600 hover:text-emerald-800'} font-bold`}
                          >
                            {emp.active ? 'Suspender' : 'Reactivar'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Supplier Directory */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider font-mono border-b border-gray-100 pb-3 mb-4">
              Directorio de Proveedores Estratégicos (Materia Prima)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {suppliers.map(sup => (
                <div key={sup.id} className="p-4 border border-stone-200/50 rounded-xl bg-stone-50/25">
                  <div className="flex items-center gap-2 mb-2">
                    <Truck className="w-4 h-4 text-stone-500" />
                    <h4 className="text-xs font-bold text-[#155E37]">{sup.name}</h4>
                  </div>
                  <p className="text-[11px] text-gray-600">Atiende: <span className="font-semibold text-gray-800">{sup.contact}</span></p>
                  <p className="text-[11px] text-gray-500 font-mono mt-2">☎ {sup.phone}</p>
                  <p className="text-[10px] text-gray-400 font-mono italic truncate mt-0.5">{sup.email}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: AUDITORIAS EXTRAORDINARIAS & CORTES DE CAJA */}
      {activeSubTab === 'audits' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Inventory adjustment audits */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider font-mono border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#155E37]" />
              Aprobación de Ajustes Extraordinarios de Inventario
            </h3>
            {audits.filter(a => a.status === 'pendiente_aprobacion').length === 0 ? (
              <p className="p-4 bg-emerald-50 text-emerald-800 text-xs rounded-lg font-medium">
                No hay solicitudes de ajuste de inventario extraordinario pendientes de aprobación por el dueño.
              </p>
            ) : (
              <div className="space-y-3.5">
                {audits.filter(a => a.status === 'pendiente_aprobacion').map(aud => {
                  const branchName = branches.find(b => b.id === aud.branchId)?.name || aud.branchId;
                  const rawName = rawIngredients.find(r => r.id === aud.rawItemId)?.name || aud.rawItemId;
                  const unit = rawIngredients.find(r => r.id === aud.rawItemId)?.unit || '';
                  return (
                    <div key={aud.id} className="p-4 border border-amber-200 bg-amber-50/30 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-extrabold font-mono tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded uppercase">
                            SOLICITUD DE AJUSTE
                          </span>
                          <span className="text-xs font-bold text-stone-800">{branchName}</span>
                        </div>
                        <p className="text-xs text-stone-800 mt-2">
                          Insumo: <span className="font-bold">{rawName}</span> • Sistema marca: <span className="font-bold">{aud.systemQty} {unit}</span> • Conteo físico: <span className="font-bold text-red-600">{aud.actualQty} {unit}</span>
                        </p>
                        <p className="text-[10px] text-[#155E37] font-semibold mt-1 font-mono">
                          Diferencia (Merma/Exceso): <span className="font-bold">{aud.difference} {unit}</span>
                        </p>
                        {aud.notes && <p className="text-xs text-amber-900 mt-1 italic">Nota Gerente: &ldquo;{aud.notes}&rdquo;</p>}
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <button
                          onClick={() => handleApproveAudit(aud.id)}
                          className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-3 rounded-lg shadow-sm"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Aprobar Ajuste de Almacén
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Cuts Auditing discrepancy or general audits */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider font-mono border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-[#155E37]" />
              Auditoría y Aprobación de Cortes de Turno (Cajeros)
            </h3>
            {cortes.filter(c => c.status === 'pendiente' || c.status === 'discrepancia').length === 0 ? (
              <p className="p-4 bg-emerald-50 text-emerald-800 text-xs rounded-lg font-medium">
                Todos los cortes de turno han sido auditados o aprobados correctamente.
              </p>
            ) : (
              <div className="space-y-3">
                {cortes.filter(c => c.status === 'pendiente' || c.status === 'discrepancia').map(c => {
                  const branchName = branches.find(b => b.id === c.branchId)?.name || c.branchId;
                  const hasDiscrepancy = Math.abs(c.difference) > 0;
                  return (
                    <div key={c.id} className={`p-4 border rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 ${hasDiscrepancy ? 'border-red-200 bg-red-50/25' : 'border-stone-200 bg-stone-50/50'}`}>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-extrabold font-mono tracking-wider px-2 py-0.5 rounded uppercase ${
                            hasDiscrepancy ? 'bg-red-100 text-red-800' : 'bg-stone-200 text-stone-800'
                          }`}>
                            {hasDiscrepancy ? 'DIFERENCIA DETECTADA' : 'CORTE COMPLETO'}
                          </span>
                          <span className="text-xs font-bold text-stone-800">{branchName}</span>
                        </div>
                        <p className="text-xs text-stone-800 mt-2">
                          Cajero: <span className="font-bold">{c.employeeName}</span> • Fecha: <span className="font-mono">{c.date} ({c.openedAt} - {c.closedAt})</span>
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2.5 text-[11px] font-mono">
                          <div>
                            <span className="text-[10px] text-gray-400 block font-sans">Efectivo Esperado:</span>
                            <span className="font-bold text-stone-700">${c.expectedCash.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-400 block font-sans">Efectivo Declarado:</span>
                            <span className="font-extrabold text-[#155E37]">${c.declaredCash.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-400 block font-sans">Venta por Tarjeta:</span>
                            <span className="font-bold text-stone-700">${c.totalSalesCard.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-400 block font-sans">Faltante/Sobrante:</span>
                            <span className={`font-extrabold ${c.difference < 0 ? 'text-red-600' : c.difference > 0 ? 'text-emerald-700' : 'text-stone-700'}`}>
                              ${c.difference.toFixed(2)}
                            </span>
                          </div>
                        </div>
                        {c.notes && <p className="text-xs text-stone-500 mt-2 italic">Comentario Cajero: &ldquo;{c.notes}&rdquo;</p>}
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <button
                          onClick={() => handleApproveCorte(c.id)}
                          className="flex items-center gap-1 bg-[#155E37] hover:bg-[#0E4025] text-white font-bold py-1.5 px-3 rounded-lg shadow-sm"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Cerrar &amp; Auditar Caja
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODALS */}

      {/* MODAL 1: ADD/EDIT MENU ITEM */}
      {showItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-100 w-full max-w-md overflow-hidden">
            <div className="bg-[#155E37] text-white p-4">
              <h3 className="font-bold text-sm tracking-tight">
                {editingItem ? 'Editar Platillo / Receta' : 'Añadir Nuevo Platillo al Menú'}
              </h3>
            </div>
            <form onSubmit={handleSaveMenuItem} className="p-4 space-y-3.5 text-xs max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-gray-500 font-bold mb-1">Nombre del Platillo:</label>
                <input
                  type="text"
                  required
                  value={editingItem ? editingItem.name : newMenuForm.name}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (editingItem) setEditingItem({ ...editingItem, name: val });
                    else setNewMenuForm({ ...newMenuForm, name: val });
                  }}
                  className="w-full border border-gray-200 rounded-lg p-2 bg-stone-50"
                  placeholder="Por ejemplo: Chorielote Vasito Loco"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-500 font-bold mb-1">Precio de Venta ($):</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={editingItem ? editingItem.price : newMenuForm.price}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (editingItem) setEditingItem({ ...editingItem, price: val });
                      else setNewMenuForm({ ...newMenuForm, price: val });
                    }}
                    className="w-full border border-gray-200 rounded-lg p-2 bg-stone-50"
                  />
                </div>
                <div>
                  <label className="block text-gray-500 font-bold mb-1">Costo Estimado de Insumos ($):</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={editingItem ? editingItem.cost : newMenuForm.cost}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (editingItem) setEditingItem({ ...editingItem, cost: val });
                      else setNewMenuForm({ ...newMenuForm, cost: val });
                    }}
                    className="w-full border border-gray-200 rounded-lg p-2 bg-stone-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-500 font-bold mb-1">Categoría:</label>
                <select
                  value={editingItem ? editingItem.category : newMenuForm.category}
                  onChange={(e) => {
                    const val = e.target.value as MenuItem['category'];
                    if (editingItem) setEditingItem({ ...editingItem, category: val });
                    else setNewMenuForm({ ...newMenuForm, category: val });
                  }}
                  className="w-full border border-gray-200 rounded-lg p-2 bg-stone-50"
                >
                  <option value="Elotes">Elotes</option>
                  <option value="Esquites">Esquites</option>
                  <option value="Especialidades">Especialidades</option>
                  <option value="Bebidas">Bebidas</option>
                  <option value="Adiciones">Adiciones</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-500 font-bold mb-1">Descripción del Platillo:</label>
                <textarea
                  value={editingItem ? editingItem.description : newMenuForm.description}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (editingItem) setEditingItem({ ...editingItem, description: val });
                    else setNewMenuForm({ ...newMenuForm, description: val });
                  }}
                  className="w-full border border-gray-200 rounded-lg p-2 bg-stone-50 h-16 resize-none"
                  placeholder="Escribe los detalles que verá el cliente..."
                />
              </div>

              {/* RECIPE ingredients editor inside form */}
              <div className="border border-stone-150 p-3 rounded-lg bg-stone-50/70">
                <p className="font-bold text-gray-700 mb-1.5 flex items-center justify-between">
                  <span>⚓ Sincronizar Insumos (Receta)</span>
                  <span className="text-[10px] text-gray-400">Reduce stock del inventario en ventas</span>
                </p>

                {/* Listing ingredients assigned */}
                <div className="space-y-1.5 max-h-24 overflow-y-auto mb-3">
                  {(editingItem ? editingItem.ingredients : newMenuForm.ingredients).length === 0 ? (
                    <p className="italic text-stone-400 text-center text-[10.5px]">No hay insumos asignados a este platillo.</p>
                  ) : (
                    (editingItem ? editingItem.ingredients : newMenuForm.ingredients).map(ing => {
                      const raw = rawIngredients.find(r => r.id === ing.rawItemId);
                      return (
                        <div key={ing.rawItemId} className="flex items-center justify-between p-1.5 bg-white border border-stone-200 rounded-md text-[10.5px]">
                          <span>{raw?.name || ing.rawItemId}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-bold font-mono text-[#155E37]">{ing.quantity} {raw?.unit}</span>
                            <button
                              type="button"
                              onClick={() => {
                                if (editingItem) {
                                  setEditingItem({
                                    ...editingItem,
                                    ingredients: editingItem.ingredients.filter(i => i.rawItemId !== ing.rawItemId)
                                  });
                                } else {
                                  setNewMenuForm({
                                    ...newMenuForm,
                                    ingredients: newMenuForm.ingredients.filter(i => i.rawItemId !== ing.rawItemId)
                                  });
                                }
                              }}
                              className="text-red-500 font-bold hover:underline"
                            >
                              x
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Row to add raw ingredient to list */}
                <div className="grid grid-cols-12 gap-1.5 items-end pt-2 border-t border-stone-200">
                  <div className="col-span-6">
                    <label className="text-[10px] text-gray-400 block pb-0.5">Insumo:</label>
                    <select
                      value={ingredientSelectorRawId}
                      onChange={(e) => setIngredientSelectorRawId(e.target.value)}
                      className="w-full border border-gray-200 rounded p-1.5 bg-white text-[10.5px]"
                    >
                      <option value="">-- Escoger --</option>
                      {rawIngredients.map(raw => (
                        <option key={raw.id} value={raw.id}>{raw.name} ({raw.unit})</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-4">
                    <label className="text-[10px] text-gray-400 block pb-0.5">Cantidad:</label>
                    <input
                      type="number"
                      step="0.001"
                      value={ingredientSelectorQty}
                      onChange={(e) => setIngredientSelectorQty(Number(e.target.value))}
                      className="w-full border border-gray-200 rounded p-1.5 bg-white text-[10.5px]"
                      placeholder="0.05"
                    />
                  </div>
                  <div className="col-span-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (editingItem) {
                          // edit item directly
                          if (!ingredientSelectorRawId || ingredientSelectorQty <= 0) return;
                          const exists = editingItem.ingredients.some(i => i.rawItemId === ingredientSelectorRawId);
                          let updated = [];
                          if (exists) {
                            updated = editingItem.ingredients.map(i =>
                              i.rawItemId === ingredientSelectorRawId ? { ...i, quantity: i.quantity + ingredientSelectorQty } : i
                            );
                          } else {
                            updated = [...editingItem.ingredients, { rawItemId: ingredientSelectorRawId, quantity: ingredientSelectorQty }];
                          }
                          setEditingItem({ ...editingItem, ingredients: updated });
                          setIngredientSelectorQty(0);
                        } else {
                          handleAddIngredientToRecipe();
                        }
                      }}
                      className="w-full bg-[#155E37] text-white p-2 rounded text-center font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="px-3 py-2 border border-gray-200 text-gray-500 rounded-lg hover:bg-stone-50 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#155E37] text-white rounded-lg hover:bg-[#0E4025] font-bold shadow-sm"
                >
                  <Save className="w-3.5 h-3.5 inline mr-1" /> Guardar Platillo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD/EDIT EMPLOYEE */}
      {showEmpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-100 w-full max-w-sm overflow-hidden">
            <div className="bg-[#155E37] text-white p-4">
              <h3 className="font-bold text-sm tracking-tight">
                {editingEmp ? 'Editar Datos de Personal' : 'Alta de Nuevo Empleado'}
              </h3>
            </div>
            <form onSubmit={handleSaveEmployee} className="p-4 space-y-3.5 text-xs">
              <div>
                <label className="block text-gray-500 font-bold mb-1">Nombre Completo:</label>
                <input
                  type="text"
                  required
                  value={editingEmp ? editingEmp.name : newEmpForm.name}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (editingEmp) setEditingEmp({ ...editingEmp, name: val });
                    else setNewEmpForm({ ...newEmpForm, name: val });
                  }}
                  className="w-full border border-gray-200 rounded-lg p-2 bg-stone-50"
                  placeholder="E.g., Eduardo Escamilla"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-500 font-bold mb-1">Rol Operativo:</label>
                  <select
                    value={editingEmp ? editingEmp.role : newEmpForm.role}
                    onChange={(e) => {
                      const val = e.target.value as Employee['role'];
                      if (editingEmp) setEditingEmp({ ...editingEmp, role: val });
                      else setNewEmpForm({ ...newEmpForm, role: val });
                    }}
                    className="w-full border border-gray-200 rounded-lg p-2 bg-stone-50"
                  >
                    <option value="admin">Administrador / Dueño</option>
                    <option value="gerente">Gerente de Sucursal</option>
                    <option value="cajero">Cajero / Operador</option>
                    <option value="staff">Staff / Repostería</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-500 font-bold mb-1">PIN Checador (4 Dígitos):</label>
                  <input
                    type="text"
                    required
                    maxLength={4}
                    value={editingEmp ? editingEmp.pin : newEmpForm.pin}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, ''); // numerical digits only
                      if (editingEmp) setEditingEmp({ ...editingEmp, pin: val });
                      else setNewEmpForm({ ...newEmpForm, pin: val });
                    }}
                    className="w-full border border-gray-200 rounded-lg p-2 bg-stone-50 font-mono tracking-widest text-center"
                    placeholder="9090"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-500 font-bold mb-1">Sucursal Asignada:</label>
                <select
                  value={editingEmp ? editingEmp.branchId : newEmpForm.branchId}
                  disabled={editingEmp ? editingEmp.role === 'admin' : newEmpForm.role === 'admin'}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (editingEmp) setEditingEmp({ ...editingEmp, branchId: val });
                    else setNewEmpForm({ ...newEmpForm, branchId: val });
                  }}
                  className="w-full border border-gray-200 rounded-lg p-2 bg-stone-50 disabled:opacity-50"
                >
                  {branches.map(br => (
                    <option key={br.id} value={br.id}>{br.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-500 font-bold mb-1">Teléfono:</label>
                  <input
                    type="text"
                    value={editingEmp ? editingEmp.phone : newEmpForm.phone}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (editingEmp) setEditingEmp({ ...editingEmp, phone: val });
                      else setNewEmpForm({ ...newEmpForm, phone: val });
                    }}
                    className="w-full border border-gray-200 rounded-lg p-2 bg-stone-50"
                    placeholder="492-444-5555"
                  />
                </div>
                <div>
                  <label className="block text-gray-500 font-bold mb-1">Correo Electrónico:</label>
                  <input
                    type="email"
                    value={editingEmp ? editingEmp.email : newEmpForm.email}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (editingEmp) setEditingEmp({ ...editingEmp, email: val });
                      else setNewEmpForm({ ...newEmpForm, email: val });
                    }}
                    className="w-full border border-gray-200 rounded-lg p-2 bg-stone-50"
                    placeholder="ejemplo@correo.com"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowEmpModal(false)}
                  className="px-3 py-2 border border-gray-200 text-gray-500 rounded-lg hover:bg-stone-50 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#155E37] text-white rounded-lg hover:bg-[#0E4025] font-bold"
                >
                  Guardar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
