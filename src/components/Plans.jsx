import React, { useState } from "react";
import { CheckCircle2, ChevronRight } from "lucide-react";
import { db, appId, doc, updateDoc } from "../firebase";
import { C } from "../constants/colors";
import SubscriptionPaymentModal from "./SubscriptionPaymentModal";

export default function Plans({ user, profile, t }) {
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState(null);
  const [businessName, setBusinessName] = useState(profile?.businessName || "");
  const [savingName, setSavingName] = useState(false);

  const activePlan = profile?.plan || "Trial";
  const isPro = activePlan === "Pro";

  const handleSaveName = async () => {
    if (!user) return;
    setSavingName(true);
    await updateDoc(doc(db, "artifacts", appId, "users", user.uid, "settings", "profile"), {
      businessName,
    });
    setSavingName(false);
  };

  const plans = [
    { name: "Starter", price: 499, limit: "Up to 200 customers", features: ["WhatsApp reminders", "1 field agent login", "Basic reports"] },
    {
      name: "Growth",
      price: 999,
      limit: "Up to 1,000 customers",
      features: ["Everything in Starter", "Up to 5 agent logins", "UPI QR auto-generation", "Excel/CSV export"],
      popular: true,
    },
    { name: "Pro", price: 1999, limit: "Unlimited customers", features: ["Everything in Growth", "Unlimited agents", "Custom WhatsApp branding", "Priority support"] },
  ];

  return (
    <div className="space-y-5">
      <div style={{ background: C.emeraldSoft, border: `1px solid ${C.emeraldLine}` }} className="rounded-2xl p-5 flex items-center justify-between flex-wrap gap-3 shadow-sm">
        <div>
          <div style={{ color: C.emeraldDeep }} className="text-[11px] font-bold uppercase tracking-widest mb-1">
            Current plan
          </div>
          <div className="disp font-extrabold text-lg" style={{ color: C.text }}>
            {activePlan}
            {activePlan === "Trial" && profile?.trialEnds && ` · Ends ${new Date(profile.trialEnds).toLocaleDateString()}`}
            {activePlan !== "Trial" && profile?.upgradedAt &&
              ` · Renews ${new Date(new Date(profile.upgradedAt).setFullYear(new Date(profile.upgradedAt).getFullYear() + 1)).toLocaleDateString()}`}
          </div>
        </div>
      </div>

      {isPro && (
        <div style={{ background: C.card, border: `1px solid ${C.border}` }} className="rounded-2xl p-5 shadow-sm">
          <h4 className="disp font-bold text-sm mb-2" style={{ color: C.text }}>
            Custom WhatsApp Branding (Pro Feature)
          </h4>
          <p className="text-xs mb-3" style={{ color: C.textMute }}>
            Enter your business name to replace "Vasool Raja" in all outgoing WhatsApp receipts and reminders.
          </p>
          <div className="flex gap-2 max-w-md">
            <input
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. Murugan Cable Vision"
              style={{ border: `1px solid ${C.border}`, color: C.text }}
              className="w-full rounded-xl px-3 py-2 text-sm outline-none"
            />
            <button
              onClick={handleSaveName}
              disabled={savingName || !businessName}
              style={{ background: C.emerald }}
              className="text-white text-xs font-bold px-4 py-2 rounded-xl disabled:opacity-60 whitespace-nowrap shadow-sm"
            >
              {savingName ? "..." : "Save Brand"}
            </button>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-5">
        {plans.map((p) => {
          const isActive = p.name === activePlan;
          return (
            <div
              key={p.name}
              style={{ background: C.card, border: isActive ? `2px solid ${C.emerald}` : `1px solid ${C.border}` }}
              className={`rounded-2xl p-6 relative shadow-sm transition-all duration-300 ${isActive ? "shadow-md scale-[1.02]" : "hover:shadow-md hover:border-slate-300"}`}
            >
              {p.popular && (
                <span style={{ background: C.emerald }} className="absolute -top-3 left-6 text-white text-[10px] font-extrabold tracking-widest px-3 py-1.5 rounded-full shadow-sm">
                  MOST PICKED
                </span>
              )}
              <div className="disp font-extrabold text-xl mb-1.5" style={{ color: C.text }}>
                {p.name}
              </div>
              <div style={{ color: C.textMute }} className="text-xs font-medium mb-4">
                {p.limit}
              </div>
              <div className="mb-5 pb-5 border-b border-slate-100">
                <span className="mono text-3xl font-black tracking-tight" style={{ color: C.text }}>
                  ₹{p.price}
                </span>
                <span style={{ color: C.textFaint }} className="text-sm font-bold">
                  /mo
                </span>
              </div>
              <div className="space-y-3.5 mb-8">
                {p.features.map((f) => (
                  <div key={f} className="flex items-center gap-2.5 text-sm font-medium" style={{ color: C.text }}>
                    <CheckCircle2 size={16} color={isActive ? C.emerald : C.textFaint} className="shrink-0 transition-colors" /> {f}
                  </div>
                ))}
              </div>
              <button
                onClick={() => !isActive && setSelectedPlanForPayment(p)}
                disabled={isActive}
                style={{ background: isActive ? C.emerald : C.slateBg, color: isActive ? "white" : C.text, border: isActive ? "none" : `1px solid ${C.border}` }}
                className="w-full text-sm font-bold py-3.5 rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all disabled:cursor-default hover:opacity-90"
              >
                {isActive ? "Active Plan" : "Select Plan"} {!isActive && <ChevronRight size={16} />}
              </button>
            </div>
          );
        })}
      </div>

      {selectedPlanForPayment && (
        <SubscriptionPaymentModal user={user} plan={selectedPlanForPayment} onClose={() => setSelectedPlanForPayment(null)} onSuccess={() => {}} />
      )}
    </div>
  );
}
