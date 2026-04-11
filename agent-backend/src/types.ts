export type Severity = "High" | "Medium" | "Low";

export interface RiskItem {
  severity: Severity;
  clause: string;
  reason: string;
  suggestion: string;
}

export interface ContractAnalysis {
  contract_type: string;
  overall_risk: Severity;
  summary: string;
  risks: RiskItem[];
}

export interface AnalyzeContractRequest {
  contractText: string;
  contractTypeHint?: string;
  userId?: string;
  language?: "ar" | "fr" | "en";
}
