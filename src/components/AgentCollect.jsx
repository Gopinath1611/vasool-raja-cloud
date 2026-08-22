import React, { useState } from "react";
import { Search, Wifi, MapPin } from "lucide-react";
import { C } from "../constants/colors";
import { statusCfg } from "../constants/app";
import CollectModal from "./CollectModal";

export default function AgentCollect({ user, session, customers, t, lang, profile }) {
  const [query, setQuery] = useState("");
  const [street, setStreet] = useState(session.assignedArea === "All" ? "All" : session.assignedArea);
  const [statusFilter, setStatusFilter] = useState("All");
  const [selected, setSelected] = useState(null);

  // Route Limitation Logic
  const agentCustomers = session.assignedArea === "All" ? customers : customers.filter((c) => c.area === session.assignedArea);

  const todayCollected = agentCustomers.filter((c) => c.status === "paid").length;
  const todayAmount = agentCustomers.filter((c) => c.status === "paid").reduce((s, c) => s + Number(c.amount), 0);

  const uniqueAreas = ["All", ...new Set(agentCustomers.map((c) => c.area))];

  const filtered = agentCustomers.filter((c) => {
    const mq = c.name.toLowerCase().includes(query.toLowerCase()) || c.area.toLowerCase().includes(query.toLowerCase());
    const ms = street === "All" || c.area === street;
    const stMap = { All: null, Paid: "paid", "Due soon": "due", Overdue: "overdue" };
    const mst = statusFilter === "All" || c.status === stMap[statusFilter];
    return mq && ms && mst;
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        <div style={{ background: C.emeraldSoft, border: `1px solid ${C.emeraldLine}` }} className="rounded-xl p-3 shadow-sm">
          <div style={{ color: C.emerald }} className="text-[10px] font-bold uppercase tracking-wider">
            {t.today}
          </div>
          <div className="mono text-lg font-bold" style={{ color: C.text }}>
            ₹{todayAmount}
          </div>
        </div>
        <div style={{ background: C.card, border: `1px solid ${C.border}` }} className="rounded-xl p-3 shadow-sm">
          <div style={{ color: C.textFaint }} className="text-[10px] font-bold uppercase tracking-wider">
            Visits
          </div>
          <div className="mono text-lg font-bold" style={{ color: C.text }}>
            {todayCollected}/{agentCustomers.length}
          </div>
        </div>
        <div style={{ background: C.card, border: `1px solid ${C.border}` }} className="rounded-xl p-3 flex flex-col justify-center gap-1 shadow-sm">
          <div className="flex items-center gap-1.5">
            <Wifi size={13} color={C.emerald} />
            <span style={{ color: C.textMute }} className="text-[10px] font-bold uppercase tracking-wider leading-tight">
              {t.offlineMode}
            </span>
          </div>
          <span style={{ color: C.textFaint }} className="text-[9px] font-medium">
            Auto Sync
          </span>
        </div>
      </div>

      <div className="flex gap-2">
        <div style={{ background: C.card, border: `1px solid ${C.border}` }} className="flex items-center gap-2 rounded-xl px-3 py-2.5 flex-1 shadow-sm">
          <Search size={16} color={C.textFaint} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.search} style={{ color: C.text }} className="outline-none text-sm w-full bg-transparent" />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
        {["All", "Paid", "Due soon", "Overdue"].map((s) => {
          const lKey = s === "All" ? "all" : s === "Paid" ? "paid" : s === "Due soon" ? "due" : "overdue";
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              style={{
                background: statusFilter === s ? C.emerald : C.card,
                color: statusFilter === s ? "white" : C.textMute,
                border: `1px solid ${statusFilter === s ? C.emerald : C.border}`,
              }}
              className="text-xs font-bold px-4 py-2 rounded-full whitespace-nowrap shadow-sm transition-colors tracking-wide"
            >
              {t[lKey]}
            </button>
          );
        })}
        {session.assignedArea === "All" && (
          <select
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            style={{ border: `1px solid ${C.border}`, color: C.textMute }}
            className="text-xs font-bold px-3 py-1.5 rounded-full bg-white shadow-sm outline-none tracking-wide"
          >
            {uniqueAreas.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
        )}
      </div>

      <div className="space-y-3 pb-6 mt-2">
        {filtered.map((c) => {
          const cfg = statusCfg[c.status] || statusCfg.due;
          const Icon = cfg.icon;
          return (
            <div
              key={c.id}
              style={{ background: C.card, border: `1px solid ${C.border}`, borderLeft: `4px solid ${cfg.color}` }}
              className="rounded-xl p-3.5 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3">
                <span style={{ background: cfg.soft, color: cfg.color }} className="w-11 h-11 rounded-full flex items-center justify-center text-base font-bold shrink-0">
                  {c.name[0]}
                </span>
                <div>
                  <div className="text-sm font-bold" style={{ color: C.text }}>
                    {c.name}
                  </div>
                  <div style={{ color: C.textFaint }} className="text-xs font-medium flex items-center gap-1 mt-0.5">
                    <MapPin size={11} />
                    {c.area}
                  </div>
                  <div style={{ color: C.textMute }} className="text-[10px] font-semibold mt-0.5 tracking-wide">
                    {c.package}
                  </div>
                </div>
              </div>
              <div className="text-right shrink-0 ml-2">
                <div className="mono text-base font-extrabold mb-1.5" style={{ color: C.text }}>
                  ₹{c.amount}
                </div>
                {c.status === "paid" ? (
                  <span style={{ background: cfg.soft, color: cfg.color }} className="flex items-center justify-end gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-lg tracking-wide">
                    <Icon size={12} /> {t.paid}
                  </span>
                ) : (
                  <button onClick={() => setSelected(c)} style={{ background: cfg.color }} className="text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm hover:opacity-90 transition-opacity uppercase tracking-wider">
                    {t.collectBtn}
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ color: C.textFaint }} className="text-center text-sm font-medium py-10 bg-white rounded-xl border border-dashed border-slate-300">
            No connections match your filter.
          </div>
        )}
      </div>

      {selected && <CollectModal user={user} session={session} customer={selected} onClose={() => setSelected(null)} lang={lang} profile={profile} />}
    </div>
  );
}
