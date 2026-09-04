export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "UNASSESSED";

export type ScanType = "LINK" | "MESSAGE" | "SCREENSHOT";

export interface ScanResult {
  risk: RiskLevel;
  title: string;
  scamType: string;
  reasons: string[];
  action: string;
  input: string;
}

export interface HistoryItem extends ScanResult {
  id: string;
  type: ScanType;
  createdAt: string;
}

export interface ScamTrend {
  id: string;
  name: string;
  severity: "high" | "medium";
  summary: string;
  howItWorks: string;
  warningSigns: string[];
  whatToDo: string;
  source: string;
}