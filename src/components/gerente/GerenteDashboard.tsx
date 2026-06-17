/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  TrendingUp, Activity, ClipboardCheck, ArrowLeftRight, Clock, AlertCircle,
  HelpCircle, Trash2, CheckCircle, RefreshCcw, Eye, Plus, ChevronRight
} from 'lucide-react';
import {
  Employee, Branch, MenuItem, RawIngredient, Sale, StockTransfer, InventoryAudit, CorteCaja, ClockInLog
} from '../../types';

interface GerenteDashboardProps {
  currentEmployee: Employee;
  branches: Branch[];
  menuItems: MenuItem[];
  rawIngredients: RawIngredient[];
  setRawIngredients: React.Dispatch<React.SetStateAction<RawIngredient[]>>;
  employees: Employee[];
  sales: Sale[];
  setSales: React.Dispatch<React.SetStateAction<Sale[]>>;
  transfers: StockTransfer[];
  setTransfers: React.Dispatch<React.SetStateAction<StockTransfer[]>>;
  audits: InventoryAudit[];
  setAudits: React.Dispatch<React.SetStateAction<InventoryAudit[]>>;
  cortes: CorteCaja[];
  setCortes: React.Dispatch<React.SetStateAction<CorteCaja[]>>;
  clockIns: ClockInLog[];
}

type GerenteSubTab = 'stats' | 'cortes' | 'logistica' | 'asistencia';

