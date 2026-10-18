import { describe, expect, it } from "vitest";
import {
  isValidScheduleTimeRange,
  parseScheduleTime,
  scheduleTimesOverlap,
  WEEKDAYS,
} from "@/lib/schedules";

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

  describe("schedule time helpers", () => {
    it("parses colon and legacy H-separated times", () => {
      expect(parseScheduleTime("07:30")).toBe(450);
      expect(parseScheduleTime("7H30")).toBe(450);
    });

    it("rejects invalid times and non-positive ranges", () => {
      expect(parseScheduleTime("25:00")).toBeNull();
      expect(isValidScheduleTimeRange("08:30", "08:30")).toBe(false);
      expect(isValidScheduleTimeRange("08:30", "08:25")).toBe(false);
      expect(isValidScheduleTimeRange("08:30", "09:15")).toBe(true);
    });

    it("detects overlap while allowing adjacent sessions", () => {
      expect(scheduleTimesOverlap(450, 510, 500, 540)).toBe(true);
      expect(scheduleTimesOverlap(450, 510, 510, 570)).toBe(false);
    });
  });

  it("does not include weekend days", () => {
    expect(WEEKDAYS).not.toContain("SAMEDI");
    expect(WEEKDAYS).not.toContain("DIMANCHE");
  });

  it("has exactly 5 entries", () => {
    expect(WEEKDAYS).toHaveLength(5);
  });
});
