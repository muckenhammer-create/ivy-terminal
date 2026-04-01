import { Opportunity, BrandBrief, Weights } from "./types";

function audienceScore(opp: Opportunity): number {
  const { income_score, real_follower_pct, age_18_34_pct, female_pct } = opp.audience;
  return (income_score * 0.3 + real_follower_pct * 0.3 + age_18_34_pct * 0.2 + female_pct * 0.2);
}

function budgetScore(opp: Opportunity, brief: BrandBrief): number {
  if (brief.budgetMax === 0 && brief.budgetMin === 0) return 70;
  const oppMid = (opp.budget_min + opp.budget_max) / 2;
  const briefMid = (brief.budgetMin + brief.budgetMax) / 2;
  if (briefMid === 0) return 70;
  const ratio = oppMid / briefMid;
  if (ratio >= 0.7 && ratio <= 1.3) return 95;
  if (ratio >= 0.4 && ratio <= 2.0) return 70;
  return 35;
}

function categoryScore(opp: Opportunity, brief: BrandBrief): number {
  if (brief.categories.length === 0) return 70;
  const scores = brief.categories.map((c) => (opp.cat_fit[c.toLowerCase()] ?? 50));
  return Math.max(...scores);
}

function exclusivityScore(opp: Opportunity): number {
  return opp.excl ? 85 : 55;
}

function trendScore(opp: Opportunity): number {
  return opp.trend_dir === "up" ? 90 : opp.trend_dir === "flat" ? 65 : 35;
}

export function computeMatchScore(
  opp: Opportunity,
  brief: BrandBrief,
  weights: Weights
): number {
  const totalWeight = weights.audience + weights.budget + weights.category + weights.exclusivity + weights.trend;
  if (totalWeight === 0) return 50;

  const raw =
    (audienceScore(opp) * weights.audience +
      budgetScore(opp, brief) * weights.budget +
      categoryScore(opp, brief) * weights.category +
      exclusivityScore(opp) * weights.exclusivity +
      trendScore(opp) * weights.trend) /
    totalWeight;

  return Math.round(raw);
}