export default function GerenteDashboard({
  currentEmployee,
  branches,
  menuItems,
  rawIngredients, setRawIngredients,
  employees,
  sales, setSales,
  transfers, setTransfers,
  audits, setAudits,
  cortes, setCortes,
  clockIns
}: GerenteDashboardProps) {
  const [activeSubTab, setActiveSubTab] = useState<GerenteSubTab>('stats');
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);

  // Forms states
  const [transferForm, setTransferForm] = useState({
    targetBranchId: '',
    rawItemId: '',
    quantity: 1
  });

  const [auditForm, setAuditForm] = useState({
    rawItemId: '',
    actualQty: 0,
    notes: ''
  });

  const managerBranchId = currentEmployee.branchId;
  const localBranch = branches.find(b => b.id === managerBranchId);

  // 1. FILTER ACTIONS SPECIFIC TO GERENTE'S ASSIGNED BRANCH
  const localSales = sales.filter(s => s.branchId === managerBranchId);
  const localEmployees = employees.filter(e => e.branchId === managerBranchId);
  const localCortes = cortes.filter(c => c.branchId === managerBranchId);
  const localClockIns = clockIns.filter(c => {
    const emp = employees.find(e => e.id === c.employeeId);
    return emp && emp.branchId === managerBranchId;
  });

  // Calculate stats for current branch
  const activeSales = localSales.filter(s => s.status === 'completada');
  const localGross = activeSales.reduce((sum, s) => sum + s.total, 0);
  const localTransactions = activeSales.length;
  const localTicketMedio = localTransactions > 0 ? localGross / localTransactions : 0;

  // Handler for Authorizing Cancelation of a Sale
  const handleCancelSale = (saleId: string) => {
    if (!confirm('¿Estás seguro de que deseas AUTORIZAR la cancelación de esta venta? Los insumos consumidos serán reintegrados al Stock de la sucursal.')) {
      return;
    }

    const targetSale = sales.find(s => s.id === saleId);
    if (!targetSale) return;

    // Reintegrate raw ingredients
    setRawIngredients(prev => prev.map(raw => {
      // Find how much this sale used of this raw ingredient
      let consumed = 0;
      targetSale.items.forEach(soldItem => {
        const menuItem = menuItems.find(m => m.id === soldItem.menuItemId);
        if (menuItem) {
          const ingredientRequirement = menuItem.ingredients.find(i => i.rawItemId === raw.id);
          if (ingredientRequirement) {
            consumed += ingredientRequirement.quantity * soldItem.quantity;
          }
        }
      });

      if (consumed > 0) {
        const stocks = { ...raw.currentStock };
        stocks[managerBranchId] = (stocks[managerBranchId] || 0) + consumed;
        return { ...raw, currentStock: stocks };
      }
      return raw;
    }));

    // Update sale status
    setSales(prev => prev.map(s => s.id === saleId ? { ...s, status: 'cancelada', cancelledBy: currentEmployee.name } : s));
  };

  // Validating Cashier Shifts Cuts
  const handleValidateCorte = (corteId: string, action: 'aprobar' | 'discrepancia') => {
    setCortes(prev => prev.map(c => {
      if (c.id === corteId) {
        return {
          ...c,
          status: action === 'aprobar' ? 'aprobado' : 'discrepancia',
          validatedBy: currentEmployee.name,
          notes: `${c.notes || ''} [Validado por Supervisor: ${action === 'aprobar' ? 'Conforme' : 'Marcado con Discrepancia'}]`
        };
      }
      return c;
    }));
  };

  // Submitting inventory audit
  const handleSubmitAudit = (e: React.FormEvent) => {
    e.preventDefault();
    const rawIng = rawIngredients.find(r => r.id === auditForm.rawItemId);
    if (!rawIng) return;

    const systemQty = rawIng.currentStock[managerBranchId] || 0;
    const difference = auditForm.actualQty - systemQty;

    const newAudit: InventoryAudit = {
      id: 'audit_' + Math.random().toString(36).substring(2, 9),
      branchId: managerBranchId,
      rawItemId: auditForm.rawItemId,
      systemQty,
      actualQty: auditForm.actualQty,
      difference,
      status: 'pendiente_aprobacion', // owner must approve extraordinary changes
      date: new Date().toISOString().split('T')[0],
      notes: auditForm.notes
    };

    setAudits(prev => [newAudit, ...prev]);
    setShowAuditModal(false);
    setAuditForm({ rawItemId: '', actualQty: 0, notes: '' });
  };

  // Requesting transfer
  const handleRequestTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferForm.targetBranchId || !transferForm.rawItemId || transferForm.quantity <= 0) return;

    const newTransfer: StockTransfer = {
      id: 'trans_' + Math.random().toString(36).substring(2, 9),
      sourceBranchId: managerBranchId, // source asks for transfer
      targetBranchId: transferForm.targetBranchId, // transfer destination
      rawItemId: transferForm.rawItemId,
      quantity: Number(transferForm.quantity),
      status: 'pendiente',
      requestedBy: currentEmployee.name,
      date: new Date().toISOString().split('T')[0]
    };

    setTransfers(prev => [newTransfer, ...prev]);
    setShowTransferModal(false);
    setTransferForm({ targetBranchId: '', rawItemId: '', quantity: 1 });
  };

  // Accept a transfer sent from other branch
  const handleReceiveTransfer = (transId: string) => {
    const trans = transfers.find(t => t.id === transId);
    if (!trans) return;

    // Reduce stock from source and add to destination
    setRawIngredients(prev => prev.map(raw => {
      if (raw.id === trans.rawItemId) {
        const stocks = { ...raw.currentStock };
        // subtract from target (which is sending) and add to source (which requested)
        stocks[trans.targetBranchId] = Math.max(0, (stocks[trans.targetBranchId] || 0) - trans.quantity);
        stocks[trans.sourceBranchId] = (stocks[trans.sourceBranchId] || 0) + trans.quantity;
        return { ...raw, currentStock: stocks };
      }
      return raw;
    }));

    setTransfers(prev => prev.map(t => t.id === transId ? { ...t, status: 'recibido' } : t));
  };

  const handleCancelTransfer = (transId: string) => {
    setTransfers(prev => prev.map(t => t.id === transId ? { ...t, status: 'cancelado' } : t));
  };


  return (
    <div className="space-y-6" id="gerente_dashboard_root">
      {/* Branch Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
        <div>
          <span className="text-[9px] font-bold text-[#155E37] px-2 py-0.5 rounded-full bg-green-50 uppercase font-mono tracking-wider">
            Módulo Supervisor Autorizado
          </span>
          <h2 className="text-lg font-bold text-gray-800 tracking-tight mt-1 flex items-center gap-2">
            <span>🏢</span> Sucursal: <span className="text-[#155E37]">{localBranch ? localBranch.name : 'Asignada'}</span>
          </h2>
          <p className="text-gray-500 text-xs mt-0.5">
            Gerenciamento local, validación de cortes de caja de cajeros, logística de almacén y reloj checador de personal.
          </p>
        </div>
        <div className="text-right text-xs text-gray-500 font-mono">
          <p>Responsable: <span className="font-bold text-gray-700">{currentEmployee.name}</span></p>
          <p className="text-[10px] mt-0.5">Dirección: {localBranch?.address.split(',')[0]}</p>
        </div>
      </div>

      {/* Sub tabs navigation */}
      <div className="flex border-b border-gray-100 bg-white p-1 rounded-xl shadow-sm gap-1">
        <button
          onClick={() => setActiveSubTab('stats')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition ${activeSubTab === 'stats' ? 'bg-[#155E37] text-white shadow-sm' : 'text-gray-500 hover:text-gray-800 hover:bg-stone-50'}`}
        >
          📈 Operación Diaria
        </button>
        <button
          onClick={() => setActiveSubTab('cortes')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition relative ${activeSubTab === 'cortes' ? 'bg-[#155E37] text-white shadow-sm' : 'text-gray-500 hover:text-gray-800 hover:bg-stone-50'}`}
        >
          🔑 Cortes de Caja
          {localCortes.filter(c => c.status === 'pendiente').length > 0 && (
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-500 text-white text-[9px] font-bold flex items-center justify-center">
              {localCortes.filter(c => c.status === 'pendiente').length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveSubTab('logistica')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition ${activeSubTab === 'logistica' ? 'bg-[#155E37] text-white shadow-sm' : 'text-gray-500 hover:text-gray-800 hover:bg-stone-50'}`}
        >
          ✈️ Almacén & Traspasos
        </button>
        <button
          onClick={() => setActiveSubTab('asistencia')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition ${activeSubTab === 'asistencia' ? 'bg-[#155E37] text-white shadow-sm' : 'text-gray-500 hover:text-gray-800 hover:bg-stone-50'}`}
        >
          ⏱️ Asistencia y Reloj
        </button>
      </div>

      {/* TABS CONTAINER */}

      {/* GERENTE TAB 1: LOCAL STATS & CANCELATIONS */}
      {activeSubTab === 'stats' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <p className="text-[9px] uppercase font-bold text-gray-400 font-mono">Ventas del Turno (Bruto)</p>
              <h3 className="text-lg font-black text-amber-600 mt-1">${localGross.toFixed(2)}</h3>
              <p className="text-[10px] text-gray-400 font-sans mt-0.5">Ventas efectivas registradas hoy</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <p className="text-[9px] uppercase font-bold text-gray-400 font-mono">Transacciones</p>
              <h3 className="text-lg font-black text-stone-700 mt-1">{localTransactions} Ventas</h3>
              <p className="text-[10px] text-gray-400 font-sans mt-0.5">Tickets de compra emitidos</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <p className="text-[9px] uppercase font-bold text-gray-400 font-mono">Consumo Promedio</p>
              <h3 className="text-lg font-black text-sky-700 mt-1">${localTicketMedio.toFixed(2)}</h3>
              <p className="text-[10px] text-gray-400 font-sans mt-0.5">Ticket promedio por cliente</p>
            </div>
          </div>

          {/* Local Sales List with Cancellations Lock */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider font-mono mb-4 border-b border-gray-100 pb-2.5">
              Historial de Ventas Clínicas y Autorización de Devoluciones
            </h3>
            {localSales.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">Ninguna transacción registrada en esta sucursal.</p>
            ) : (
              <div className="space-y-2.5">
                {localSales.map(sale => {
                  const itemsSummary = sale.items.map(i => `${i.quantity} ${i.name}`).join(', ');
                  const cashier = employees.find(e => e.id === sale.employeeId)?.name || 'Cajero';
                  return (
                    <div
                      key={sale.id}
                      className={`p-3.5 border rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs transition ${
                        sale.status === 'cancelada'
                          ? 'border-red-100 bg-red-50/25 opacity-70'
                          : 'border-stone-100 bg-stone-50/50 hover:bg-stone-50'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-stone-800 font-mono">#{sale.id.toUpperCase()}</span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            sale.status === 'cancelada' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {sale.status.toUpperCase()}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono">
                            {new Date(sale.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-stone-700 font-bold">{itemsSummary}</p>
                        <p className="text-[10px] text-gray-500 font-mono">
                          Cobrado por: <strong className="text-gray-700">{cashier}</strong> • Método: {sale.paymentMethod === 'efectivo' ? '💸 Efectivo' : '💳 Tarjeta'}
                        </p>
                        {sale.cancelledBy && (
                          <p className="text-[10px] text-red-600 font-bold font-mono">
                            Anulado por gerente: {sale.cancelledBy}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-4">
                        <div className="text-right">
                          <span className="text-[10px] text-gray-400 block font-mono">Total Ticket:</span>
                          <span className={`font-extrabold text-sm ${sale.status === 'cancelada' ? 'text-stone-400 line-through' : 'text-stone-800'}`}>
                            ${sale.total.toFixed(2)}
                          </span>
                        </div>

                        {sale.status === 'completada' && (
                          <button
                            onClick={() => handleCancelSale(sale.id)}
                            className="flex items-center gap-1 bg-[#155E37]/10 text-[#155E37] hover:bg-[#155E37] hover:text-white font-bold py-1.5 px-3 rounded-lg transition"
                            title="Autorizar cancelación de venta en caja"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Devolución
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* GERENTE TAB 2: CORTES VALIDATION */}
      {activeSubTab === 'cortes' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider font-mono border-b border-gray-100 pb-3 mb-4">
              Validación y Cuadre de Turno de Cajeros
            </h3>
            <p className="text-xs text-gray-500 mb-4 bg-stone-50 p-3 rounded-lg border border-stone-200">
              ℹ️ Los cajeros declaran el efectivo al final de su turno de manera ciega (sin ver los totales del sistema). Tu rol como gerente consiste en verificar los cortes, confrontando faltantes o sobrantes y autorizando su cierre definitivo.
            </p>

            {localCortes.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">No hay registros de cortes de caja en esta sucursal.</p>
            ) : (
              <div className="space-y-4">
                {localCortes.map(corte => {
                  const hasDiscrepancy = Math.abs(corte.difference) > 0;
                  return (
                    <div
                       key={corte.id}
                      className={`p-4 border rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition ${
                        corte.status === 'aprobado' ? 'border-emerald-100 bg-emerald-50/10' :
                        corte.status === 'discrepancia' ? 'border-amber-200 bg-amber-50/20' : 'border-stone-200 bg-stone-50/50'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#155E37]">{corte.employeeName}</span>
                          <span className="text-[10px] text-gray-400 font-mono">Fecha: {corte.date} ({corte.openedAt} - {corte.closedAt})</span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono ${
                            corte.status === 'aprobado' ? 'bg-emerald-100 text-emerald-800' :
                            corte.status === 'discrepancia' ? 'bg-red-100 text-red-800' : 'bg-stone-200 text-stone-800'
                          }`}>
                            {corte.status.toUpperCase()}
                          </span>
                        </div>

                        {/* Detailed numbers */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-[10.5px] font-mono">
                          <div>
                            <span className="text-gray-400 block font-sans">Fondo Inicial:</span>
                            <span className="font-semibold text-stone-700">${corte.initialCash.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block font-sans">Efectivo Sistema:</span>
                            <span className="font-semibold text-stone-700">${corte.expectedCash.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block font-sans">Declarado Ciego:</span>
                            <span className="font-extrabold text-[#155E37]">${corte.declaredCash.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block font-sans">Diferencia:</span>
                            <span className={`font-extrabold ${corte.difference < 0 ? 'text-red-600 font-bold' : corte.difference > 0 ? 'text-emerald-700' : 'text-stone-700'}`}>
                              ${corte.difference.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {corte.notes && <p className="text-xs text-stone-500 italic font-sans">Comentario Cajero: &ldquo;{corte.notes}&rdquo;</p>}
                        {corte.validatedBy && (
                          <p className="text-[10px] text-gray-400 font-semibold font-mono">
                            Verificado por Gerencia: <strong className="text-[#155E37]">{corte.validatedBy}</strong>
                          </p>
                        )}
                      </div>

                      {corte.status === 'pendiente' && (
                        <div className="flex items-center gap-2 text-xs">
                          <button
                            onClick={() => handleValidateCorte(corte.id, 'aprobar')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-3 rounded-lg shadow-sm flex items-center gap-1"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Confirmar Conforme
                          </button>
                          <button
                            onClick={() => handleValidateCorte(corte.id, 'discrepancia')}
                            className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-1.5 px-3 rounded-lg shadow-sm"
                          >
                            Marcar Ajuste
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* GERENTE TAB 3: LOGISTICS, AUDITS, TRANSFERS */}
      {activeSubTab === 'logistica' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Inventory Levels block */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3 mb-4">
              <div>
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider font-mono">Existencias Reales en Bodega (Local)</h3>
                <p className="text-xs text-gray-500 mt-0.5">Ingredientes para preparación del día en {localBranch?.name}.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAuditModal(true)}
                  className="bg-[#155E37] hover:bg-[#0E4025] text-white font-bold text-xs py-2 px-3 rounded-lg shadow-sm transition"
                >
                  📝 Registrar Inventario Físico
                </button>
                <button
                  onClick={() => setShowTransferModal(true)}
                  className="bg-stone-700 hover:bg-stone-800 text-white font-bold text-xs py-2 px-3 rounded-lg shadow-sm transition"
                >
                  ⇄ Solicitar Traspaso
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {rawIngredients.map(raw => {
                const stock = raw.currentStock[managerBranchId] || 0;
                const isLow = stock <= raw.minStock;
                return (
                  <div key={raw.id} className={`p-3.5 border rounded-xl flex items-center justify-between text-xs font-sans ${isLow ? 'border-red-100 bg-red-50/30' : 'border-stone-100 bg-stone-50/25'}`}>
                    <div>
                      <p className="font-bold text-stone-800">{raw.name}</p>
                      <p className="text-[10px] text-gray-400 font-mono mt-0.5">Alerta en: {raw.minStock} {raw.unit}</p>
                    </div>
                    <div className="text-right font-mono">
                      <span className={`text-sm font-extrabold ${isLow ? 'text-red-600 font-black' : 'text-stone-800'}`}>
                        {stock}
                      </span>
                      <span className="text-[10px] text-gray-500 block">{raw.unit}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Transfer Orders between Branches progress */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider font-mono mb-4 border-b border-gray-100 pb-3">
              Historial de Traspasos de Mercancía Inter-Sucursal
            </h3>
            {transfers.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">Ningún traspaso de mercancía registrado hoy.</p>
            ) : (
              <div className="space-y-3">
                {transfers.map(trans => {
                  const sourceName = branches.find(b => b.id === trans.sourceBranchId)?.name.split(' ')[0] || trans.sourceBranchId;
                  const targetName = branches.find(b => b.id === trans.targetBranchId)?.name.split(' ')[0] || trans.targetBranchId;
                  const rawName = rawIngredients.find(r => r.id === trans.rawItemId)?.name || trans.rawItemId;
                  const unit = rawIngredients.find(r => r.id === trans.rawItemId)?.unit || '';

                  // Check if current manager belongs to the Target (sender) branch to authorize or Source to receive
                  const canApproveTraspaso = trans.targetBranchId === managerBranchId && trans.status === 'pendiente';

                  return (
                    <div key={trans.id} className="p-3.5 border border-stone-100 bg-stone-50/50 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold font-mono text-[#155E37]">#{trans.id.toUpperCase()}</span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            trans.status === 'recibido' ? 'bg-emerald-100 text-emerald-800' :
                            trans.status === 'cancelado' ? 'bg-gray-150 text-gray-500 line-through' : 'bg-amber-100 text-amber-800 animate-pulse'
                          }`}>
                            {trans.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-stone-800">
                          Transferencia de: <strong className="text-[#155E37]">{trans.quantity} {unit}</strong> de lo siguiente: <strong className="text-gray-800">{rawName}</strong>.
                        </p>
                        <p className="text-[10px] text-gray-500 font-mono">
                          De sucursal: <span className="font-bold text-stone-700">{targetName}</span> ➜ Para: <span className="font-bold text-stone-700">{sourceName}</span>
                        </p>
                        <p className="text-[10px] text-gray-400 select-none">Fecha de Registro: {trans.date} • Resp: {trans.requestedBy}</p>
                      </div>

                      {canApproveTraspaso && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleReceiveTransfer(trans.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-3 rounded-lg shadow-sm"
                          >
                            Autorizar & Despachar Insumos
                          </button>
                          <button
                            onClick={() => handleCancelTransfer(trans.id)}
                            className="text-stone-500 hover:underline"
                          >
                            Rechazar
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* GERENTE TAB 4: EMPLOYEES CLOCK-INS */}
      {activeSubTab === 'asistencia' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider font-mono border-b border-gray-100 pb-3 mb-4">
              Registro del Reloj Checador (Fichajes de Entrada/Salida - Sucursal Local)
            </h3>
            {localClockIns.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">Ningún registro de asistencia registrado hoy en tu sucursal.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-gray-600">
                  <thead className="bg-[#155E37]/5 text-[#155E37] font-mono select-none uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Empleado</th>
                      <th className="p-3">Fecha de Labor</th>
                      <th className="p-3">Hora Entrada</th>
                      <th className="p-3">Hora Salida</th>
                      <th className="p-3">Estado actual</th>
                      <th className="p-3 text-right">Horas totales</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {localClockIns.map(log => {
                      const empObj = employees.find(e => e.id === log.employeeId);
                      return (
                        <tr key={log.id} className="hover:bg-stone-50/50">
                          <td className="p-3">
                            <div className="font-bold text-stone-800">{log.employeeName}</div>
                            <span className="text-[10px] uppercase font-bold text-amber-600 font-mono">
                              {empObj?.role.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-3 font-mono">{log.date}</td>
                          <td className="p-3 font-mono text-emerald-700 font-bold">{log.clockIn}</td>
                          <td className="p-3 font-mono">{log.clockOut || '--:--'}</td>
                          <td className="p-3">
                            <span className={`inline-flex items-center gap-1 font-bold ${log.clockOut ? 'text-gray-500' : 'text-emerald-600 animate-pulse'}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${log.clockOut ? 'bg-gray-400' : 'bg-emerald-600'}`}></span>
                              {log.clockOut ? 'Turno Concluido' : 'Laborando'}
                            </span>
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-[#155E37]">
                            {log.hoursWorked ? `${log.hoursWorked.toFixed(2)} hrs` : 'Activo'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: REQUEST TRANSFER FORM */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-100 w-full max-w-sm overflow-hidden text-xs">
            <div className="bg-[#155E37] text-white p-4">
              <h3 className="font-bold text-sm tracking-tight">Solicitud de Traspaso de Materia Prima</h3>
            </div>
            <form onSubmit={handleRequestTransfer} className="p-4 space-y-3.5">
              <div>
                <label className="block text-gray-500 font-bold mb-1">Sucursal de Origen (Quién cede la mercancía):</label>
                <select
                  required
                  value={transferForm.targetBranchId}
                  onChange={(e) => setTransferForm({ ...transferForm, targetBranchId: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg p-2 bg-stone-50"
                >
                  <option value="">-- Seleccionar Sucursal Probadora --</option>
                  {branches.filter(b => b.id !== managerBranchId).map(br => (
                    <option key={br.id} value={br.id}>{br.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-500 font-bold mb-1">Insumo / Materia Prima:</label>
                <select
                  required
                  value={transferForm.rawItemId}
                  onChange={(e) => setTransferForm({ ...transferForm, rawItemId: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg p-2 bg-stone-50"
                >
                  <option value="">-- Escoger Insumo --</option>
                  {rawIngredients.map(raw => (
                    <option key={raw.id} value={raw.id}>{raw.name} ({raw.unit})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-500 font-bold mb-1">Cantidad Solicitada:</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={transferForm.quantity}
                  onChange={(e) => setTransferForm({ ...transferForm, quantity: Number(e.target.value) })}
                  className="w-full border border-gray-200 rounded-lg p-2 bg-stone-50 font-mono text-center text-sm font-bold"
                  placeholder="30"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-3 py-2 border border-gray-200 text-gray-500 rounded-lg hover:bg-stone-50 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#155E37] text-white rounded-lg hover:bg-[#0E4025] font-bold"
                >
                  Registrar Solicitud
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: PHYSICAL AUDIT REPORT FORM */}
      {showAuditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-100 w-full max-w-sm overflow-hidden text-xs">
            <div className="bg-[#155E37] text-white p-4">
              <h3 className="font-bold text-sm tracking-tight">Conteo de Inventario Físico Ordinario</h3>
            </div>
            <form onSubmit={handleSubmitAudit} className="p-4 space-y-3.5">
              <div>
                <label className="block text-gray-500 font-bold mb-1">Materia Prima a Auditar:</label>
                <select
                  required
                  value={auditForm.rawItemId}
                  onChange={(e) => setAuditForm({ ...auditForm, rawItemId: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg p-2 bg-stone-50"
                >
                  <option value="">-- Elige un Insumo --</option>
                  {rawIngredients.map(raw => (
                    <option key={raw.id} value={raw.id}>{raw.name} ({raw.unit})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-500 font-bold mb-1">Conteo Físico Real Encontrado:</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min={0}
                  value={auditForm.actualQty}
                  onChange={(e) => setAuditForm({ ...auditForm, actualQty: Number(e.target.value) })}
                  className="w-full border border-gray-200 rounded-lg p-2 bg-stone-50 font-mono text-center text-sm font-bold"
                />
              </div>

              <div>
                <label className="block text-gray-500 font-bold mb-1">Notas de la Discrepancia u Observaciones:</label>
                <textarea
                  value={auditForm.notes}
                  onChange={(e) => setAuditForm({ ...auditForm, notes: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg p-2 bg-stone-50 h-16 resize-none"
                  placeholder="Por ejemplo: Merma por descomposición de elotes enteros"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAuditModal(false)}
                  className="px-3 py-2 border border-gray-200 text-gray-500 rounded-lg hover:bg-stone-50 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#155E37] text-white rounded-lg hover:bg-[#0E4025] font-bold"
                >
                  Enviar a Dueño para Aprobación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
