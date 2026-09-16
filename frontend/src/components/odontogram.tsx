'use client';

import React, { useState } from 'react';

// Tooth condition options
export type ToothCondition =
  | 'CARIES'
  | 'FILLING'
  | 'ROOT_CANAL'
  | 'CROWN'
  | 'IMPLANT'
  | 'EXTRACTION'
  | 'MISSING'
  | 'VENEER'
  | 'HEALTHY';

interface ToothState {
  toothNumber: number;
  condition: ToothCondition;
  notes?: string;
}

interface OdontogramProps {
  initialStates?: ToothState[];
  onToothUpdate?: (toothNumber: number, condition: ToothCondition, notes?: string) => void;
}

export const Odontogram: React.FC<OdontogramProps> = ({
  initialStates = [],
  onToothUpdate,
}) => {
  const [toothMap, setToothMap] = useState<Record<number, ToothCondition>>(() => {
    const map: Record<number, ToothCondition> = {};
    initialStates.forEach((s) => {
      map[s.toothNumber] = s.condition;
    });
    return map;
  });

  React.useEffect(() => {
    const map: Record<number, ToothCondition> = {};
    initialStates.forEach((s) => {
      map[s.toothNumber] = s.condition;
    });
    setToothMap(map);
  }, [initialStates]);

  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);

  // FDI quadrants
  const q1 = [18, 17, 16, 15, 14, 13, 12, 11]; // Upper Right
  const q2 = [21, 22, 23, 24, 25, 26, 27, 28]; // Upper Left
  const q4 = [48, 47, 46, 45, 44, 43, 42, 41]; // Lower Right
  const q3 = [31, 32, 33, 34, 35, 36, 37, 38]; // Lower Left

  const handleToothClick = (toothNum: number) => {
    setSelectedTooth(toothNum);
  };

  const handleConditionSelect = (cond: ToothCondition) => {
    if (!selectedTooth) return;

    setToothMap((prev) => ({
      ...prev,
      [selectedTooth]: cond,
    }));

    if (onToothUpdate) {
      onToothUpdate(selectedTooth, cond);
    }
    setSelectedTooth(null);
  };

  const getToothColorClass = (cond?: ToothCondition) => {
    switch (cond) {
      case 'CARIES':
        return 'fill-rose-500 stroke-rose-700';
      case 'FILLING':
        return 'fill-sky-400 stroke-sky-600';
      case 'ROOT_CANAL':
        return 'fill-amber-500 stroke-amber-700';
      case 'CROWN':
        return 'fill-yellow-400 stroke-yellow-500';
      case 'IMPLANT':
        return 'fill-emerald-500 stroke-emerald-700';
      case 'MISSING':
      case 'EXTRACTION':
        return 'fill-slate-300 stroke-slate-400 opacity-40';
      case 'VENEER':
        return 'fill-indigo-400 stroke-indigo-600';
      default:
        return 'fill-slate-100 stroke-slate-400 hover:fill-slate-200';
    }
  };

  const renderTooth = (num: number) => {
    const cond = toothMap[num];
    const fillClass = getToothColorClass(cond);

    return (
      <div
        key={num}
        onClick={() => handleToothClick(num)}
        className="flex flex-col items-center cursor-pointer transition-all hover:scale-110"
      >
        <span className="text-[10px] font-bold text-slate-500 mb-1">{num}</span>
        <svg className={`w-8 h-12 ${fillClass}`} viewBox="0 0 100 140" xmlns="http://www.w3.org/2000/svg">
          <path d="M20,10 Q50,0 80,10 Q100,50 80,90 Q65,100 50,110 Q35,100 20,90 Q0,50 20,10 Z" strokeWidth="6" />
          <path d="M35,40 Q50,30 65,40 Q70,60 50,75 Q30,60 35,40 Z" fill="rgba(255,255,255,0.4)" strokeWidth="4" />
          <path d="M35,100 L40,135 Q50,140 60,135 L65,100" strokeWidth="5" />
        </svg>
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h4 className="font-bold text-slate-800 text-sm">FDI Interactive Odontogram</h4>
          <p className="text-xs text-slate-400">Click a tooth to update its treatment status</p>
        </div>
      </div>

      <div className="flex flex-col items-center py-4 bg-slate-50 rounded-xl overflow-x-auto">
        <div className="min-w-[650px] space-y-8 px-8">
          {/* Upper Jaw */}
          <div className="flex justify-between relative">
            <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 border-l border-dashed border-slate-300"></div>
            <div className="flex space-x-2 justify-end flex-1 pr-6">{q1.map(renderTooth)}</div>
            <div className="flex space-x-2 justify-start flex-1 pl-6">{q2.map(renderTooth)}</div>
          </div>

          {/* Lower Jaw */}
          <div className="flex justify-between relative">
            <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 border-l border-dashed border-slate-300"></div>
            <div className="flex space-x-2 justify-end flex-1 pr-6">{q4.map(renderTooth)}</div>
            <div className="flex space-x-2 justify-start flex-1 pl-6">{q3.map(renderTooth)}</div>
          </div>
        </div>
      </div>

      {selectedTooth && (
        <div className="fixed inset-0 bg-[#1E0726]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4">
            <h4 className="font-bold text-slate-800 text-sm">Tooth {selectedTooth} Diagnosis</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {(['CARIES', 'FILLING', 'ROOT_CANAL', 'CROWN', 'IMPLANT', 'MISSING', 'VENEER', 'HEALTHY'] as ToothCondition[]).map((cond) => (
                <button
                  key={cond}
                  onClick={() => handleConditionSelect(cond)}
                  className="p-2.5 text-left border rounded-xl hover:bg-slate-50 font-semibold"
                >
                  {cond.replace('_', ' ')}
                </button>
              ))}
            </div>
            <button
              onClick={() => setSelectedTooth(null)}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
