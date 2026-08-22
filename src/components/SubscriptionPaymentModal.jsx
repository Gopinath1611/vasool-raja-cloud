import React, { useState } from "react";
import { X, ShieldCheck, Smartphone, CheckCircle2 } from "lucide-react";
import { db, appId, doc, updateDoc } from "../firebase";
import { C } from "../constants/colors";
import { MERCHANT_UPI } from "../constants/app";

export default function SubscriptionPaymentModal({ user, plan, onClose, onSuccess }) {
  const [mode, setMode] = useState("gpay");
  const [utr, setUtr] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const upiQuery = `pa=${MERCHANT_UPI}&pn=VasoolRaja&am=${plan.price}&cu=INR&tn=${plan.name}_Plan`;

  const intents = {
    gpay: `tez://upi/pay?${upiQuery}`,
    phonepe: `phonepe://pay?${upiQuery}`,
    upi: `upi://pay?${upiQuery}`,
  };

  const verifyPayment = async () => {
    setError("");
    if (utr.length !== 12) {
      setError("Please enter a valid 12-digit UTR/Reference number from your payment app.");
      return;
    }
    setLoading(true);
    try {
      // Write the new subscription plan to Firestore
      await updateDoc(doc(db, "artifacts", appId, "users", user.uid, "settings", "profile"), {
        plan: plan.name,
        upgradedAt: new Date().toISOString(),
        paymentRef: utr,
      });
      setSent(true);
    } catch (e) {
      console.error(e);
      setError("Failed to upgrade plan. Please contact support.");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-30 flex items-end sm:items-center justify-center" style={{ background: "rgba(15,23,42,0.7)", backdropFilter: "blur(4px)" }}>
      <div style={{ background: C.card }} className="w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
        {!sent ? (
          <>
            <div className="flex items-center justify-between mb-5">
              <h3 className="disp font-bold text-lg" style={{ color: C.text }}>
                Upgrade Plan
              </h3>
              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-100">
                <X size={18} color={C.textMute} />
              </button>
            </div>

            <div style={{ background: C.slateBg, border: `1px solid ${C.border}` }} className="rounded-xl p-4 mb-5 shadow-sm text-center">
              <div style={{ color: C.textMute }} className="text-xs font-bold uppercase tracking-widest mb-1">
                {plan.name} Plan
              </div>
              <div className="mono text-3xl font-extrabold" style={{ color: C.emeraldDeep }}>
                ₹{plan.price}
              </div>
              <div style={{ color: C.textFaint }} className="text-[10px] mt-1">
                Billed Annually / Monthly
              </div>
            </div>

            <label style={{ color: C.textMute }} className="text-xs font-bold tracking-wide uppercase block mb-2">
              Select Payment App
            </label>
            <div className="grid grid-cols-3 gap-2 mb-5">
              {[
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

            <div className="flex flex-col items-center mb-6 p-5" style={{ background: C.emeraldSoft, borderRadius: 16, border: `1px dashed ${C.emeraldLine}` }}>
              <div className="text-center mb-3">
                <div className="flex items-center justify-center gap-1.5 text-xs font-extrabold mb-1 tracking-wide" style={{ color: C.emeraldDeep }}>
                  <ShieldCheck size={14} /> SECURE UPI PAYMENT
                </div>
                <p style={{ color: C.emerald }} className="text-[10px] font-bold uppercase tracking-wider break-all">
                  To: srigopi***@okhdfcbank
                </p>
              </div>

              <a
                href={intents[mode]}
                target="_blank"
                rel="noreferrer"
                style={{ background: "white", color: C.emeraldDeep, border: `2px solid ${C.emerald}` }}
                className="w-full text-center py-3 rounded-xl text-xs font-extrabold shadow-sm flex items-center justify-center gap-1.5 hover:bg-emerald-50 transition-colors uppercase tracking-wide"
              >
                <Smartphone size={15} /> Open {mode === "gpay" ? "Google Pay" : mode === "phonepe" ? "PhonePe" : "UPI App"}
              </a>
              <div className="text-[10px] text-center mt-3" style={{ color: C.textMute }}>
                If you are on desktop, scan the QR code from your phone's UPI app.
              </div>
            </div>

            <div className="mb-6">
              <label style={{ color: C.textMute }} className="text-xs font-bold tracking-wide uppercase block mb-1.5">
                Enter 12-digit UTR / Reference No.
              </label>
              <input
                type="number"
                value={utr}
                onChange={(e) => setUtr(e.target.value.replace(/\D/g, "").slice(0, 12))}
                placeholder="e.g., 312345678901"
                style={{ border: `1px solid ${error ? C.crimson : C.border}`, color: C.text, background: C.slateBg }}
                className="w-full rounded-xl px-4 py-3 outline-none text-sm font-bold tracking-widest mono"
              />
              {error && (
                <div style={{ color: C.crimson }} className="text-[10px] font-bold mt-1.5">
                  {error}
                </div>
              )}
            </div>

            <button
              onClick={verifyPayment}
              disabled={loading || utr.length < 12}
              style={{ background: loading || utr.length < 12 ? C.textFaint : C.emerald }}
              className="w-full text-white text-sm font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-md transition-shadow"
            >
              {loading ? "Verifying..." : "Verify Payment"}
            </button>
          </>
        ) : (
          <div className="text-center py-8">
            <div style={{ background: C.emeraldSoft }} className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
              <CheckCircle2 size={40} color={C.emerald} />
            </div>
            <h3 className="disp font-extrabold text-2xl mb-1" style={{ color: C.text }}>
              Payment Successful!
            </h3>
            <p style={{ color: C.textMute }} className="text-xs font-bold tracking-widest uppercase mb-6">
              Plan upgraded to {plan.name}
            </p>

            <button
              onClick={() => {
                onSuccess(plan.name);
                onClose();
              }}
              style={{ background: C.emerald }}
              className="w-full text-white text-sm font-bold py-3.5 rounded-xl shadow-md hover:opacity-90 transition-shadow"
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
