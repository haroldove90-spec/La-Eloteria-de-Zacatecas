/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Employee, Branch, MenuItem, RawIngredient, Supplier, Sale, StockTransfer, InventoryAudit, CorteCaja, ClockInLog } from './types';

export const INITIAL_BRANCHES: Branch[] = [
  { id: 'suc_centro', name: 'Centro Histórico (Zacatecas)', address: 'Av. Hidalgo 402, Centro Histórico, Zacatecas, ZAC', phone: '492-123-4567' },
  { id: 'suc_norte', name: 'Zacatecas Norte', address: 'Calzada Héroes de Chapultepec 120, Zacatecas, ZAC', phone: '492-987-6543' },
  { id: 'suc_guadalupe', name: 'Guadalupe Portal', address: 'Av. Colegio Militar 88, Guadalupe, ZAC', phone: '492-111-2222' }
];

export const INITIAL_EMPLOYEES: Employee[] = [
  { id: 'emp_admin', name: 'Don Eladio (Dueño)', role: 'admin', pin: '1111', branchId: 'all', active: true, phone: '492-100-2000', email: 'eladio@laeloteria.com' },
  { id: 'emp_gerente1', name: 'Gaby Gómez', role: 'gerente', pin: '2222', branchId: 'suc_centro', active: true, phone: '492-200-3000', email: 'gaby@laeloteria.com' },
  { id: 'emp_gerente2', name: 'Sergio Salazar', role: 'gerente', pin: '3333', branchId: 'suc_norte', active: true, phone: '492-300-4000', email: 'sergio@laeloteria.com' },
  { id: 'emp_cajero1', name: 'Chela Torres', role: 'cajero', pin: '4444', branchId: 'suc_centro', active: true, phone: '492-400-5000', email: 'chela@laeloteria.com' },
  { id: 'emp_cajero2', name: 'Paco Pérez', role: 'cajero', pin: '5555', branchId: 'suc_norte', active: true, phone: '492-500-6000', email: 'paco@laeloteria.com' },
  { id: 'emp_staff1', name: 'Juan Rulfo', role: 'staff', pin: '6666', branchId: 'suc_centro', active: true, phone: '492-600-7000', email: 'juan@laeloteria.com' },
  { id: 'emp_staff2', name: 'Beto Casillas', role: 'staff', pin: '7777', branchId: 'suc_norte', active: true, phone: '492-700-8000', email: 'beto@laeloteria.com' }
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  { id: 'sup_elotes', name: 'Elotera Juchipila', contact: 'Ignacio Ortiz', phone: '493-222-3333', email: 'nacho_juchipila@gmail.com' },
  { id: 'sup_cremeria', name: 'Cremería Zacatecana S.A.', contact: 'Rogelio Valadez', phone: '492-234-5678', email: 'ventas@cremeriazac.com' },
  { id: 'sup_chiles', name: 'Chilería del Mercado de Abastos', contact: 'Doña Mechita', phone: '492-333-4444', email: 'mechita.chiles@yahoo.com' },
  { id: 'sup_empaques', name: 'Desechables Fresnillo', contact: 'Lizbeth Ruiz', phone: '458-123-0000', email: 'contacto@empaquesfresnillo.com' }
];

