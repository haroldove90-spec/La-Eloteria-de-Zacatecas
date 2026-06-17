/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, AlertCircle, Users, Unlock, Eye, EyeOff } from 'lucide-react';
import { Employee, ClockInLog } from '../../types';

interface StaffClockProps {
  employees: Employee[];
  clockIns: ClockInLog[];
  setClockIns: React.Dispatch<React.SetStateAction<ClockInLog[]>>;
}

export default function StaffClock({ employees, clockIns, setClockIns }: StaffClockProps) {
  const [selectedEmpId, setSelectedEmpId] = useState<string>('');
  const [pinInput, setPinInput] = useState<string>('');
  const [maskPin, setMaskPin] = useState(true);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Clock ticks
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleNumClick = (num: string) => {
    if (pinInput.length < 4) {
      setPinInput(prev => prev + num);
      setErrorMessage('');
    }
  };

  const handleClear = () => {
    setPinInput('');
    setErrorMessage('');
  };

  const handlePunch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpId) {
      setErrorMessage('⚠️ Por favor, selecciona primero tu nombre de la lista.');
      return;
    }

    if (pinInput.length !== 4) {
      setErrorMessage('⚠️ El PIN de seguridad debe ser de exactamente 4 dígitos.');
      return;
    }

    const employeeObj = employees.find(emp => emp.id === selectedEmpId);
    if (!employeeObj) {
      setErrorMessage('⚠️ Empleado no encontrado.');
      return;
    }

    // Verify PIN
    if (employeeObj.pin !== pinInput) {
      setErrorMessage('❌ PIN Incorrecto. Intenta nuevamente.');
      setPinInput('');
      return;
    }

    // PIN is correct, execute Punch action!
    const todayStr = new Date().toISOString().split('T')[0];
    const activeLogIndex = clockIns.findIndex(log => log.employeeId === selectedEmpId && !log.clockOut);

    const nowTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    if (activeLogIndex !== -1) {
      // Clock OUT
      const targetLog = clockIns[activeLogIndex];
      // Estimate active worked hours
      const [hIn, mIn, sIn] = targetLog.clockIn.split(':').map(Number);
      const [hOut, mOut, sOut] = nowTimeStr.split(':').map(Number);
      const totalInSecs = (hIn * 3600) + (mIn * 60) + sIn;
      const totalOutSecs = (hOut * 3600) + (mOut * 60) + sOut;
      let diffInHrs = (totalOutSecs - totalInSecs) / 3600;
      if (diffInHrs < 0) diffInHrs += 24; // If shift crossed midnight

      setClockIns(prev => prev.map((log, index) => {
        if (index === activeLogIndex) {
          return {
            ...log,
            clockOut: nowTimeStr,
            hoursWorked: Number(diffInHrs)
          };
        }
        return log;
      }));

      alert(`👋 ¡Hasta luego, ${employeeObj.name}!\nSalida registrada con éxito a las ${nowTimeStr}.\nHoras del turno: ${diffInHrs.toFixed(2)} hrs.`);
    } else {
      // Clock IN
      const newClockItem: ClockInLog = {
        id: 'clock_' + Math.random().toString(36).substring(2, 9),
        employeeId: selectedEmpId,
        employeeName: employeeObj.name,
        date: todayStr,
        clockIn: nowTimeStr
      };

      setClockIns(prev => [newClockItem, ...prev]);
      alert(`🎉 ¡Bienvenido a laborar, ${employeeObj.name}!\nEntrada registrada con éxito a las ${nowTimeStr}.\n¡Que sea un excelente turno de elotes! 🌽`);
    }

    setPinInput('');
    setSelectedEmpId('');
    setErrorMessage('');
  };

  const getActiveWorkers = () => {
    return clockIns.filter(log => !log.clockOut);
  };

  const activeWorkers = getActiveWorkers();


  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" id="staff_clock_root">
      {/* COLUMN 1: PUNCH INTERFACE (col-span-7) */}
      <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-gray-100 shadow-md flex flex-col items-center justify-center space-y-5">
        <div className="text-center space-y-1">
          <h2 className="text-[#155E37] font-extrabold text-sm tracking-wide uppercase font-mono">Reloj Checador Escolarizado</h2>
          <p className="text-3xl font-black text-stone-800 font-mono tracking-tight glow-text flex items-center gap-2 justify-center">
            <Clock className="w-7 h-7 text-amber-500 animate-pulse" />
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
          <p className="text-stone-400 text-xs font-mono font-medium">
            {currentTime.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Employee Dropdown Selector */}
        <div className="w-full max-w-sm">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest font-mono mb-1.5 text-center">
            Escoge tu Nombre Completo:
          </label>
          <select
            value={selectedEmpId}
            onChange={(e) => {
              setSelectedEmpId(e.target.value);
              setErrorMessage('');
            }}
            className="w-full border border-gray-200 rounded-lg p-2.5 text-xs text-stone-700 bg-stone-50 font-semibold focus:outline-none focus:ring-1 focus:ring-[#155E37]"
            id="employee_punch_selector"
          >
            <option value="">Selección de Empleado...</option>
            {employees.filter(e => e.active).map(emp => (
              <option key={emp.id} value={emp.id}>
                {emp.name} ({emp.role === 'staff' ? 'Preparador' : emp.role.toUpperCase()})
              </option>
            ))}
          </select>
        </div>

        {/* Numerical Pad with PIN View */}
        <div className="w-full max-w-xs space-y-3.5">
          {/* PIN Input Dots screen */}
          <div className="relative flex items-center justify-center bg-stone-50 border border-gray-250 py-3 rounded-lg shadow-inner">
            <div className="flex gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-3.5 h-3.5 rounded-full border border-stone-300 transition-colors duration-200 ${
                    pinInput.length > i ? 'bg-[#155E37] border-[#155E37] scale-110' : 'bg-stone-100'
                  }`}
                ></div>
              ))}
            </div>

            {/* Toggle visual */}
            <button
               onClick={() => setMaskPin(!maskPin)}
              type="button"
              className="absolute right-3.5 text-stone-400 hover:text-stone-600"
            >
              {maskPin ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </div>

          {!maskPin && pinInput && (
            <p className="text-center font-mono font-bold tracking-widest text-[#155E37] text-sm animate-fadeIn">
              PIN: {pinInput}
            </p>
          )}

          {/* Num pad Grid */}
          <div className="grid grid-cols-3 gap-2 text-sm">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
              <button
                key={num}
                type="button"
                onClick={() => handleNumClick(num)}
                className="bg-stone-50 hover:bg-stone-100 border border-stone-200 py-3.5 rounded-xl font-bold font-mono text-stone-700 text-base shadow-sm shrink-0 active:scale-95 transition"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={handleClear}
              className="bg-red-50 hover:bg-red-100 border border-red-200 py-3.5 rounded-xl font-bold font-mono text-red-650 tracking-tight active:scale-95 transition text-xs"
            >
              Borrar
            </button>
            <button
              type="button"
              onClick={() => handleNumClick('0')}
              className="bg-stone-50 hover:bg-stone-100 border border-stone-200 py-3.5 rounded-xl font-bold font-mono text-stone-700 text-base shadow-sm active:scale-95 transition"
            >
              0
            </button>
            <button
              type="button"
              onClick={handlePunch}
              className="bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl font-bold font-sans active:scale-95 transition text-xs flex items-center justify-center gap-1 leading-none shadow-md"
              id="confirm_punch_btn"
            >
              OK
            </button>
          </div>

          {errorMessage && (
            <p className="bg-red-50 border border-red-100 text-red-600 text-[11px] font-semibold p-2 rounded-lg text-center font-sans animate-fadeIn">
              {errorMessage}
            </p>
          )}
        </div>
      </div>

      {/* COLUMN 2: ACTIVE PERSONNEL (col-span-5) */}
      <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-gray-100 shadow-md space-y-4">
        <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider font-mono border-b border-gray-100 pb-2.5 flex items-center gap-2">
          <Users className="w-4 h-4 text-emerald-600" />
          Personal en Servicio Activo Actualmente ({activeWorkers.length})
        </h3>

        {activeWorkers.length === 0 ? (
          <div className="p-4 bg-stone-50 rounded-lg text-center text-stone-400 text-xs">
            Ningún empleado con turno en curso actualmente.
          </div>
        ) : (
          <div className="space-y-2">
            {activeWorkers.map(log => {
              const emp = employees.find(e => e.id === log.employeeId);
              return (
                <div key={log.id} className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl flex items-center justify-between text-xs font-sans">
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <div>
                      <p className="font-bold text-stone-800">{log.employeeName}</p>
                      <p className="text-[10px] text-stone-400 font-bold uppercase font-mono mt-0.5">
                        {emp?.role === 'staff' ? 'Preparador' : emp?.role ?? 'Personal'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 block font-mono">Entró hoy:</span>
                    <span className="font-bold text-emerald-700 font-mono">{log.clockIn}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
