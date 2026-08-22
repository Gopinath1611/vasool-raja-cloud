import React from "react";
import { C } from "../constants/colors";

export default function MiniStat({ label, value, color }) {
  return (
    <div>
      <div className="mono text-sm font-extrabold" style={{ color: color || C.text }}>
        {value}
      </div>
      <div style={{ color: C.textFaint }} className="text-[10px] font-semibold uppercase tracking-wider mt-1">
        {label}
      </div>
    </div>
  );
}
