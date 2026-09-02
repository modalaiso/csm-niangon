import { describe, expect, it } from "vitest";
import { WEEKDAYS } from "@/lib/schedules";

describe("WEEKDAYS", () => {
  it("contains the five school weekdays in order", () => {
    expect(WEEKDAYS).toEqual([
      "LUNDI",
      "MARDI",
      "MERCREDI",
      "JEUDI",
      "VENDREDI",
    ]);
  });

  it("does not include weekend days", () => {
    expect(WEEKDAYS).not.toContain("SAMEDI");
    expect(WEEKDAYS).not.toContain("DIMANCHE");
  });

  it("has exactly 5 entries", () => {
    expect(WEEKDAYS).toHaveLength(5);
  });
});
