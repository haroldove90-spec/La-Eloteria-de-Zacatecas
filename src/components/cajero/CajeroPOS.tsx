/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShoppingCart, User, Plus, Minus, CreditCard, DollarSign, Check, X, Ticket, ClipboardList, LogOut } from 'lucide-react';
import { MenuItem, Sale, Employee, CorteCaja, RawIngredient } from '../../types';

interface CajeroPOSProps {
  currentEmployee: Employee;
  menuItems: MenuItem[];
  rawIngredients: RawIngredient[];
  setRawIngredients: React.Dispatch<React.SetStateAction<RawIngredient[]>>;
  sales: Sale[];
  setSales: React.Dispatch<React.SetStateAction<Sale[]>>;
  cortes: CorteCaja[];
  setCortes: React.Dispatch<React.SetStateAction<CorteCaja[]>>;
}

export default function CajeroPOS({
  currentEmployee,
  menuItems,
  rawIngredients, setRawIngredients,
  sales, setSales,
  cortes, setCortes
}: CajeroPOSProps) {
  const branchId = currentEmployee.branchId;

  // State for POS Active Session
  const [activeSession, setActiveSession] = useState<{
    id: string;
    initialCash: number;
    openedAt: string;
  } | null>(() => {
    // Check if cashier has a pending corte today which means session is closed or check if active
    const todayStr = new Date().toISOString().split('T')[0];
    const localCorte = cortes.find(c => c.branchId === branchId && c.employeeId === currentEmployee.id && c.date === todayStr);
    if (localCorte) return null; // Already did their cut today

    return {
      id: 'session_' + currentEmployee.id,
      initialCash: 500.0,
      openedAt: '09:00'
    };
  });

  const [activeCategory, setActiveCategory] = useState<MenuItem['category']>('Elotes');
  const [cart, setCart] = useState<Array<{ menuItem: MenuItem; quantity: number }>>([]);
  const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'tarjeta'>('efectivo');

  // Checkout Modal states
  const [showCheckout, setShowCheckout] = useState(false);
  const [cashReceived, setCashReceived] = useState<number>(0);
  const [showShiftCut, setShowShiftCut] = useState(false);
  const [declaredCash, setDeclaredCash] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [receipt, setReceipt] = useState<Sale | null>(null);

  // Filter active menu items
  const activeItems = menuItems.filter(item => item.active && item.category === activeCategory);

  // Cart operations
  const addToCart = (item: MenuItem) => {
    // Check stock for ingredients
    const missingIngredients = getMissingIngredientsForQty(item, 1);
    if (missingIngredients.length > 0) {
      alert(`⚠️ Stock Insuficiente en Almacén:\nFalta: ${missingIngredients.join(', ')}`);
      return;
    }

    setCart(prev => {
      const exists = prev.find(i => i.menuItem.id === item.id);
      if (exists) {
        return prev.map(i => i.menuItem.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { menuItem: item, quantity: 1 }];
    });
  };

  const getMissingIngredientsForQty = (item: MenuItem, requestedQty: number): string[] => {
    const missing: string[] = [];
    item.ingredients.forEach(req => {
      const raw = rawIngredients.find(r => r.id === req.rawItemId);
      if (raw) {
        const currentStock = raw.currentStock[branchId] || 0;
        // Calc cart consumption + new item consumption
        const cartQty = cart.find(c => c.menuItem.id === item.id)?.quantity || 0;
        const totalQtyNeeded = req.quantity * (cartQty + requestedQty);
        if (currentStock < totalQtyNeeded) {
          missing.push(`${raw.name} (${currentStock} disp)`);
        }
      }
    });
    return missing;
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.map(i => {
      if (i.menuItem.id === itemId) {
        return { ...i, quantity: i.quantity - 1 };
      }
      return i;
    }).filter(i => i.quantity > 0));
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);

  // Checkout transaction execution
  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    if (paymentMethod === 'efectivo' && cashReceived < cartTotal) {
      alert('⚠️ El efectivo recibido debe ser mayor o igual al total de la compra.');
      return;
    }

    const saleId = 'esq_' + Math.floor(100000 + Math.random() * 900000);
    const timestamp = new Date().toISOString();

    const newSale: Sale = {
      id: saleId,
      branchId,
      employeeId: currentEmployee.id,
      timestamp,
      items: cart.map(c => ({
        menuItemId: c.menuItem.id,
        name: c.menuItem.name,
        quantity: c.quantity,
        price: c.menuItem.price,
        cost: c.menuItem.cost
      })),
      total: cartTotal,
      paymentMethod,
      status: 'completada'
    };

    // Substract from physical raw stock levels
    setRawIngredients(prev => prev.map(raw => {
      let totalConsumed = 0;
      cart.forEach(cartItem => {
        const req = cartItem.menuItem.ingredients.find(i => i.rawItemId === raw.id);
        if (req) {
          totalConsumed += req.quantity * cartItem.quantity;
        }
      });

      if (totalConsumed > 0) {
        const currentStockCopy = { ...raw.currentStock };
        currentStockCopy[branchId] = Math.max(0, (currentStockCopy[branchId] || 0) - totalConsumed);
        return { ...raw, currentStock: currentStockCopy };
      }
      return raw;
    }));

    // Save sale
    setSales(prev => [newSale, ...prev]);
    setReceipt(newSale);
    setCart([]);
    setShowCheckout(false);
    setCashReceived(0);
  };

  // Turn Shift Cut submit
  const handleShiftCutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSession) return;

    // Calculate sales corresponding to this employee's active shift
    const cashSales = sales
      .filter(s => s.branchId === branchId && s.employeeId === currentEmployee.id && s.paymentMethod === 'efectivo' && s.status === 'completada')
      .reduce((sum, s) => sum + s.total, 0);

    const cardSales = sales
      .filter(s => s.branchId === branchId && s.employeeId === currentEmployee.id && s.paymentMethod === 'tarjeta' && s.status === 'completada')
      .reduce((sum, s) => sum + s.total, 0);

    // Expected is: Shift initial cash + cash sales
    const expectedCash = activeSession.initialCash + cashSales;
    const difference = declaredCash - expectedCash;

    const newCorte: CorteCaja = {
      id: 'corte_' + Math.random().toString(36).substring(2, 9),
      branchId,
      employeeId: currentEmployee.id,
      employeeName: currentEmployee.name,
      date: new Date().toISOString().split('T')[0],
      openedAt: activeSession.openedAt,
      closedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      initialCash: activeSession.initialCash,
      totalSalesCash: cashSales,
      totalSalesCard: cardSales,
      expectedCash,
      declaredCash,
      difference,
      status: 'pendiente',
      notes
    };

    setCortes(prev => [newCorte, ...prev]);
    setActiveSession(null);
    setShowShiftCut(false);
    alert('✅ Corte de Turno enviado con éxito a revisión gerencial en formato CIEGO.');
  };

  const handleOpenRegister = () => {
    setActiveSession({
      id: 'session_' + currentEmployee.id,
      initialCash: 500.0,
      openedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  };


  return (
    <div className="space-y-6" id="cajero_pos_root">
      {/* Session Header Status */}
      <div className="flex flex-col sm:flex-row items-center justify-between border border-gray-100 bg-white p-4 rounded-xl shadow-sm gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-green-50 text-[#155E37] rounded-lg">
            <ClipboardList className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-800">Caja Registradora Activa</h2>
            <p className="text-xs text-gray-400">
              Personal: <strong>{currentEmployee.name}</strong> • Fondo de Apertura: <strong className="text-emerald-700">$500.00</strong>
            </p>
          </div>
        </div>

        {activeSession ? (
          <button
            onClick={() => {
              setDeclaredCash(0);
              setNotes('');
              setShowShiftCut(true);
            }}
            className="flex items-center gap-1.5 bg-[#155E37] hover:bg-[#0E4025] text-white font-bold text-xs py-2 px-3.5 rounded-lg shadow-sm transition"
            id="cut_shift_btn"
          >
            <LogOut className="w-4 h-4" /> Realizar Corte de Turno (Ciego)
          </button>
        ) : (
          <button
            onClick={handleOpenRegister}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-4 rounded-lg shadow-sm"
          >
            Aperturar Nueva Caja
          </button>
        )}
      </div>

      {!activeSession ? (
        <div className="bg-white border border-dashed border-stone-200 p-12 text-center rounded-xl space-y-3 shadow-inner">
          <p className="text-stone-400 text-sm">No cuentas con un turno activo por el momento.</p>
          <p className="text-stone-600 text-xs max-w-sm mx-auto leading-relaxed">
            Para iniciar a marcar pedidos, registrar ventas de elotes y cobrar, por favor presiona el botón para abrir un cajón para el turno.
          </p>
          <button
            onClick={handleOpenRegister}
            className="bg-[#155E37] hover:bg-[#0E4025] text-white text-xs font-bold py-2.5 px-6 rounded-lg shadow-sm"
          >
            Iniciar Nueva Jornada de Caja ($500.00)
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: PRODUCTS GRID (col-span-8) */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-4">
            {/* Category Sub headers */}
            <div className="flex border-b border-gray-100 bg-white p-1 rounded-xl shadow-sm overflow-x-auto gap-1 scrollbar-hide">
              {(['Elotes', 'Esquites', 'Especialidades', 'Bebidas', 'Adiciones'] as MenuItem['category'][]).map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex-1 min-w-[70px] py-2 px-3 rounded-lg text-[11px] font-bold transition font-sans ${
                    activeCategory === cat
                      ? 'bg-[#155E37] text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-800 hover:bg-stone-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Grid display */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
              {activeItems.map(item => (
                <div
                  key={item.id}
                  onClick={() => addToCart(item)}
                  className="bg-white border border-gray-100 rounded-xl p-3.5 shadow-sm hover:shadow-md hover:border-amber-300 transition cursor-pointer flex flex-col justify-between h-40 group select-none"
                >
                  <div>
                    <h4 className="text-xs font-extrabold text-stone-800 group-hover:text-[#155E37] truncate">{item.name}</h4>
                    <p className="text-[10px] text-gray-400 font-mono mt-1 font-semibold uppercase">{item.category}</p>
                    <p className="text-[10.5px] text-stone-500 line-clamp-2 leading-relaxed mt-2">{item.description}</p>
                  </div>
                  <div className="flex items-center justify-between pt-2 mt-2 border-t border-gray-50">
                    <span className="font-extrabold text-[#155E37] text-sm">${item.price.toFixed(2)}</span>
                    <span className="text-[10px] bg-[#155E37]/10 text-[#155E37] px-2 py-0.5 rounded-full font-bold group-hover:bg-[#155E37] group-hover:text-white transition">
                      + Ordenar
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN: CURRENT CART/ORDER PANEL (col-span-4) */}
          <div className="lg:col-span-5 xl:col-span-4 bg-white border border-gray-100 rounded-xl shadow-md p-4 space-y-4">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider font-mono border-b border-gray-100 pb-2.5 flex items-center justify-between">
              <span>🛒 Orden en Proceso</span>
              <span className="text-[10px] bg-amber-500/10 text-amber-800 font-semibold px-2 py-0.5 rounded font-mono">
                {cart.reduce((sum, i) => sum + i.quantity, 0)} items
              </span>
            </h3>

            {cart.length === 0 ? (
              <div className="h-56 flex flex-col items-center justify-center text-center text-stone-400 text-xs">
                <ShoppingCart className="w-8 h-8 text-stone-300 mb-2" />
                <p>Carrito vacío.</p>
                <p className="text-[10px] text-stone-400 mt-1 max-w-[180px] leading-snug">Presiona cualquier platillo elotero a la izquierda para agregarlo.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {cart.map(item => (
                  <div key={item.menuItem.id} className="flex items-center justify-between gap-3 text-xs p-2 bg-stone-50/50 border border-stone-100 rounded-lg">
                    <div className="truncate">
                      <p className="font-bold text-stone-800 truncate">{item.menuItem.name}</p>
                      <p className="text-[10px] font-mono text-[#155E37] font-semibold">${item.menuItem.price.toFixed(2)} c/u</p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => removeFromCart(item.menuItem.id)}
                        className="p-1 rounded bg-stone-100 text-stone-600 hover:bg-stone-200"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-bold font-mono text-stone-800 px-1">{item.quantity}</span>
                      <button
                        onClick={() => addToCart(item.menuItem.id ? item.menuItem : item.menuItem)}
                        className="p-1 rounded bg-stone-100 text-stone-600 hover:bg-stone-200"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Receipt checkout math summary */}
            <div className="space-y-2 border-t border-gray-100 pt-3.5 text-xs font-sans">
              <div className="flex items-center justify-between text-gray-500">
                <span>Subtotal:</span>
                <span className="font-mono">${(cartTotal * 0.9).toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-gray-500">
                <span>IVA Incluido (16%):</span>
                <span className="font-mono">${(cartTotal * 0.1).toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-stone-800 text-sm font-black border-t border-dashed border-gray-100 pt-2 pb-1">
                <span>TOTAL A COBRAR:</span>
                <span className="font-mono text-base text-[#155E37]">${cartTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Check/checkout buttons */}
            {cart.length > 0 && (
              <div className="space-y-2.5">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => setPaymentMethod('efectivo')}
                    className={`p-2.5 rounded-lg border font-bold text-center flex flex-col items-center gap-1 transition ${
                      paymentMethod === 'efectivo'
                        ? 'border-[#155E37] bg-green-50/30 text-[#155E37]'
                        : 'border-stone-100 bg-stone-50/25 text-stone-500 hover:bg-stone-100'
                    }`}
                  >
                    <DollarSign className="w-4 h-4" /> 💸 Efectivo
                  </button>
                  <button
                    onClick={() => setPaymentMethod('tarjeta')}
                    className={`p-2.5 rounded-lg border font-bold text-center flex flex-col items-center gap-1 transition-all ${
                      paymentMethod === 'tarjeta'
                        ? 'border-[#155E37] bg-green-50/30 text-[#155E37]'
                        : 'border-stone-100 bg-stone-50/25 text-stone-500 hover:bg-stone-100'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" /> 💳 Tarjeta
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={clearCart}
                    className="flex-1 py-2 px-3 border border-stone-200 text-stone-600 font-semibold rounded-lg hover:bg-stone-50 text-xs text-center"
                  >
                    Vaciar Carrito
                  </button>
                  <button
                    onClick={() => {
                      setCashReceived(cartTotal);
                      setShowCheckout(true);
                    }}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-lg shadow-md text-xs transition"
                  >
                    Registrar Cobro
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SHIFT CUT (Corte Ciego) MODAL */}
      {showShiftCut && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-100 w-full max-w-sm overflow-hidden text-xs">
            <div className="bg-[#155E37] text-white p-4">
              <h3 className="font-bold text-sm tracking-tight flex items-center gap-2">
                <LogOut className="w-4 h-4 text-[#FBBF24]" />
                Corte de Turno Ciego Obligatorio
              </h3>
            </div>
            <form onSubmit={handleShiftCutSubmit} className="p-4 space-y-4">
              <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 space-y-1.5 leading-snug">
                <p className="font-bold text-amber-800 flex items-center gap-1 text-[11px]">
                  ⚠️ Declaración de Arqueo Físico de Efectivo
                </p>
                <p className="text-amber-900 text-[10.5px]">
                  Debes ingresar el total de dinero en efectivo encontrado en el cajón (incluyendo el fondo de $500). El sistema auditará la cifra contra sus registros del turno automáticamente e informará a tu supervisor de cualquier discrepancia.
                </p>
              </div>

              <div>
                <label className="block text-gray-500 font-bold mb-1">Efectivo Físico en Caja ($):</label>
                <input
                  type="number"
                  required
                  min={0}
                  step="1"
                  value={declaredCash || ''}
                  onChange={(e) => setDeclaredCash(Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-lg p-2.5 bg-stone-50 font-mono text-center text-lg font-black text-[#155E37]"
                  placeholder="E.g., 1750"
                />
              </div>

              <div>
                <label className="block text-gray-500 font-bold mb-1">Comentarios o incidentes durante el turno:</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg p-2 bg-stone-50 h-16 resize-none"
                  placeholder="Por ejemplo: Cambié un billete grande con el negocio vecino..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 font-bold">
                <button
                  type="button"
                  onClick={() => setShowShiftCut(false)}
                  className="px-3 py-2 border border-stone-200 text-stone-500 rounded-lg hover:bg-stone-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#155E37] text-white rounded-lg hover:bg-[#0E4025]"
                >
                  Confirmar & Enviar Corte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAILED CHECKOUT (Math Grid) MODAL */}
      {showCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-100 w-full max-w-sm overflow-hidden text-xs">
            <div className="bg-[#155E37] text-white p-4">
              <h3 className="font-bold text-sm tracking-tight flex items-center gap-2">
                <Ticket className="w-4 h-4 text-[#FBBF24]" />
                Registrar y Confirmar Cobro de Venta
              </h3>
            </div>
            <form onSubmit={handleCheckoutSubmit} className="p-4 space-y-4">
              <div className="bg-stone-50 p-3 rounded-lg border border-stone-100 text-center font-bold">
                <p className="text-gray-400 font-mono">TOTAL A COBRAR EN VENTAS:</p>
                <p className="text-[#155E37] font-black text-xl font-mono mt-1">${cartTotal.toFixed(2)}</p>
                <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider font-mono">
                  Cobro vía: {paymentMethod === 'efectivo' ? '💸 EFECTIVO' : '💳 TARJETA / COBRO ELECTRÓNICO'}
                </p>
              </div>

              {paymentMethod === 'efectivo' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-gray-500 font-bold mb-1">Monto Entregado por Cliente ($):</label>
                    <input
                      type="number"
                      required
                      min={cartTotal}
                      step="0.5"
                      value={cashReceived || ''}
                      onChange={(e) => setCashReceived(Number(e.target.value))}
                      className="w-full border border-gray-200 rounded-lg p-2 bg-stone-50 font-mono text-center font-extrabold text-sm text-[#155E37]"
                    />
                  </div>

                  {/* Fast change helper calculator details */}
                  <div className="grid grid-cols-4 gap-1.5">
                    {[50, 100, 200, 500].map(bill => (
                      <button
                        key={bill}
                        type="button"
                        onClick={() => setCashReceived(bill)}
                        className="bg-stone-100 hover:bg-stone-200 text-stone-700 p-2 rounded-lg font-bold font-mono transition"
                      >
                        ${bill}
                      </button>
                    ))}
                  </div>

                  {/* Calculated Change */}
                  {cashReceived >= cartTotal && (
                    <div className="bg-emerald-50 text-emerald-900 p-3.5 border border-emerald-100 rounded-lg flex items-center justify-between">
                      <span className="font-bold">💵 CAMBIO A ENTREGAR:</span>
                      <span className="font-extrabold font-mono text-base text-emerald-800">
                        ${(cashReceived - cartTotal).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {paymentMethod === 'tarjeta' && (
                <div className="p-4 border border-blue-100 bg-blue-50/50 rounded-lg text-center leading-relaxed">
                  <p className="text-[#0082C8] font-bold text-[11px] mb-1">🏦 Turno en Terminal Bancaria</p>
                  <p className="text-stone-500 text-[10.5px]">
                    Procesa el cobro por <strong>${cartTotal.toFixed(2)}</strong> directamente en la terminal de tarjetas e ingresa el ticket de compra una vez aprobado.
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 font-bold">
                <button
                  type="button"
                  onClick={() => setShowCheckout(false)}
                  className="px-3 py-2 border border-gray-200 text-gray-500 rounded-lg hover:bg-stone-50"
                >
                  Atrás
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                >
                  <Check className="w-3.5 h-3.5 inline mr-1" /> Completar Venta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DIGITAL RECEIPT MODAL */}
      {receipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-100 w-full max-w-sm overflow-hidden text-xs">
            <div className="bg-emerald-600 text-white p-4 flex items-center gap-2">
              <Check className="w-5 h-5" />
              <div>
                <h4 className="font-bold text-sm tracking-tight">¡Venta Registrada Exitosamente!</h4>
                <p className="text-[10px] text-emerald-100 font-mono">Folio de Ticket: #{receipt.id.toUpperCase()}</p>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div className="text-center">
                <span className="text-[11px] tracking-widest text-[#155E37] uppercase font-bold font-mono">
                  LA ELOTERÍA DE ZACATECAS
                </span>
                <p className="text-[10px] text-gray-400 font-mono mt-1">Sucursal: {branchId === 'suc_centro' ? 'Centro Histórico' : 'Zacatecas Norte'}</p>
              </div>

              {/* Receipt detail list */}
              <div className="border-t border-b border-dashed border-stone-200 py-3 space-y-2 font-mono">
                {receipt.items.map(it => (
                  <div key={it.menuItemId} className="flex justify-between">
                    <span>{it.quantity}x {it.name}</span>
                    <span>${(it.price * it.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Cash transaction summary */}
              <div className="flex justify-between items-center font-bold">
                <span>TOTAL COBRADO:</span>
                <span className="font-mono text-[#155E37] text-sm">${receipt.total.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center text-stone-500 text-[10.5px]">
                <span>Método de Pago:</span>
                <span className="uppercase font-mono">{receipt.paymentMethod === 'efectivo' ? '💸 Efectivo' : '💳 Tarjeta'}</span>
              </div>

              <div className="bg-stone-50 p-2.5 rounded-lg text-center text-stone-500 text-[10px] leading-tight select-none">
                📍 Comprobante Simulado Clínicamente. Los ingredientes han sido descontados en tiempo real del Almacén de la sucursal.
              </div>

              <button
                onClick={() => setReceipt(null)}
                className="w-full py-2 bg-stone-800 hover:bg-stone-950 text-white font-bold text-center rounded-lg shadow-sm"
              >
                Cerrar Recibo &amp; Siguiente Orden
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
