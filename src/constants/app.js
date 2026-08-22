import {
  CheckCircle2,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { C } from "./colors";

export const AREAS = [
  "Melur Main Road",
  "Anna Nagar 3rd St",
  "Thillai Nagar",
  "Gandhi Road",
  "Periyar Colony",
  "Vellalar St",
  "Cauvery Nagar",
];

export const PACKAGES = [
  "Basic SD",
  "Premium HD",
  "Sports Combo",
  "Fiber 100 Mbps",
  "Fiber 200 Mbps",
];

export const statusCfg = {
  paid: { color: C.emerald, soft: C.emeraldSoft, line: C.emeraldLine, icon: CheckCircle2 },
  due: { color: C.amber, soft: C.amberSoft, line: C.amberLine, icon: Clock },
  overdue: { color: C.crimson, soft: C.crimsonSoft, line: C.crimsonLine, icon: AlertTriangle },
};

export const PLAN_LIMITS = { Trial: 50, Starter: 200, Growth: 1000, Pro: 999999 };

export const AGENT_LIMITS = { Trial: 1, Starter: 1, Growth: 5, Pro: 999999 };

// UPI merchant handle used for both customer collection and subscription payments
export const MERCHANT_UPI = "srigopinathmech@okhdfcbank";
