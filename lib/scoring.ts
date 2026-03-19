import { INTERESTS } from "@/lib/preferences";
import type { Opportunity } from "@/lib/firebase/opportunities";

export const SCORE_WEIGHTS = { interest: 40, format: 30, availability: 20, urgency: 10 } as const;

export function scoreOpportunity(
  opp: Opportunity,
  interests: string[],
  volunteerFormat: string,
  availability: string
): number {
  let score = 0;

  // Factor 1: Category matches student's interests (+40)
  const interestLabels = interests.map((id: string) => {
    const match = INTERESTS.find(i => (i as any).id === id);
    return match ? match.label : "";
  }).filter((label: string) => label !== "");
  if ((interestLabels as string[]).includes(opp.category)) score += SCORE_WEIGHTS.interest;

  // Factor 2: Format preference — infer remote/in-person from location string (+0–30)
  const locationLower = opp.location.toLowerCase();
  const isRemote = locationLower.includes("remote") || locationLower.includes("virtual") || locationLower.includes("online");
  if (volunteerFormat === "no-preference") {
    score += Math.round(SCORE_WEIGHTS.format * 0.5);
  } else if (volunteerFormat === "hybrid") {
    score += Math.round(SCORE_WEIGHTS.format * 0.67);
  } else if ((volunteerFormat === "remote" && isRemote) || (volunteerFormat === "in-person" && !isRemote)) {
    score += SCORE_WEIGHTS.format;
  }

  // Factor 3: Availability — day-of-week vs. weekends/weekdays preference (+0–20)
  const day = new Date(opp.dateISO + "T12:00:00").getDay();
  const isWeekend = day === 0 || day === 6;
  if (availability === "any-time") {
    score += Math.round(SCORE_WEIGHTS.availability * 0.5);
  } else if ((availability === "weekends" && isWeekend) || (availability === "weekdays" && !isWeekend)) {
    score += SCORE_WEIGHTS.availability;
  }

  // Factor 4: Urgency / scarcity bonus (+0–10)
  if (opp.spotsLeft > 0 && opp.spotsLeft <= 5) score += SCORE_WEIGHTS.urgency;
  else if (opp.spotsLeft <= 10) score += Math.round(SCORE_WEIGHTS.urgency * 0.5);

  return score;
}
