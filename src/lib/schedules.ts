import type { Weekday } from "@prisma/client";

export const WEEKDAYS = ["LUNDI", "MARDI", "MERCREDI", "JEUDI", "VENDREDI"] as const satisfies readonly Weekday[];