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
          // Initialize Free Trial for new operators
          const trialEnd = new Date();
          trialEnd.setDate(trialEnd.getDate() + 14);
          const newProfile = { plan: "Trial", trialEnds: trialEnd.toISOString(), createdAt: new Date().toISOString() };
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