export const INITIAL_RAW_INGREDIENTS: RawIngredient[] = [
  { id: 'raw_elote_entero', name: 'Elote Entero (Mazorca)', unit: 'piezas', currentStock: { suc_centro: 150, suc_norte: 120, suc_guadalupe: 80 }, minStock: 30 },
  { id: 'raw_grano_elote', name: 'Grano de Elote (Desgranador)', unit: 'kg', currentStock: { suc_centro: 40, suc_norte: 35, suc_guadalupe: 25 }, minStock: 10 },
  { id: 'raw_mayonesa', name: 'Mayonesa McCormick Receta Secreta', unit: 'kg', currentStock: { suc_centro: 15, suc_norte: 12, suc_guadalupe: 8 }, minStock: 5 },
  { id: 'raw_queso_cotija', name: 'Queso Cotija Molido Fino', unit: 'kg', currentStock: { suc_centro: 10, suc_norte: 8, suc_guadalupe: 5 }, minStock: 3 },
  { id: 'raw_chile_pica', name: 'Chile del que Sí Pica (Habanero/Árbol)', unit: 'kg', currentStock: { suc_centro: 5, suc_norte: 4, suc_guadalupe: 3 }, minStock: 2 },
  { id: 'raw_chile_no_pica', name: 'Chile del que Pica Poquito (Cascabel/Piquín)', unit: 'kg', currentStock: { suc_centro: 8, suc_norte: 7, suc_guadalupe: 4 }, minStock: 2 },
  { id: 'raw_tuetano', name: 'Tuétano de Res Fresco', unit: 'piezas', currentStock: { suc_centro: 24, suc_norte: 15, suc_guadalupe: 10 }, minStock: 5 },
  { id: 'raw_chorizo', name: 'Chorizo Zacatecano Premium', unit: 'kg', currentStock: { suc_centro: 6, suc_norte: 4, suc_guadalupe: 3 }, minStock: 2 },
  { id: 'raw_mantequilla', name: 'Mantequilla Pura de Vaca', unit: 'kg', currentStock: { suc_centro: 12, suc_norte: 10, suc_guadalupe: 7 }, minStock: 3 },
  { id: 'raw_vasos_unicel', name: 'Vasos Térmicos Unicel 12oz', unit: 'piezas', currentStock: { suc_centro: 300, suc_norte: 250, suc_guadalupe: 180 }, minStock: 50 },
  { id: 'raw_palos_elote', name: 'Palos de Madera para Elote', unit: 'piezas', currentStock: { suc_centro: 250, suc_norte: 200, suc_guadalupe: 110 }, minStock: 40 }
];

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  {
    id: 'menu_elote_clasico',
    name: 'Elote Clásico en Palo',
    category: 'Elotes',
    price: 35.0,
    cost: 12.5,
    description: 'Elote tierno recién hervido, untado con mayonesa cremosa artesanal, revolcado en delicioso queso Cotija rallado y espolvoreado con chile en polvo al gusto.',
    imageUrl: 'elote_clasico',
    active: true,
    ingredients: [
      { rawItemId: 'raw_elote_entero', quantity: 1 },
      { rawItemId: 'raw_mayonesa', quantity: 0.03 },
      { rawItemId: 'raw_queso_cotija', quantity: 0.02 },
      { rawItemId: 'raw_palos_elote', quantity: 1 }
    ]
  },
  {
    id: 'menu_esquite_clasico',
    name: 'Esquites Tradicionales (Vaso Mediano)',
    category: 'Esquites',
    price: 40.0,
    cost: 15.0,
    description: 'Granos de elote sazonados con epazote y mantequilla, servidos calientitos en vaso con limón, mayonesa, queso Cotija y chile.',
    imageUrl: 'esquites_vaso',
    active: true,
    ingredients: [
      { rawItemId: 'raw_grano_elote', quantity: 0.2 },
      { rawItemId: 'raw_mayonesa', quantity: 0.03 },
      { rawItemId: 'raw_queso_cotija', quantity: 0.02 },
      { rawItemId: 'raw_vasos_unicel', quantity: 1 }
    ]
  },
  {
    id: 'menu_chorielote',
    name: 'El Chorielote Zacatecano',
    category: 'Especialidades',
    price: 65.0,
    cost: 24.0,
    description: 'Nuestra especialidad insignia. Elote entero o esquites bañados con chorizo frito de la casa, crema ácida de huanusco y aderezo especial chipotle.',
    imageUrl: 'chorielote',
    active: true,
    ingredients: [
      { rawItemId: 'raw_elote_entero', quantity: 1 },
      { rawItemId: 'raw_chorizo', quantity: 0.08 },
      { rawItemId: 'raw_mayonesa', quantity: 0.04 },
      { rawItemId: 'raw_queso_cotija', quantity: 0.02 }
    ]
  },
  {
    id: 'menu_elote_tuetano',
    name: 'Vasito Loco con Tuétano de Res',
    category: 'Especialidades',
    price: 95.0,
    cost: 38.0,
    description: 'Una joya gastronómica. Vaso de esquites tradicionales acompañado de un canutillo de tuétano de res asado a las brasas para vaciarlo directo al elote.',
    imageUrl: 'tuetano_elote',
    active: true,
    ingredients: [
      { rawItemId: 'raw_grano_elote', quantity: 0.2 },
      { rawItemId: 'raw_tuetano', quantity: 1 },
      { rawItemId: 'raw_mantequilla', quantity: 0.01 },
      { rawItemId: 'raw_vasos_unicel', quantity: 1 }
    ]
  },
  {
    id: 'menu_esquite_marranada',
    name: 'Marranada con Frituras Cruzadas',
    category: 'Especialidades',
    price: 55.0,
    cost: 20.0,
    description: 'Frituras crujientes (Tostitos o Doritos) abiertos de lado, rellenos de esquite caliente, limón, clamato, mayonesa, queso Cotija y chile habanero molido.',
    imageUrl: 'marranada_toxi',
    active: true,
    ingredients: [
      { rawItemId: 'raw_grano_elote', quantity: 0.15 },
      { rawItemId: 'raw_mayonesa', quantity: 0.02 },
      { rawItemId: 'raw_queso_cotija', quantity: 0.015 }
    ]
  },
  {
    id: 'menu_agua_fresca',
    name: 'Agua de Horchata / Jamaica de la Casa',
    category: 'Bebidas',
    price: 25.0,
    cost: 7.0,
    description: 'Deliciosa agua fresca de receta secreta de elote dulce u horchata clásica bien helada de 500ml.',
    imageUrl: 'agua_fresca',
    active: true,
    ingredients: [
      { rawItemId: 'raw_vasos_unicel', quantity: 1 }
    ]
  },
  {
    id: 'menu_coca_cola',
    name: 'Refresco Botella de Vidrio',
    category: 'Bebidas',
    price: 28.0,
    cost: 16.0,
    description: 'Refresco clásico frío en su versión original de botella de vidrio de 355ml.',
    imageUrl: 'coca_botella',
    active: true,
    ingredients: []
  },
  {
    id: 'menu_queso_extra',
    name: 'Queso Cotija Extra',
    category: 'Adiciones',
    price: 8.0,
    cost: 2.0,
    description: 'Una porción extra del fino y salado queso Cotija zacatecano de rancho.',
    imageUrl: 'queso_extra',
    active: true,
    ingredients: [
      { rawItemId: 'raw_queso_cotija', quantity: 0.02 }
    ]
  },
  {
    id: 'menu_tuetano_extra',
    name: 'Tuétano Adicional (1 pza)',
    category: 'Adiciones',
    price: 45.0,
    cost: 16.0,
    description: 'Pieza de tuétano asada adicional para duplicar la experiencia.',
    imageUrl: 'tuetano_pza',
    active: true,
    ingredients: [
      { rawItemId: 'raw_tuetano', quantity: 1 }
    ]
  }
];

