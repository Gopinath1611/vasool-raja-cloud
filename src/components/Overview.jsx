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
import { Banknote, TrendingUp, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { C } from "../constants/colors";
import Kpi from "./Kpi";

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
    <div className="space-y-5">
      {profile?.plan === "Trial" && daysLeft > 0 && (
        <div
          style={{ background: C.amberSoft, border: `1px solid ${C.amberLine}`, color: C.amber }}
          className="px-4 py-3 rounded-xl flex items-center justify-between text-sm font-bold shadow-sm"
        >
          <span>🚀 You are on a Free Trial. {daysLeft} days remaining.</span>
        </div>
      )}
      {profile?.plan === "Trial" && daysLeft <= 0 && (
        <div
          style={{ background: C.crimsonSoft, border: `1px solid ${C.crimsonLine}`, color: C.crimson }}
          className="px-4 py-3 rounded-xl flex items-center justify-between text-sm font-bold shadow-sm"
        >
          <span>⚠️ Your trial has expired. Upgrade your plan to continue adding customers.</span>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi
          icon={Banknote}
          label={t.today}
          value={`₹${collectedToday.toLocaleString("en-IN")}`}
          sub={`Cash ₹${cashToday} · Digital ₹${digitalToday}`}
          color={C.emerald}
        />
        <Kpi
          icon={TrendingUp}
          label={t.mtd}
          value={`₹${mtd.toLocaleString("en-IN")}`}
          sub="Revenue this month"
          color={C.emeraldDeep}
        />
        <Kpi
          icon={Clock}
          label={t.pending}
          value={`₹${pending.toLocaleString("en-IN")}`}
          sub={`${customers.filter((c) => c.status !== "paid").length} accounts`}
          color={C.amber}
        />
        <Kpi icon={AlertTriangle} label={t.defaulters} value={defaulters.length} sub="Grace period crossed" color={C.crimson} />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div style={{ background: C.card, border: `1px solid ${C.border}` }} className="rounded-2xl p-5 shadow-sm md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="disp font-bold text-sm" style={{ color: C.text }}>
              Revenue Analytics (Last 7 Days)
            </h3>
            <span style={{ color: C.textFaint }} className="text-xs font-semibold">
              Real-time
            </span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid stroke={C.border} vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: C.textMute }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 11, fill: C.textFaint }}
                axisLine={false}
                tickLine={false}
                width={40}
                tickFormatter={(val) => `₹${val}`}
              />
              <Tooltip contentStyle={{ borderRadius: 12, border: `1px solid ${C.border}`, fontSize: 12, fontWeight: "bold" }} />
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

        <div style={{ background: C.card, border: `1px solid ${C.border}` }} className="rounded-2xl p-5 shadow-sm">
          <h3 className="disp font-bold text-sm mb-3" style={{ color: C.text }}>
            {t.recentTx}
          </h3>
          <div className="space-y-2">
            {transactions.slice(0, 4).map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-2" style={{ borderBottom: `1px solid ${C.border}` }}>
                <div className="flex items-center gap-2.5">
                  <div style={{ background: C.emeraldSoft, color: C.emerald }} className="w-8 h-8 rounded-full flex items-center justify-center">
                    <CheckCircle2 size={14} />
                  </div>
                  <div>
                    <div className="text-sm font-medium" style={{ color: C.text }}>
                      {tx.customerName}
                    </div>
                    <div style={{ color: C.textFaint }} className="text-[10px] font-bold uppercase tracking-wider">
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
              <p className="text-sm text-center py-4" style={{ color: C.textFaint }}>
                No transactions yet.
              </p>
            )}
          </div>
        </div>

        <div style={{ background: C.card, border: `1px solid ${C.border}` }} className="rounded-2xl p-5 shadow-sm">
          <h3 className="disp font-bold text-sm mb-3" style={{ color: C.text }}>
            {t.topDefaulters}
          </h3>
          <div className="space-y-2">
            {defaulters.slice(0, 4).map((c) => (
              <div key={c.id} className="flex items-center justify-between py-2" style={{ borderBottom: `1px solid ${C.border}` }}>
                <div className="flex items-center gap-2.5">
                  <span style={{ background: C.crimsonSoft, color: C.crimson }} className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold">
                    {c.name[0]}
                  </span>
                  <div>
                    <div className="text-sm font-medium" style={{ color: C.text }}>
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
              <p className="text-sm text-center py-4" style={{ color: C.textFaint }}>
                Clean sheet!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
