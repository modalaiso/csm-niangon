import type { Weekday } from "@prisma/client";

export const WEEKDAYS = [
  "LUNDI",
  "MARDI",
  "MERCREDI",
  "JEUDI",
  "VENDREDI",
] as const satisfies readonly Weekday[];

export function parseScheduleTime(value: string): number | null {
  const match = /^(\d{1,2})[:hH]([0-5]\d)$/.exec(value.trim());
  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23) return null;

  return hours * 60 + minutes;
}

export function isValidScheduleTimeRange(
  startTime: string,
  endTime: string,
): boolean {
  const start = parseScheduleTime(startTime);
  const end = parseScheduleTime(endTime);
  return start !== null && end !== null && start < end;
}

export function scheduleTimesOverlap(
  firstStart: number,
  firstEnd: number,
  secondStart: number,
  secondEnd: number,
): boolean {
  return firstStart < secondEnd && secondStart < firstEnd;
}
