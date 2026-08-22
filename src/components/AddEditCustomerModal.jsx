import React, { useState } from "react";
import { X } from "lucide-react";
import { db, appId, doc, addDoc, collection, updateDoc } from "../firebase";
import { C } from "../constants/colors";
import { PACKAGES } from "../constants/app";
import { tnDistricts } from "../constants/tnLocations";

export default function AddEditCustomerModal({ user, customer, onClose, t }) {
  const isEdit = !!customer;
  const [form, setForm] = useState(
    customer
      ? {
          ...customer,
          district: customer.district || "",
          taluk: customer.taluk || "",
          address: customer.address || customer.area || "",
        }
      : {
          name: "",
          phone: "",
          stbId: "",
          district: "",
          taluk: "",
          address: "",
          package: PACKAGES[0],
          amount: "",
          billDay: 1,
          lastPaidMonth: "",
        }
  );
  const [loading, setLoading] = useState(false);

  // மாவட்டம் மாறும்போது அதற்குரிய தாலுகாக்களை வடிகட்டுவது
  const availableTaluks = form.district ? tnDistricts[form.district] || [] : [];

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
      <div style={{ background: C.card }} className="w-full max-w-md rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
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

          {/* 1. மாவட்டம் (District) Dropdown */}
          <div>
            <label className="text-xs font-semibold block mb-1.5" style={{ color: C.textMute }}>
              மாவட்டம் (District)
            </label>
            <select
              value={form.district}
              onChange={(e) => setForm({ ...form, district: e.target.value, taluk: "" })}
              className="w-full border rounded-xl px-3 py-2 text-sm outline-none bg-white"
              style={{ borderColor: C.border }}
            >
              <option value="">மாவட்டம் தேர்ந்தெடுக்கவும்</option>
              {Object.keys(tnDistricts).map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* 2. தாலுகா (Taluk) Dropdown */}
          <div>
            <label className="text-xs font-semibold block mb-1.5" style={{ color: C.textMute }}>
              தாலுகா (Taluk)
            </label>
            <select
              value={form.taluk}
              onChange={(e) => setForm({ ...form, taluk: e.target.value })}
              disabled={!form.district}
              className="w-full border rounded-xl px-3 py-2 text-sm outline-none bg-white disabled:bg-slate-100"
              style={{ borderColor: C.border }}
            >
              <option value="">தாலுகா தேர்ந்தெடுக்கவும்</option>
              {availableTaluks.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* 3. கிராமம் / தெரு பெயர் (Village / Street) */}
          <div className="col-span-2">
            <label className="text-xs font-semibold block mb-1.5" style={{ color: C.textMute }}>
              கிராமம் / தெரு பெயர் (Village / Street)
            </label>
            <input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full border rounded-xl px-3 py-2 text-sm outline-none"
              style={{ borderColor: C.border }}
              placeholder="உதாரணம்: வாலப்பம்பட்டி / மெயின் ரோடு"
            />
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
          <div className="col-span-2">
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
          className="w-full text-white font-bold py-3 rounded-xl shadow-md disabled:opacity-50 mt-2 cursor-pointer"
        >
          {loading ? "..." : t.save}
        </button>
      </div>
    </div>
  );
}
