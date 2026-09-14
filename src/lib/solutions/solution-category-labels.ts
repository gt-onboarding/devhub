import { msg } from "gt-next";

const solutionCategoryLabels: Record<string, string> = {
  Launch: msg("Launch"),
  "Developer Experience": msg("Developer Experience"),
  Updates: msg("Updates"),
  "Agent-Led Development": msg("Agent-Led Development"),
  "Database Development": msg("Database Development"),
  Apps: msg("Apps"),
  Solution: msg("Solution"),
};

export function getSolutionCategoryLabel(category: string): string {
  return solutionCategoryLabels[category] ?? category;
}