export const INITIAL_SALES: Sale[] = [
  {
    id: 'sale_1',
    branchId: 'suc_centro',
    employeeId: 'emp_cajero1',
    timestamp: '2026-06-17T10:15:00Z',
    items: [
      { menuItemId: 'menu_elote_clasico', name: 'Elote Clásico en Palo', quantity: 2, price: 35.0, cost: 12.5 },
      { menuItemId: 'menu_esquite_clasico', name: 'Esquites Tradicionales (Vaso Mediano)', quantity: 1, price: 40.0, cost: 15.0 },
      { menuItemId: 'menu_agua_fresca', name: 'Agua de Horchata / Jamaica de la Casa', quantity: 2, price: 25.0, cost: 7.0 }
    ],
    total: 160.0,
    paymentMethod: 'efectivo',
    status: 'completada'
  },
  {
    id: 'sale_2',
    branchId: 'suc_centro',
    employeeId: 'emp_cajero1',
    timestamp: '2026-06-17T11:32:00Z',
    items: [
      { menuItemId: 'menu_elote_tuetano', name: 'Vasito Loco con Tuétano de Res', quantity: 1, price: 95.0, cost: 38.0 },
      { menuItemId: 'menu_coca_cola', name: 'Refresco Botella de Vidrio', quantity: 1, price: 28.0, cost: 16.0 }
    ],
    total: 123.0,
    paymentMethod: 'tarjeta',
    status: 'completada'
  },
  {
    id: 'sale_3',
    branchId: 'suc_norte',
    employeeId: 'emp_cajero2',
    timestamp: '2026-06-17T12:05:00Z',
    items: [
      { menuItemId: 'menu_chorielote', name: 'El Chorielote Zacatecano', quantity: 2, price: 65.0, cost: 24.0 },
      { menuItemId: 'menu_esquite_marranada', name: 'Marranada con Frituras Cruzadas', quantity: 1, price: 55.0, cost: 20.0 },
      { menuItemId: 'menu_agua_fresca', name: 'Agua de Horchata / Jamaica de la Casa', quantity: 3, price: 25.0, cost: 7.0 }
    ],
    total: 260.0,
    paymentMethod: 'efectivo',
    status: 'completada'
  },
  {
    id: 'sale_4',
    branchId: 'suc_centro',
    employeeId: 'emp_cajero1',
    timestamp: '2026-06-17T13:45:00Z',
    items: [
      { menuItemId: 'menu_esquite_clasico', name: 'Esquites Tradicionales (Vaso Mediano)', quantity: 4, price: 40.0, cost: 15.0 },
      { menuItemId: 'menu_queso_extra', name: 'Queso Cotija Extra', quantity: 2, price: 8.0, cost: 2.0 }
    ],
    total: 176.0,
    paymentMethod: 'efectivo',
    status: 'completada'
  },
  {
    id: 'sale_5',
    branchId: 'suc_norte',
    employeeId: 'emp_cajero2',
    timestamp: '2026-06-17T14:10:00Z',
    items: [
      { menuItemId: 'menu_elote_tuetano', name: 'Vasito Loco con Tuétano de Res', quantity: 2, price: 95.0, cost: 38.0 },
      { menuItemId: 'menu_agua_fresca', name: 'Agua de Horchata / Jamaica de la Casa', quantity: 2, price: 25.0, cost: 7.0 }
    ],
    total: 240.0,
    paymentMethod: 'tarjeta',
    status: 'completada'
  },
  {
    id: 'sale_cancel_test',
    branchId: 'suc_centro',
    employeeId: 'emp_cajero1',
    timestamp: '2026-06-17T13:00:00Z',
    items: [
      { menuItemId: 'menu_elote_clasico', name: 'Elote Clásico en Palo', quantity: 1, price: 35.0, cost: 12.5 }
    ],
    total: 35.0,
    paymentMethod: 'efectivo',
    status: 'cancelada',
    cancelledBy: 'emp_gerente1'
  }
];

