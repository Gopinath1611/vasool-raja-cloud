import React, { useState } from "react";
import { X, QrCode, Smartphone, CheckCircle2, Send } from "lucide-react";
import { db, appId, doc, addDoc, collection, updateDoc } from "../firebase";
import { C } from "../constants/colors";
import { MERCHANT_UPI } from "../constants/app";

export default function CollectModal({ user, session, customer, onClose, lang, profile }) {
  const [amount, setAmount] = useState(customer.amount);
  const [mode, setMode] = useState("cash");
  const [utr, setUtr] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const upiQuery = `pa=${MERCHANT_UPI}&pn=VasoolRaja&am=${amount}&cu=INR&tn=STB-${customer.stbId}`;
  const intents = {
    gpay: `tez://upi/pay?${upiQuery}`,
    phonepe: `phonepe://pay?${upiQuery}`,
    upi: `upi://pay?${upiQuery}`,
  };

  const submit = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const today = new Date();
      const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;

      const txRef = await addDoc(collection(db, "artifacts", appId, "users", user.uid, "transactions"), {
        customerId: customer.id,
        customerName: customer.name,
        amount: Number(amount),
        mode,
        utr: mode !== "cash" ? utr : null,
        agentId: session.agentId || "admin",
        agentName: session.agentName || "Owner",
        date: today.toISOString(),
      });

      // Update customer status by recording the month it was paid for
      await updateDoc(doc(db, "artifacts", appId, "users", user.uid, "customers", customer.id), {
        lastPaidMonth: currentMonth,
      });

      setSent(txRef.id);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const sendWhatsApp = () => {
    const isTa = lang === "ta";
    const brandName = profile?.plan === "Pro" && profile?.businessName ? profile.businessName : "Vasool Raja";
    const text = isTa
      ? `வணக்கம் ${customer.name}, உங்கள் கட்டணம் ₹${amount} (${mode === "cash" ? "Cash" : "Digital"}) பெறப்பட்டது. Receipt No: #VR${sent.slice(-4).toUpperCase()}. நன்றி - ${brandName}.`
      : `Hello ${customer.name}, your payment of ₹${amount} (${mode === "cash" ? "Cash" : "Digital"}) is received. Receipt No: #VR${sent.slice(-4).toUpperCase()}. Thank you - ${brandName}.`;
    window.open(`https://wa.me/91${customer.phone}?text=${encodeURIComponent(text)}`, "_blank");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-30 flex items-end sm:items-center justify-center" style={{ background: "rgba(15,23,42,0.7)", backdropFilter: "blur(4px)" }}>
      <div style={{ background: C.card }} className="w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
        {!sent ? (
          <>
            <div className="flex items-center justify-between mb-5">
              <h3 className="disp font-bold text-lg" style={{ color: C.text }}>
                Collect payment
              </h3>
              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-100">
                <X size={18} color={C.textMute} />
              </button>
            </div>

            <div style={{ background: C.slateBg, border: `1px solid ${C.border}` }} className="rounded-xl p-4 mb-5 shadow-sm">
              <div className="text-sm font-bold" style={{ color: C.text }}>
                {customer.name}
              </div>
              <div style={{ color: C.textFaint }} className="text-xs font-medium mt-1">
                {customer.area} · {customer.package}
              </div>
            </div>

            <label style={{ color: C.textMute }} className="text-xs font-bold tracking-wide uppercase block mb-1.5">
              Amount (₹)
            </label>
            <div style={{ border: `2px solid ${C.emerald}` }} className="flex items-center rounded-xl px-3 py-3 mb-5 shadow-sm bg-emerald-50/30">
              <span className="mono text-lg font-bold mr-2" style={{ color: C.emeraldDeep }}>
                ₹
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{ color: C.emeraldDeep }}
                className="outline-none text-xl w-full mono font-extrabold bg-transparent"
              />
            </div>

            <label style={{ color: C.textMute }} className="text-xs font-bold tracking-wide uppercase block mb-2">
              Payment mode
            </label>
            <div className="grid grid-cols-2 gap-2 mb-5">
              {[
                { id: "cash", label: "Cash" },
                { id: "gpay", label: "GPay" },
                { id: "phonepe", label: "PhonePe" },
                { id: "upi", label: "Other UPI" },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  style={{
                    background: mode === m.id ? C.emerald : C.slateBg,
                    color: mode === m.id ? "white" : C.textMute,
                    border: mode === m.id ? `1px solid ${C.emeraldDeep}` : `1px solid ${C.border}`,
                  }}
                  className="py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm tracking-wide"
                >
                  {m.label}
                </button>
              ))}
            </div>

            {mode !== "cash" && (
              <div className="flex flex-col items-center mb-6 p-5" style={{ background: C.emeraldSoft, borderRadius: 16, border: `1px dashed ${C.emeraldLine}` }}>
                <div className="bg-white p-2 rounded-xl shadow-sm mb-3">
                  <img
                    alt="UPI QR code"
                    width={140}
                    height={140}
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(`upi://pay?${upiQuery}`)}`}
                    className="rounded-lg"
                  />
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1.5 text-xs font-extrabold mb-1 tracking-wide" style={{ color: C.emeraldDeep }}>
                    <QrCode size={14} /> PAYING TO: srigopi***@okhdfcbank
                  </div>
                </div>

                <a
                  href={intents[mode]}
                  style={{ background: "white", color: C.emeraldDeep, border: `2px solid ${C.emerald}` }}
                  className="mt-4 w-full text-center py-3 rounded-xl text-xs font-extrabold shadow-sm flex items-center justify-center gap-1.5 hover:bg-emerald-50 transition-colors uppercase tracking-wide"
                >
                  <Smartphone size={15} /> Open {mode === "gpay" ? "GPay" : mode === "phonepe" ? "PhonePe" : "App"}
                </a>
              </div>
            )}

            {mode !== "cash" && (
              <div className="mb-5">
                <label style={{ color: C.textMute }} className="text-xs font-bold tracking-wide uppercase block mb-1.5">
                  UTR / Reference No. (Optional)
                </label>
                <input
                  type="number"
                  value={utr}
                  onChange={(e) => setUtr(e.target.value.replace(/\D/g, "").slice(0, 12))}
                  placeholder="12-digit UPI Ref No"
                  style={{ border: `1px solid ${C.border}`, color: C.text, background: C.slateBg }}
                  className="w-full rounded-xl px-3 py-2.5 outline-none text-sm font-bold tracking-widest mono"
                />
              </div>
            )}

            <button
              onClick={submit}
              disabled={loading}
              style={{ background: C.emerald }}
              className="w-full text-white text-sm font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-md hover:opacity-90 transition-shadow disabled:opacity-60"
            >
              <CheckCircle2 size={18} /> {loading ? "Saving..." : "Record Payment"}
            </button>
          </>
        ) : (
          <div className="text-center py-8">
            <div style={{ background: C.emeraldSoft }} className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
              <CheckCircle2 size={40} color={C.emerald} />
            </div>
            <h3 className="disp font-extrabold text-2xl mb-1" style={{ color: C.text }}>
              Success!
            </h3>
            <p style={{ color: C.textMute }} className="text-xs font-bold tracking-widest uppercase mb-6">
              Receipt: #VR{sent.slice(-4).toUpperCase()}
            </p>

            <button
              onClick={sendWhatsApp}
              style={{ background: "#25D366" }}
              className="w-full text-white text-sm font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-md hover:opacity-90 transition-shadow mb-3"
            >
              <Send size={16} /> Send WhatsApp Receipt
            </button>
            <button onClick={onClose} style={{ color: C.textMute, background: C.slateBg }} className="w-full text-sm font-bold py-3.5 rounded-xl transition-colors">
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
