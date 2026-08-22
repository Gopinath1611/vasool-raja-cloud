import React, { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Wallet,
  ClipboardList,
  Crown,
  UserPlus,
  Globe,
  LogOut,
  Tv,
} from "lucide-react";
import { C } from "../constants/colors";
import GlobalFonts from "./GlobalFonts";
import AgentCollect from "./AgentCollect";
import Overview from "./Overview";
import CustomerDirectory from "./CustomerDirectory";
import TeamManagement from "./TeamManagement";
import Settlement from "./Settlement";
import Plans from "./Plans";

export default function AppShell({ user, session, onLogout, lang, setLang, t, profile, customers, agents, transactions }) {
  const [view, setView] = useState(session.role);
  const [tab, setTab] = useState("overview");

  const adminTabs = [
    { id: "overview", label: t.dash, icon: LayoutDashboard },
    { id: "customers", label: t.cust, icon: Users },
    { id: "team", label: t.team, icon: UserPlus },
    { id: "settle", label: t.settle, icon: ClipboardList },
    { id: "plans", label: t.plans, icon: Crown },
  ];

  return (
    <div style={{ background: C.slateBg, minHeight: "100vh" }} className="pb-16 md:pb-0">
      <GlobalFonts />
      <div style={{ background: C.card, borderBottom: `1px solid ${C.border}` }} className="sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div style={{ background: C.emerald }} className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm">
              <Wallet size={18} color="white" />
            </div>
            <div>
              <div className="disp text-base font-bold leading-none" style={{ color: C.text }}>
                Vasool Raja
              </div>
              <div style={{ color: C.textFaint }} className="text-[11px] leading-none mt-1 font-medium">
                {view === "admin" ? t.ownerView : `${t.agentView} · ${session.agentName}`}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {session.role === "admin" && (
              <div style={{ background: C.slateBg }} className="hidden sm:flex gap-1 rounded-full p-1 border">
                {[
                  { k: "admin", l: t.ownerView },
                  { k: "agent", l: t.agentView },
                ].map((v) => (
                  <button
                    key={v.k}
                    onClick={() => setView(v.k)}
                    style={{ background: view === v.k ? C.emerald : "transparent", color: view === v.k ? "white" : C.textMute }}
                    className="text-xs font-semibold px-3 py-1.5 rounded-full transition-colors"
                  >
                    {v.l}
                  </button>
                ))}
              </div>
            )}
            <button onClick={() => setLang(lang === "en" ? "ta" : "en")} style={{ border: `1px solid ${C.border}`, color: C.textMute }} className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full bg-white">
              <Globe size={13} /> {lang === "en" ? "TA" : "EN"}
            </button>
            <button onClick={onLogout} style={{ color: C.crimson }} className="p-2 rounded-full hover:bg-red-50 bg-white border border-red-100">
              <LogOut size={16} />
            </button>
          </div>
        </div>

        {view === "admin" && (
          <div className="max-w-6xl mx-auto flex gap-1 px-4 overflow-x-auto hide-scrollbar">
            {adminTabs.map((tb) => (
              <button
                key={tb.id}
                onClick={() => setTab(tb.id)}
                style={{ color: tab === tb.id ? C.emerald : C.textMute, borderBottom: tab === tb.id ? `2px solid ${C.emerald}` : "2px solid transparent" }}
                className="flex items-center gap-1.5 text-sm font-medium px-3 py-2.5 whitespace-nowrap transition-colors"
              >
                <tb.icon size={14} /> {tb.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-4 py-5">
        {view === "agent" ? (
          <AgentCollect user={user} session={session} customers={customers} t={t} lang={lang} profile={profile} />
        ) : tab === "overview" ? (
          <Overview profile={profile} customers={customers} transactions={transactions} t={t} />
        ) : tab === "customers" ? (
          <CustomerDirectory user={user} profile={profile} customers={customers} t={t} lang={lang} />
        ) : tab === "team" ? (
          <TeamManagement user={user} agents={agents} t={t} lang={lang} profile={profile} />
        ) : tab === "settle" ? (
          <Settlement agents={agents} transactions={transactions} t={t} />
        ) : (
          <Plans user={user} profile={profile} t={t} />
        )}
      </div>

      {session.role === "admin" && (
        <div style={{ background: C.card, borderTop: `1px solid ${C.border}` }} className="fixed bottom-0 left-0 right-0 md:hidden z-20 pb-safe">
          <div className="grid grid-cols-5">
            {[...adminTabs, { id: "agentview", label: "Agent", icon: Tv }].map((tb) => (
              <button
                key={tb.id}
                onClick={() => (tb.id === "agentview" ? setView("agent") : (setView("admin"), setTab(tb.id)))}
                style={{ color: (view === "agent" && tb.id === "agentview") || (view === "admin" && tab === tb.id) ? C.emerald : C.textFaint }}
                className="flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors"
              >
                <tb.icon size={17} /> {tb.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
