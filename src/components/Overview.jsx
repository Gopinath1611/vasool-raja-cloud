import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { CheckCircle2 } from "lucide-react";
import { C } from "../constants/colors";

export default function Overview({ profile, customers, transactions, t }) {
  const today = new Date().toISOString().split("T")[0];
  const todaysTx = transactions.filter((tx) => tx.date.startsWith(today));

  const collectedToday = todaysTx.reduce((sum, tx) => sum + Number(tx.amount), 0);
  const cashToday = todaysTx.filter((tx) => tx.mode === "cash").reduce((sum, tx) => sum + Number(tx.amount), 0);
  const digitalToday = collectedToday - cashToday;

  const currentMonth = today.slice(0, 7);
  const mtd = transactions.filter((tx) => tx.date.startsWith(currentMonth)).reduce((sum, tx) => sum + Number(tx.amount), 0);

  const pending = customers.filter((c) => c.status !== "paid").reduce((sum, c) => sum + Number(c.amount), 0);
  const defaulters = customers.filter((c) => c.status === "overdue");

  // Dynamic Chart Data (Last 7 Days)
  const chartData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const dayLabel = d.toLocaleDateString("en-GB", { weekday: "short" });
      const dayTotal = transactions
        .filter((tx) => tx.date.startsWith(dateStr))
        .reduce((sum, tx) => sum + Number(tx.amount), 0);
      data.push({ day: dayLabel, amt: dayTotal });
    }
    return data;
  }, [transactions]);

  const daysLeft = profile?.trialEnds
    ? Math.ceil((new Date(profile.trialEnds) - new Date()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="space-y-6">
      {/* Trial Banner */}
      {profile?.plan === "Trial" && daysLeft > 0 && (
        <div
          style={{ background: C.amberSoft, border: `1px solid ${C.amberLine}`, color: C.amber }}
          className="px-5 py-3.5 rounded-2xl flex items-center justify-between text-sm font-bold shadow-sm"
        >
          <span>🚀 You are on a Free Trial. {daysLeft} days remaining.</span>
        </div>
      )}
      {profile?.plan === "Trial" && daysLeft <= 0 && (
        <div
          style={{ background: C.crimsonSoft, border: `1px solid ${C.crimsonLine}`, color: C.crimson }}
          className="px-5 py-3.5 rounded-2xl flex items-center justify-between text-sm font-bold shadow-sm"
        >
          <span>⚠️ Your trial has expired. Upgrade your plan to continue adding customers.</span>
        </div>
      )}

      {/* --- KPI Cards Grid (Vibrant Gradient Look) --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Today's Collection */}
        <div className="bg-gradient-to-br from-emerald-500/15 via-white to-white p-5 rounded-3xl border border-emerald-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold tracking-wider text-emerald-700 uppercase">{t.today}</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 font-bold">₹</div>
          </div>
          <div className="text-2xl font-black text-slate-800 tracking-tight">₹{collectedToday.toLocaleString("en-IN")}</div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">Cash ₹{cashToday} · Digital ₹{digitalToday}</div>
        </div>

        {/* Month to Date */}
        <div className="bg-gradient-to-br from-blue-500/15 via-white to-white p-5 rounded-3xl border border-blue-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold tracking-wider text-blue-700 uppercase">{t.mtd}</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20 font-bold">📈</div>
          </div>
          <div className="text-2xl font-black text-slate-800 tracking-tight">₹{mtd.toLocaleString("en-IN")}</div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">Revenue this month</div>
        </div>

        {/* Pending Dues */}
        <div className="bg-gradient-to-br from-amber-500/15 via-white to-white p-5 rounded-3xl border border-amber-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold tracking-wider text-amber-700 uppercase">{t.pending}</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20 font-bold">⏳</div>
          </div>
          <div className="text-2xl font-black text-slate-800 tracking-tight">₹{pending.toLocaleString("en-IN")}</div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">{customers.filter((c) => c.status !== "paid").length} accounts</div>
        </div>

        {/* Defaulters */}
        <div className="bg-gradient-to-br from-rose-500/15 via-white to-white p-5 rounded-3xl border border-rose-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold tracking-wider text-rose-700 uppercase">{t.defaulters}</span>
            <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-500/20 font-bold">⚠️</div>
          </div>
          <div className="text-2xl font-black text-slate-800 tracking-tight">{defaulters.length}</div>
          <div className="text-[11px] text-rose-600 mt-1 font-bold">Grace period crossed</div>
        </div>

      </div>

      {/* Analytics & Lists Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Revenue Analytics Chart */}
        <div style={{ background: C.card, border: `1px solid ${C.border}` }} className="rounded-3xl p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h3 className="disp font-extrabold text-base tracking-tight" style={{ color: C.text }}>
              Revenue Analytics (Last 7 Days)
            </h3>
            <span style={{ color: C.emerald, background: C.emeraldSoft }} className="text-xs font-bold px-3 py-1 rounded-full">
              Real-time
            </span>
          </div>
          <div className="w-full h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid stroke={C.border} vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: C.textMute }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: C.textFaint }}
                  axisLine={false}
                  tickLine={false}
                  width={45}
                  tickFormatter={(val) => `₹${val}`}
                />
                <Tooltip contentStyle={{ borderRadius: 12, border: `1px solid ${C.border}`, fontSize: 12, fontWeight: "bold", background: "#fff" }} />
                <Line
                  type="monotone"
                  dataKey="amt"
                  stroke={C.emerald}
                  strokeWidth={3}
                  dot={{ r: 4, fill: C.emerald, strokeWidth: 2, stroke: "#fff" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Transactions */}
        <div style={{ background: C.card, border: `1px solid ${C.border}` }} className="rounded-3xl p-6 shadow-sm">
          <h3 className="disp font-extrabold text-base mb-4 tracking-tight" style={{ color: C.text }}>
            {t.recentTx}
          </h3>
          <div className="space-y-3">
            {transactions.slice(0, 4).map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-2.5" style={{ borderBottom: `1px solid ${C.border}` }}>
                <div className="flex items-center gap-3">
                  <div style={{ background: C.emeraldSoft, color: C.emerald }} className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold leading-snug" style={{ color: C.text }}>
                      {tx.customerName}
                    </div>
                    <div style={{ color: C.textFaint }} className="text-[10px] font-bold uppercase tracking-wider mt-0.5">
                      {tx.mode} · {new Date(tx.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <span className="mono text-sm font-bold" style={{ color: C.emerald }}>
                  +₹{tx.amount}
                </span>
              </div>
            ))}
            {transactions.length === 0 && (
              <p className="text-sm text-center py-8" style={{ color: C.textFaint }}>
                No transactions yet.
              </p>
            )}
          </div>
        </div>

        {/* Top Defaulters */}
        <div style={{ background: C.card, border: `1px solid ${C.border}` }} className="rounded-3xl p-6 shadow-sm lg:col-span-3">
          <h3 className="disp font-extrabold text-base mb-4 tracking-tight" style={{ color: C.text }}>
            {t.topDefaulters}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {defaulters.slice(0, 4).map((c) => (
              <div key={c.id} className="flex items-center justify-between p-3.5 rounded-2xl border" style={{ borderColor: C.border, background: C.slateBg }}>
                <div className="flex items-center gap-3">
                  <span style={{ background: C.crimsonSoft, color: C.crimson }} className="w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold shrink-0">
                    {c.name[0]}
                  </span>
                  <div>
                    <div className="text-sm font-semibold" style={{ color: C.text }}>
                      {c.name}
                    </div>
                    <div style={{ color: C.textFaint }} className="text-xs">
                      {c.area}
                    </div>
                  </div>
                </div>
                <span className="mono text-sm font-bold" style={{ color: C.crimson }}>
                  ₹{c.amount}
                </span>
              </div>
            ))}
            {defaulters.length === 0 && (
              <p className="text-sm text-center py-4 col-span-full" style={{ color: C.textFaint }}>
                Clean sheet! No defaulters.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
