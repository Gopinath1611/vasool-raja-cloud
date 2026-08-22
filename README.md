# Vasool Raja — வசூல் ராஜா

Cable/ISP subscription collection SaaS app (React + Vite + Firebase).

## Setup

```bash
npm install
cp .env.example .env
# fill in your Firebase project credentials in .env
npm run dev
```

## Build

```bash
npm run build
```

## Folder structure

```
src/
├── main.jsx              # entry point
├── App.jsx                # auth + firestore listeners, top-level routing
├── firebase.js             # firebase init (env-based)
├── index.css                # tailwind entry
├── constants/
│   ├── colors.js             # C - color tokens
│   ├── translations.js        # L - en/ta translations
│   └── app.js                   # AREAS, PACKAGES, statusCfg, PLAN_LIMITS, AGENT_LIMITS
├── utils/
│   ├── customerStatus.js         # getCustomerStatus()
│   └── csvExport.js                # exportToCSV()
└── components/
    ├── GlobalFonts.jsx
    ├── Login.jsx                    # admin OTP + agent PIN login
    ├── AppShell.jsx                   # header, tabs, mobile nav, routing
    ├── Overview.jsx                     # dashboard KPIs + chart
    ├── Kpi.jsx
    ├── CustomerDirectory.jsx
    ├── AddEditCustomerModal.jsx
    ├── TeamManagement.jsx
    ├── AgentCollect.jsx
    ├── CollectModal.jsx
    ├── Settlement.jsx
    ├── MiniStat.jsx
    ├── Plans.jsx
    └── SubscriptionPaymentModal.jsx
```

## Notes

- Firebase config is read from `.env` (Vite `VITE_FIREBASE_*` vars). If deployed
  inside a sandbox/canvas environment that injects `__firebase_config`,
  `__app_id`, and `__initial_auth_token` globals, those take priority
  automatically — no code changes needed.
- Tailwind CSS is used for styling; run `npm install` to pull in
  `tailwindcss`, `postcss`, `autoprefixer`.
- No features were removed during the split — Login (OTP + Agent PIN),
  Dashboard/Overview with revenue chart, Customer Directory (CSV export,
  WhatsApp reminders, add/edit/delete), Team Management (agent limits),
  Agent Collect (route-limited collection + UPI QR + WhatsApp receipt),
  Settlement, and Plans (subscription upgrade + Pro branding) are all intact.
