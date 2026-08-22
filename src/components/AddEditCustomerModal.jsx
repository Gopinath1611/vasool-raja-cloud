import React, { useState } from "react";
import { X } from "lucide-react";
import { db, appId, doc, addDoc, collection, updateDoc } from "../firebase";
import { C } from "../constants/colors";
import { AREAS, PACKAGES } from "../constants/app";

export default function AddEditCustomerModal({ user, customer, onClose, t }) {
  const isEdit = !!customer;
  const [form, setForm] = useState(
    customer || {
      name: "",
      phone: "",
      stbId: "",
      area: AREAS[0],
      package: PACKAGES[0],
      amount: "",
      billDay: 1,
      lastPaidMonth: "",
    }
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!user || !form.name || !form.phone || !form.amount) return;
    setLoading(true);
    try {
      const payload = {
        ...form,
        amount: Number(form.amount),
        billDay: Number(form.billDay),
      };

      if (isEdit) {
        await updateDoc(doc(db, "artifacts", appId, "users", user.uid, "customers", customer.id), payload);
      } else {
        payload.createdAt = new Date().toISOString();
        await addDoc(collection(db, "artifacts", appId, "users", user.uid, "customers"), payload);
      }
      onClose();
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center px-4"
      style={{ background: "rgba(15,23,42,0.6)", backdropFilter: "blur(2px)" }}
    >
      <div style={{ background: C.card }} className="w-full max-w-md rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="disp font-bold text-lg" style={{ color: C.text }}>
            {isEdit ? t.edit : t.addCustomer}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full">
            <X size={20} color={C.textMute} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="col-span-2">
            <label className="text-xs font-semibold block mb-1.5" style={{ color: C.textMute }}>
              {t.name}
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border rounded-xl px-3 py-2 text-sm outline-none"
              style={{ borderColor: C.border }}
              placeholder="E.g., Murugesan"
            />
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1.5" style={{ color: C.textMute }}>
              {t.mobile}
            </label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
              className="w-full border rounded-xl px-3 py-2 text-sm outline-none"
              style={{ borderColor: C.border }}
              placeholder="99440..."
            />
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1.5" style={{ color: C.textMute }}>
              {t.stb}
            </label>
            <input
              value={form.stbId}
              onChange={(e) => setForm({ ...form, stbId: e.target.value })}
              className="w-full border rounded-xl px-3 py-2 text-sm outline-none"
              style={{ borderColor: C.border }}
              placeholder="STB1023"
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="text-xs font-semibold block mb-1.5" style={{ color: C.textMute }}>
              {t.area}
            </label>
            <select
              value={form.area}
              onChange={(e) => setForm({ ...form, area: e.target.value })}
              className="w-full border rounded-xl px-3 py-2 text-sm outline-none bg-white"
              style={{ borderColor: C.border }}
            >
              {AREAS.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="text-xs font-semibold block mb-1.5" style={{ color: C.textMute }}>
              {t.pkg}
            </label>
            <select
              value={form.package}
              onChange={(e) => setForm({ ...form, package: e.target.value })}
              className="w-full border rounded-xl px-3 py-2 text-sm outline-none bg-white"
              style={{ borderColor: C.border }}
            >
              {PACKAGES.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1.5" style={{ color: C.textMute }}>
              {t.amt}
            </label>
            <input
              type="number"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="w-full border rounded-xl px-3 py-2 text-sm outline-none mono font-bold"
              style={{ borderColor: C.border }}
              placeholder="250"
            />
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1.5" style={{ color: C.textMute }}>
              {t.billDay}
            </label>
            <select
              value={form.billDay}
              onChange={(e) => setForm({ ...form, billDay: e.target.value })}
              className="w-full border rounded-xl px-3 py-2 text-sm outline-none bg-white mono"
              style={{ borderColor: C.border }}
            >
              {[1, 5, 10, 15, 20].map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || !form.name || !form.phone || !form.amount}
          style={{ background: C.emerald }}
          className="w-full text-white font-bold py-3 rounded-xl shadow-md disabled:opacity-50 mt-2"
        >
          {loading ? "..." : t.save}
        </button>
      </div>
    </div>
  );
}
