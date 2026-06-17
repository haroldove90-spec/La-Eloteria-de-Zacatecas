/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Role = 'admin' | 'gerente' | 'cajero' | 'staff';

export interface Employee {
  id: string;
  name: string;
  role: Role;
  pin: string;
  branchId: string; // "all" for global administrators
  active: boolean;
  phone: string;
  email: string;
  avatar?: string;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
}

export interface MenuItem {
  id: string;
  name: string;
  category: 'Elotes' | 'Esquites' | 'Especialidades' | 'Bebidas' | 'Adiciones';
  price: number;
  cost: number; // For Net profit calculations
  ingredients: Array<{ rawItemId: string; quantity: number }>; // e.g., 1 full piece of corn, or 0.150 kg of corn kernels
  imageUrl?: string;
  description: string;
  active: boolean;
}

export interface RawIngredient {
  id: string;
  name: string;
  unit: 'kg' | 'L' | 'piezas' | 'paquetes';
  currentStock: Record<string, number>; // Record<branchId, quantity>
  minStock: number; // Alert threshold per branch
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  phone: string;
  email: string;
}

export interface Sale {
  id: string;
  branchId: string;
  employeeId: string;
  timestamp: string;
  items: Array<{
    menuItemId: string;
    name: string;
    quantity: number;
    price: number;
    cost: number;
  }>;
  total: number;
  paymentMethod: 'efectivo' | 'tarjeta';
  status: 'completada' | 'cancelada';
  cancelledBy?: string; // Authorized manager id
}

export interface StockTransfer {
  id: string;
  sourceBranchId: string;
  targetBranchId: string;
  rawItemId: string;
  quantity: number;
  status: 'pendiente' | 'recibido' | 'cancelado';
  requestedBy: string; // employeeId
  date: string;
}

export interface InventoryAudit {
  id: string;
  branchId: string;
  rawItemId: string;
  systemQty: number;
  actualQty: number;
  difference: number;
  status: 'pendiente_aprobacion' | 'aprobado';
  date: string;
  notes?: string;
}

export interface CorteCaja {
  id: string;
  branchId: string;
  employeeId: string;
  employeeName: string;
  date: string; // YYYY-MM-DD
  openedAt: string; // HH:MM
  closedAt: string; // HH:MM
  initialCash: number;
  totalSalesCash: number;
  totalSalesCard: number;
  expectedCash: number; // system expected (initialCash + totalSalesCash)
  declaredCash: number; // entered blindly
  difference: number; // expected - declared
  status: 'pendiente' | 'aprobado' | 'discrepancia';
  validatedBy?: string; // manager id
  notes?: string;
}

export interface ClockInLog {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string; // YYYY-MM-DD
  clockIn: string; // HH:MM:SS
  clockOut?: string; // HH:MM:SS
  hoursWorked?: number;
}
