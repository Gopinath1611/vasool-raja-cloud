import React from "react";
import { C } from "../constants/colors";

export default function Kpi({ icon: Icon, label, value, sub, color }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}` }} className="rounded-2xl p-4 shadow-sm">
      <div style={{ background: `${color}14` }} className="w-8 h-8 rounded-lg flex items-center justify-center mb-2.5">
        <Icon size={16} color={color} />
      </div>
      <div style={{ color: C.textFaint }} className="text-[10px] font-bold uppercase tracking-wider">
        {label}
      </div>
      <div className="mono text-lg font-extrabold mt-0.5" style={{ color: C.text }}>
        {value}
      </div>
      <div style={{ color: C.textFaint }} className="text-[11px] font-medium mt-1">
        {sub}
      </div>
    </div>
  );
}
