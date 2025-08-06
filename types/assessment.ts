export interface AssessmentResult {
  riskScore: number;
  summary: string;
  riskFactors: string[];
  protectiveFactors: string[];
  recommendations: string[];
  confidence: 'Low' | 'Medium' | 'High';
  warning?: string;
}