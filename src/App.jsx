import React, { useState, useEffect } from "react";
import {
  auth,
  db,
  appId,
  initialAuthToken,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged,
  enableIndexedDbPersistence,
  doc,
  setDoc,
  onSnapshot,
  collection,
} from "./firebase";
import { C } from "./constants/colors";
import { L } from "./constants/translations";
import { getCustomerStatus } from "./utils/customerStatus";
import Login from "./components/Login";
import AppShell from "./components/AppShell";

export default function App() {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null); // { role: 'admin' | 'agent', agentId?, agentName?, assignedArea? }
  const [lang, setLang] = useState("en");

  const [profile, setProfile] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [agents, setAgents] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const t = L[lang];

  useEffect(() => {
    // Enable Offline Persistence for unstable networks
    try {
      enableIndexedDbPersistence(db).catch((err) => {
        if (err.code === "failed-precondition") console.warn("Multiple tabs open, offline disabled in one.");
        else if (err.code === "unimplemented") console.warn("Browser doesn't support offline caching.");
      });
    } catch (e) {
      /* ignore in preview */
    }

    const initAuth = async () => {
      if (initialAuthToken) {
        await signInWithCustomToken(auth, initialAuthToken).catch(console.error);
      } else {
        await signInAnonymously(auth).catch(console.error);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    const unsubCustomers = onSnapshot(
      collection(db, "artifacts", appId, "users", user.uid, "customers"),
      (snap) => {
        setCustomers(
          snap.docs.map((d) => {
            const data = d.data();
            return { id: d.id, ...data, status: getCustomerStatus(data) };
          })
        );
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setLoading(false);
      }
    );

    const unsubAgents = onSnapshot(
      collection(db, "artifacts", appId, "users", user.uid, "agents"),
      (snap) => setAgents(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      console.error
    );

    const unsubTx = onSnapshot(
      collection(db, "artifacts", appId, "users", user.uid, "transactions"),
      (snap) => setTransactions(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      console.error
    );

    // Operator SaaS Profile
    const unsubProfile = onSnapshot(
      doc(db, "artifacts", appId, "users", user.uid, "settings", "profile"),
      (docSnap) => {
        if (docSnap.exists()) {
          setProfile(docSnap.data());
        } else {
          // Initialize Free Trial for new operators (14 days)
          const trialEnd = new Date();
          trialEnd.setDate(trialEnd.getDate() + 14);
          const newProfile = { plan: "Trial", status: "active", trialEnds: trialEnd.toISOString(), createdAt: new Date().toISOString() };
          setDoc(doc(db, "artifacts", appId, "users", user.uid, "settings", "profile"), newProfile);
          setProfile(newProfile);
        }
      },
      console.error
    );

    return () => {
      unsubCustomers();
      unsubAgents();
      unsubTx();
      unsubProfile();
    };
  }, [user]);

  if (loading || (user && !profile)) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!session) {
    return <Login onLogin={(roleData) => setSession(roleData)} lang={lang} setLang={setLang} t={t} agents={agents} />;
  }

  // 👇 சப்ஸ்கிரிப்ஷன் அல்லது ட்ரெயில் காலம் முடிந்துவிட்டதா எனச் சரிபார்க்கும் பகுதி (Admin-க்கு மட்டும்)
  const isExpired =
    session?.role === "admin" &&
    (profile?.status === "expired" ||
      (profile?.trialEnds && new Date(profile.trialEnds) < new Date() && profile?.plan === "Trial"));

  if (isExpired) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full text-center shadow-2xl">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
            ₹
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">சந்தா காலம் முடிவடைந்தது / Trial Expired</h2>
          <p className="text-sm text-slate-600 mb-6">
            உங்களது Vasool Raja மென்பொருள் சேவையைப் தொடர்ந்து பயன்படுத்த மாத வாடகையைச் செலுத்தி புதுப்பிக்கவும்.
          </p>
          
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 text-left">
            <p className="text-xs text-slate-500 font-semibold uppercase">UPI ID for Payment:</p>
            <p className="text-sm font-mono font-bold text-slate-800 mt-1">srigopinathmech@okhdfcbank</p>
          </div>

          <a
            href="upi://pay?pa=srigopinathmech@okhdfcbank&pn=Gopinath%20S&am=500&cu=INR"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl block shadow-md transition-all text-sm mb-3 text-center"
          >
            GPay / PhonePe மூலம் ₹500 செலுத்துங்கள்
          </a>

          <p className="text-xs text-slate-400 mt-4">
            தொகை செலுத்திய பிறகு ஸ்டேட்டஸ் ஆட்டோமேட்டிக்காக அப்டேட் செய்யப்படும் அல்லது ஓனரைத் தொடர்பு கொள்ளவும்.
          </p>
          
          <button 
            onClick={() => setSession(null)}
            className="mt-4 text-xs text-slate-500 underline hover:text-slate-700 cursor-pointer"
          >
            வெளியேறு (Logout)
          </button>
        </div>
      </div>
    );
  }

  return (
    <AppShell
      user={user}
      session={session}
      onLogout={() => setSession(null)}
      lang={lang}
      setLang={setLang}
      t={t}
      profile={profile}
      customers={customers}
      agents={agents}
      transactions={transactions}
    />
  );
}
