import React from "react";
import { Download, Landmark } from "lucide-react";
import { C } from "../constants/colors";
import { exportToCSV } from "../utils/csvExport";
import MiniStat from "./MiniStat";

export default function Settlement({ agents, transactions, t }) {
  const today = new Date().toISOString().split("T")[0];
  const todaysTx = transactions.filter((tx) => tx.date.startsWith(today));

  const stats = agents.map((a) => {
    const aTx = todaysTx.filter((tx) => tx.agentId === a.id);
    const cash = aTx.filter((tx) => tx.mode === "cash").reduce((s, tx) => s + Number(tx.amount), 0);
    const digital = aTx.filter((tx) => tx.mode !== "cash").reduce((s, tx) => s + Number(tx.amount), 0);
    return { ...a, visited: aTx.length, cash, digital, total: cash + digital, deposited: 0 };
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="disp font-bold text-base" style={{ color: C.text }}>
          End-of-day settlement
        </h3>
        <button
          onClick={() => exportToCSV(`Settlement_${today}.csv`, stats)}
          style={{ border: `1px solid ${C.border}`, color: C.textMute }}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-white shadow-sm hover:bg-slate-50"
        >
          <Download size={14} /> Export CSV
        </button>
      </div>

      <div className="space-y-3">
        {stats.map((a) => {
          const balance = a.cash - a.deposited;
          return (
            <div key={a.id} style={{ background: C.card, border: `1px solid ${C.border}` }} className="rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div style={{ background: C.slateBg }} className="w-9 h-9 rounded-xl flex items-center justify-center border">
                    <Landmark size={16} color={C.textMute} />
                  </div>
                  <span className="text-sm font-bold" style={{ color: C.text }}>
                    {a.name}
                  </span>
                </div>
                <span
                  style={{ background: balance === 0 ? C.emeraldSoft : C.amberSoft, color: balance === 0 ? C.emerald : C.amber }}
                  className="text-[10px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-lg border border-transparent"
                >
                  {balance === 0 ? "Settled" : "Pending Cash"}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center bg-slate-50 rounded-xl p-3.5 border border-slate-100">
                <MiniStat label="Visits" value={a.visited} />
                <MiniStat label="Cash" value={`₹${a.cash}`} />
                <MiniStat label="Digital" value={`₹${a.digital}`} />
                <MiniStat label="To Owner" value={`₹${balance}`} color={balance > 0 ? C.crimson : C.emerald} />
              </div>
            </div>
          );
        })}
        {stats.length === 0 && <p className="text-sm text-center py-8 text-slate-500">No agents found to settle.</p>}
      </div>
    </div>
  );
}
