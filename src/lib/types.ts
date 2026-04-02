export type OpportunityType = "athlete" | "club" | "event" | "league" | "grassroots";
export type TrendDir = "up" | "flat" | "down";

export interface Opportunity {
  id: string;
  type: OpportunityType;
  sport: string;
  name: string;
  meta: string;
  trend_dir: TrendDir;
  reach: string;
  geo: string[];
  excl: boolean;
  cat_fit: Record<string, number>;
  audience: {
    income: number;
    real: number;
    y1834: number;
    female: number;
  };
  budget_min: number;
  budget_max: number;
  tags: string[];
  highlights: string[];
  risks: string[];
  partners: string[];
  rights: string[];
}

export interface BrandBrief {
  categories: string[];
  objectives: string[];
  budgetMin: number;
  budgetMax: number;
  geos: string[];
}

export interface Weights {
  audience: number;
  budget: number;
  category: number;
  exclusivity: number;
  trend: number;
}

export interface Enquiry {
  opportunity_id: string;
  brand_category: string;
  email: string;
  message: string;
}
