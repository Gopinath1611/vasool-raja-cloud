import React, { useState } from "react";
import { Search, Download, Plus, Phone, MapPin, Pencil, Trash2, Bell } from "lucide-react";
import { db, appId, doc, deleteDoc } from "../firebase";
import { C } from "../constants/colors";
import { statusCfg, PLAN_LIMITS } from "../constants/app";
import { exportToCSV } from "../utils/csvExport";
import AddEditCustomerModal from "./AddEditCustomerModal";

export default function CustomerDirectory({ user, profile, customers, t, lang }) {
  const [query, setQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.area.toLowerCase().includes(query.toLowerCase()) ||
      c.stbId.toLowerCase().includes(query.toLowerCase())
  );

  const openAdd = () => {
    setEditingCustomer(null);
    setShowModal(true);
  };
  const openEdit = (c) => {
    setEditingCustomer(c);
    setShowModal(true);
  };

  const deleteCustomer = async (id) => {
    if (!user) return;
    if (confirm("Are you sure you want to delete this customer?")) {
      await deleteDoc(doc(db, "artifacts", appId, "users", user.uid, "customers", id));
    }
  };

  const sendReminder = (c) => {
    const isTa = lang === "ta";
    const brandName = profile?.plan === "Pro" && profile?.businessName ? profile.businessName : "Vasool Raja";
    const text = isTa
      ? `வணக்கம் ${c.name}, உங்கள் மாத கட்டணம் ₹${c.amount} நிலுவையில் உள்ளது. தயவுசெய்து விரைவில் செலுத்தவும். நன்றி - ${brandName}.`
      : `Hello ${c.name}, your monthly bill of ₹${c.amount} is due. Please clear it at the earliest. Thank you - ${brandName}.`;
    window.open(`https://wa.me/91${c.phone}?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleExportCSV = () => {
    const data = filtered.map((c) => ({
      "Customer Name": c.name,
      Mobile: c.phone,
      "STB ID": c.stbId,
      Area: c.area,
      Package: c.package,
      "Amount (Rs)": c.amount,
      "Bill Day": c.billDay,
      Status: c.status,
    }));
    exportToCSV(`Customers_${new Date().toISOString().split("T")[0]}.csv`, data);
  };

  const currentPlanLimit = PLAN_LIMITS[profile?.plan || "Trial"];
  const canAddMore = customers.length < currentPlanLimit;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div style={{ background: C.card, border: `1px solid ${C.border}` }} className="flex items-center gap-2 rounded-xl px-3 py-2.5 flex-1 max-w-md shadow-sm">
          <Search size={16} color={C.textFaint} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.search}
            style={{ color: C.text }}
            className="outline-none text-sm w-full bg-transparent"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            style={{ border: `1px solid ${C.border}`, color: C.textMute }}
            className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2.5 rounded-xl shadow-sm hover:bg-slate-50 transition-colors bg-white"
          >
            <Download size={14} /> Export CSV
          </button>
          <button
            onClick={openAdd}
            disabled={!canAddMore}
            style={{ background: canAddMore ? C.emerald : C.textFaint }}
            className="flex items-center gap-1.5 text-xs font-semibold text-white px-4 py-2.5 rounded-xl shadow-sm hover:opacity-90 transition-opacity disabled:cursor-not-allowed"
          >
            <Plus size={14} /> {t.addCustomer}
          </button>
        </div>
      </div>

      {!canAddMore && (
        <div style={{ color: C.amber }} className="text-xs font-bold bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
          Plan limit reached ({customers.length}/{currentPlanLimit}). Please upgrade your plan to add more customers.
        </div>
      )}

      <div style={{ background: C.card, border: `1px solid ${C.border}` }} className="rounded-2xl overflow-hidden shadow-sm">
        <div
          style={{ borderBottom: `1px solid ${C.border}`, color: C.textFaint }}
          className="hidden md:grid grid-cols-12 gap-2 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider bg-slate-50"
        >
          <div className="col-span-3">Customer</div>
          <div className="col-span-2">{t.stb}</div>
          <div className="col-span-2">{t.area}</div>
          <div className="col-span-2">
            {t.pkg} / {t.billDay}
          </div>
          <div className="col-span-1">{t.amt}</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>
        {filtered.map((c) => {
          const cfg = statusCfg[c.status] || statusCfg.due;
          const Icon = cfg.icon;
          return (
            <div
              key={c.id}
              style={{ borderBottom: `1px solid ${C.border}` }}
              className="grid grid-cols-2 md:grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-slate-50/50 transition-colors"
            >
              <div className="col-span-2 md:col-span-3">
                <div className="text-sm font-semibold" style={{ color: C.text }}>
                  {c.name}
                </div>
                <div style={{ color: C.textFaint }} className="text-xs flex items-center gap-1">
                  <Phone size={10} /> {c.phone}
                </div>
              </div>
              <div className="text-xs md:col-span-2 mono" style={{ color: C.textMute }}>
                {c.stbId}
              </div>
              <div className="text-xs md:col-span-2 flex items-center gap-1" style={{ color: C.textMute }}>
                <MapPin size={11} />
                {c.area}
              </div>
              <div className="text-xs md:col-span-2 font-medium" style={{ color: C.textMute }}>
                {c.package} <br />
                <span className="text-[10px]">Day {c.billDay}</span>
              </div>
              <div className="text-sm font-bold mono md:col-span-1" style={{ color: C.text }}>
                ₹{c.amount}
              </div>
              <div className="flex items-center justify-between md:justify-end gap-1.5 col-span-2 md:col-span-2">
                <span style={{ background: cfg.soft, color: cfg.color }} className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md tracking-wide">
                  <Icon size={10} /> {t[c.status]}
                </span>
                {c.status !== "paid" && (
                  <button onClick={() => sendReminder(c)} style={{ color: C.emeraldDeep, background: C.emeraldSoft }} className="p-1.5 rounded-lg transition-colors" title={t.remind}>
                    <Bell size={14} />
                  </button>
                )}
                <button onClick={() => openEdit(c)} style={{ color: C.textMute }} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors" title={t.edit}>
                  <Pencil size={14} />
                </button>
                <button onClick={() => deleteCustomer(c.id)} style={{ color: C.crimson }} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors" title={t.delete}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="p-8 text-center text-sm font-medium" style={{ color: C.textMute }}>
            No customers found.
          </div>
        )}
      </div>

      {showModal && <AddEditCustomerModal user={user} customer={editingCustomer} onClose={() => setShowModal(false)} t={t} />}
    </div>
  );
}
