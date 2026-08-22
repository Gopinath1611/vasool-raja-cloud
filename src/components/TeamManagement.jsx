import React, { useState } from "react";
import { Plus, Phone, Trash2, X } from "lucide-react";
import { db, appId, doc, addDoc, collection, deleteDoc } from "../firebase";
import { C } from "../constants/colors";
import { AREAS, AGENT_LIMITS } from "../constants/app";

export default function TeamManagement({ user, agents, t, lang, profile }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAgent, setNewAgent] = useState({ name: "", phone: "", pin: "", assignedArea: "All" });

  const currentLimit = AGENT_LIMITS[profile?.plan || "Trial"];
  const canAddAgent = agents.length < currentLimit;

  const handleAdd = async () => {
    if (!user || !newAgent.name || newAgent.phone.length < 10 || newAgent.pin.length < 4) return;
    await addDoc(collection(db, "artifacts", appId, "users", user.uid, "agents"), {
      ...newAgent,
      createdAt: new Date().toISOString(),
    });
    setShowAddModal(false);
    setNewAgent({ name: "", phone: "", pin: "", assignedArea: "All" });
  };

  const deleteAgent = async (id) => {
    if (!user) return;
    if (confirm("Delete this agent?")) await deleteDoc(doc(db, "artifacts", appId, "users", user.uid, "agents", id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="disp font-bold text-base" style={{ color: C.text }}>
          {t.team}
        </h3>
        <button
          onClick={() => setShowAddModal(true)}
          disabled={!canAddAgent}
          style={{ background: canAddAgent ? C.emerald : C.textFaint }}
          className="flex items-center gap-1.5 text-xs font-semibold text-white px-4 py-2.5 rounded-xl shadow-sm hover:opacity-90 disabled:cursor-not-allowed"
        >
          <Plus size={14} /> {t.addAgent}
        </button>
      </div>

      {!canAddAgent && (
        <div style={{ color: C.amber }} className="text-xs font-bold bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
          Plan limit reached ({agents.length}/{currentLimit} agents). Please upgrade to add more agents.
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((a) => (
          <div key={a.id} style={{ background: C.card, border: `1px solid ${C.border}` }} className="rounded-2xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div style={{ background: C.emeraldSoft, color: C.emeraldDeep }} className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg">
                {a.name[0]}
              </div>
              <div>
                <div className="text-sm font-bold" style={{ color: C.text }}>
                  {a.name}
                </div>
                <div style={{ color: C.textFaint }} className="text-xs flex items-center gap-1 mt-0.5">
                  <Phone size={11} /> +91 {a.phone}
                </div>
                <div style={{ color: C.emerald }} className="text-[10px] font-bold mt-1 bg-emerald-50 inline-block px-1.5 py-0.5 rounded uppercase">
                  {a.assignedArea}
                </div>
              </div>
            </div>
            <button onClick={() => deleteAgent(a.id)} style={{ color: C.crimson }} className="p-2 bg-red-50 rounded-xl hover:bg-red-100 transition-colors">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        {agents.length === 0 && (
          <div className="col-span-full p-6 text-center text-sm font-medium" style={{ color: C.textMute }}>
            No agents added.
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-30 flex items-center justify-center px-4" style={{ background: "rgba(15,23,42,0.6)", backdropFilter: "blur(2px)" }}>
          <div style={{ background: C.card }} className="w-full max-w-sm rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="disp font-bold text-lg" style={{ color: C.text }}>
                {t.addAgent}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-slate-100 rounded-full">
                <X size={20} color={C.textMute} />
              </button>
            </div>

            <label style={{ color: C.textMute }} className="text-xs font-semibold block mb-1.5">
              {t.name}
            </label>
            <input
              value={newAgent.name}
              onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
              placeholder="E.g., Ramesh"
              className="w-full border rounded-xl px-3 py-2.5 mb-4 text-sm outline-none bg-slate-50"
              style={{ borderColor: C.border, color: C.text }}
            />

            <label style={{ color: C.textMute }} className="text-xs font-semibold block mb-1.5">
              {t.mobile}
            </label>
            <input
              value={newAgent.phone}
              onChange={(e) => setNewAgent({ ...newAgent, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
              placeholder="98765 43210"
              className="w-full border rounded-xl px-3 py-2.5 mb-4 text-sm outline-none bg-slate-50"
              style={{ borderColor: C.border, color: C.text }}
            />

            <label style={{ color: C.textMute }} className="text-xs font-semibold block mb-1.5">
              {t.assignedArea}
            </label>
            <select
              value={newAgent.assignedArea}
              onChange={(e) => setNewAgent({ ...newAgent, assignedArea: e.target.value })}
              className="w-full border rounded-xl px-3 py-2.5 mb-4 text-sm outline-none bg-slate-50"
              style={{ borderColor: C.border }}
            >
              <option value="All">{t.all} Areas</option>
              {AREAS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>

            <label style={{ color: C.textMute }} className="text-xs font-semibold block mb-1.5">
              {t.agentPin} (4 Digits)
            </label>
            <input
              type="password"
              value={newAgent.pin}
              onChange={(e) => setNewAgent({ ...newAgent, pin: e.target.value.replace(/\D/g, "").slice(0, 4) })}
              placeholder="1234"
              className="w-full border rounded-xl px-3 py-2.5 mb-6 text-sm outline-none bg-slate-50"
              style={{ borderColor: C.border, color: C.text }}
            />

            <button
              onClick={handleAdd}
              disabled={!newAgent.name || newAgent.phone.length < 10 || newAgent.pin.length < 4}
              style={{ background: !newAgent.name || newAgent.phone.length < 10 || newAgent.pin.length < 4 ? C.textFaint : C.emerald }}
              className="w-full text-white text-sm font-bold py-3 rounded-xl transition-colors shadow-md"
            >
              {t.save}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
