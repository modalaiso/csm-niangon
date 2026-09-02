import { describe, expect, it } from "vitest";
import { cn, formatRelativeTime } from "@/lib/utils";

describe("cn", () => {
  it("merges class names and resolves tailwind conflicts", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("drops falsy values", () => {
    expect(cn("text-sm", false && "hidden", undefined, "font-bold")).toBe(
      "text-sm font-bold",
    );
  });
});

describe("formatRelativeTime", () => {
  it("returns an empty string for null", () => {
    expect(formatRelativeTime(null)).toBe("");
  });

  it("returns 'À l'instant' for a date under a minute old", () => {
    expect(formatRelativeTime(new Date())).toBe("À l'instant");
  });

  it("formats minutes ago", () => {
    const date = new Date(Date.now() - 5 * 60 * 1000);
    expect(formatRelativeTime(date)).toBe("Il y a 5min");
  });

  it("formats hours ago", () => {
    const date = new Date(Date.now() - 3 * 60 * 60 * 1000);
    expect(formatRelativeTime(date)).toBe("Il y a 3h");
  });

  it("formats days ago", () => {
    const date = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(date)).toBe("Il y a 4j");
  });

  it("formats months ago", () => {
    const date = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(date)).toBe("Il y a 3m");
  });

  it("formats years ago with correct pluralization", () => {
    const oneYear = new Date(Date.now() - 400 * 24 * 60 * 60 * 1000);
    const twoYears = new Date(Date.now() - 800 * 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(oneYear)).toBe("Il y a 1an");
    expect(formatRelativeTime(twoYears)).toBe("Il y a 2ans");
  });
});
