import React, { useState } from "react";
import { Globe, Wallet, Shield, UserPlus, Phone, ShieldCheck, Key } from "lucide-react";
import { auth, RecaptchaVerifier, signInWithPhoneNumber } from "../firebase";
import { C } from "../constants/colors";
import GlobalFonts from "./GlobalFonts";

export default function Login({ onLogin, lang, setLang, t, agents }) {
  const [role, setRole] = useState("admin");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [confResult, setConfResult] = useState(null);

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
      });
    }
  };

  const handleAdminSendOtp = async () => {
    setError("");
    setLoading(true);
    try {
      setupRecaptcha();
      const formattedPhone = `+91${phone}`;
      const appVerifier = window.recaptchaVerifier;
      
      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfResult(confirmationResult);
      setOtpSent(true);
    } catch (err) {
      console.error(err);
      setError("SMS அனுப்புவதில் பிழை: " + (err.message || "Failed to send SMS"));
    }
    setLoading(false);
  };

  const handleAdminVerifyOtp = async () => {
    setError("");
    setLoading(true);
    try {
      if (!confResult) {
        throw new Error("Session expired. Please resend OTP.");
      }
      
      await confResult.confirm(otp);
      onLogin({ role: "admin" });
    } catch (err) {
      console.error(err);
      setError("தவறான OTP (Invalid OTP). மீண்டும் முயற்சிக்கவும்.");
    }
    setLoading(false);
  };

  const handleAgentLogin = () => {
    setError("");
    const agent = agents.find((a) => a.phone === phone && a.pin === pin);
    if (agent) {
      onLogin({
        role: "agent",
        agentId: agent.id,
        agentName: agent.name,
        assignedArea: agent.assignedArea || "All",
      });
    } else {
      setError("Invalid Agent Phone or PIN");
    }
  };

  const disabled =
    loading ||
    phone.length < 10 ||
    (role === "agent" && pin.length < 4) ||
    (role === "admin" && otpSent && otp.length < 6);

  return (
    <div style={{ background: C.slateBg, minHeight: "100vh" }} className="flex items-center justify-center p-4">
      <GlobalFonts />
      <div id="recaptcha-container"></div>
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <button
            onClick={() => setLang(lang === "en" ? "ta" : "en")}
            style={{ border: `1px solid ${C.border}`, color: C.textMute, background: C.card }}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full shadow-sm"
          >
            <Globe size={13} /> {lang === "en" ? "தமிழ்" : "English"}
          </button>
        </div>

        <div className="text-center mb-8">
          <div style={{ background: C.emerald }} className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Wallet size={26} color="white" />
          </div>
          <h1 className="disp text-2xl font-bold" style={{ color: C.text }}>
            Vasool Raja <span className="tamil" style={{ color: C.emerald }}>வசூல் ராஜா</span>
          </h1>
          <p style={{ color: C.emeraldDeep }} className="text-xs mt-1 font-semibold bg-emerald-100 inline-block px-2 py-0.5 rounded uppercase tracking-wide">
            Cloud Connected
          </p>
        </div>

        <div style={{ background: C.card, border: `1px solid ${C.border}` }} className="rounded-2xl p-5 shadow-sm">
          <div style={{ background: C.slateBg }} className="grid grid-cols-2 gap-1 rounded-xl p-1 mb-5">
            {["admin", "agent"].map((r) => (
              <button
                key={r}
                onClick={() => {
                  setRole(r);
                  setPhone("");
                  setPin("");
                  setError("");
                  setOtpSent(false);
                  setConfResult(null);
                }}
                style={{ background: role === r ? C.emerald : "transparent", color: role === r ? "white" : C.textMute }}
                className="py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                {r === "admin" ? (
                  <>
                    <Shield size={14} /> {lang === "en" ? "Owner" : "ஓனர்"}
                  </>
                ) : (
                  <>
                    <UserPlus size={14} /> {lang === "en" ? "Field Agent" : "ஏஜென்ட்"}
                  </>
                )}
              </button>
            ))}
          </div>

          <label style={{ color: C.textMute }} className="text-xs font-medium block mb-1">
            {t.mobile}
          </label>
          <div
            style={{ border: `1px solid ${error && !otpSent ? C.crimson : C.border}` }}
            className="flex items-center rounded-lg px-3 py-2.5 mb-3"
          >
            <Phone size={15} color={C.textFaint} />
            <input
              value={phone}
              disabled={otpSent}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="98765 43210"
              style={{ color: C.text }}
              className="outline-none text-sm w-full ml-2 bg-transparent disabled:opacity-60"
            />
          </div>

          {role === "admin" && otpSent && (
            <>
              <label style={{ color: C.textMute }} className="text-xs font-medium block mb-1">
                SMS OTP (Enter 6-digit code)
              </label>
              <div style={{ border: `1px solid ${error ? C.crimson : C.border}` }} className="flex items-center rounded-lg px-3 py-2.5 mb-3">
                <ShieldCheck size={15} color={C.textFaint} />
                <input
                  type="number"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="6-digit OTP"
                  style={{ color: C.text }}
                  className="outline-none text-sm w-full ml-2 bg-transparent"
                  autoFocus
                />
              </div>
            </>
          )}

          {role === "agent" && (
            <>
              <label style={{ color: C.textMute }} className="text-xs font-medium block mb-1">
                {t.agentPin}
              </label>
              <div style={{ border: `1px solid ${error ? C.crimson : C.border}` }} className="flex items-center rounded-lg px-3 py-2.5 mb-3">
                <Key size={15} color={C.textFaint} />
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="4-digit PIN"
                  style={{ color: C.text }}
                  className="outline-none text-sm w-full ml-2 bg-transparent"
                />
              </div>
            </>
          )}

          {error && (
            <p style={{ color: C.crimson }} className="text-xs font-medium mb-3 text-center">
              {error}
            </p>
          )}

          <button
            onClick={() => (role === "admin" ? (otpSent ? handleAdminVerifyOtp() : handleAdminSendOtp()) : handleAgentLogin())}
            disabled={disabled}
            style={{ background: disabled ? C.textFaint : C.emerald }}
            className="w-full text-white text-sm font-semibold py-2.5 rounded-lg transition-colors mt-2 shadow-sm flex items-center justify-center gap-2"
          >
            {loading ? "..." : role === "agent" ? t.verifyOtp : otpSent ? t.verifyOtp : t.sendOtp}
          </button>
        </div>
      </div>
    </div>
  );
}