export const INITIAL_TRANSFERS: StockTransfer[] = [
  {
    id: 'trans_1',
    sourceBranchId: 'suc_centro',
    targetBranchId: 'suc_norte',
    rawItemId: 'raw_tuetano',
    quantity: 10,
    status: 'recibido',
    requestedBy: 'emp_gerente2',
    date: '2026-06-15'
  },
  {
    id: 'trans_2',
    sourceBranchId: 'suc_centro',
    targetBranchId: 'suc_guadalupe',
    rawItemId: 'raw_mayonesa',
    quantity: 4,
    status: 'pendiente',
    requestedBy: 'emp_admin',
    date: '2026-06-17'
  }
];

export const INITIAL_AUDITS: InventoryAudit[] = [
  {
    id: 'audit_1',
    branchId: 'suc_centro',
    rawItemId: 'raw_grano_elote',
    systemQty: 42.0,
    actualQty: 40.0,
    difference: -2.0,
    status: 'aprobado',
    date: '2026-06-16',
    notes: 'Exceso de agua drenada al pesar gránula de elote cocido'
  },
  {
    id: 'audit_2',
    branchId: 'suc_norte',
    rawItemId: 'raw_elote_entero',
    systemQty: 120,
    actualQty: 111,
    difference: -9,
    status: 'pendiente_aprobacion',
    date: '2026-06-17',
    notes: 'Merma por elote tierno descompuesto de origen'
  }
];

export const INITIAL_CORTES: CorteCaja[] = [
  {
    id: 'corte_1',
    branchId: 'suc_centro',
    employeeId: 'emp_cajero1',
    employeeName: 'Chela Torres',
    date: '2026-06-16',
    openedAt: '09:00',
    closedAt: '21:00',
    initialCash: 500.0,
    totalSalesCash: 1250.0,
    totalSalesCard: 890.0,
    expectedCash: 1750.0,
    declaredCash: 1750.0,
    difference: 0.0,
    status: 'aprobado',
    validatedBy: 'emp_gerente1',
    notes: 'Corte perfecto sin diferencias.'
  },
  {
    id: 'corte_2',
    branchId: 'suc_norte',
    employeeId: 'emp_cajero2',
    employeeName: 'Paco Pérez',
    date: '2026-06-17',
    openedAt: '08:00',
    closedAt: '15:00',
    initialCash: 500.0,
    totalSalesCash: 500.0, // Let's say he recorded 500.0 cash sales
    totalSalesCard: 240.0,
    expectedCash: 1000.0,
    declaredCash: 990.0, // missing 10 pesos
    difference: -10.0,
    status: 'pendiente',
    notes: 'Declaración ciega indica diferencia de -10 pesos.'
  }
];

export const INITIAL_CLOCK_INS: ClockInLog[] = [
  { id: 'log_1', employeeId: 'emp_staff1', employeeName: 'Juan Rulfo', date: '2026-06-16', clockIn: '08:55:23', clockOut: '17:02:11', hoursWorked: 8.11 },
  { id: 'log_2', employeeId: 'emp_staff2', employeeName: 'Beto Casillas', date: '2026-06-16', clockIn: '09:01:05', clockOut: '17:00:30', hoursWorked: 7.99 },
  { id: 'log_3', employeeId: 'emp_staff1', employeeName: 'Juan Rulfo', date: '2026-06-17', clockIn: '08:48:12' } // currently clocked in today
];
