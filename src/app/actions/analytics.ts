"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export type VisitPeriod =
  | "daily"
  | "weekly"
  | "monthly"
  | "quarterly"
  | "semiannual"
  | "annual";

const PERIOD_LABELS: Record<VisitPeriod, string> = {
  daily: "Aujourd'hui",
  weekly: "Cette semaine",
  monthly: "Ce mois-ci",
  quarterly: "Ce trimestre",
  semiannual: "Ce semestre",
  annual: "Cette année",
};

function startOfPeriod(period: VisitPeriod, from: Date = new Date()): Date {
  const d = new Date(from);
  d.setHours(0, 0, 0, 0);

  switch (period) {
    case "daily":
      return d;
    case "weekly": {
      const day = d.getDay(); // 0 = dimanche
      const diffToMonday = (day + 6) % 7;
      d.setDate(d.getDate() - diffToMonday);
      return d;
    }
    case "monthly":
      d.setDate(1);
      return d;
    case "quarterly": {
      const quarterStartMonth = Math.floor(d.getMonth() / 3) * 3;
      d.setMonth(quarterStartMonth, 1);
      return d;
    }
    case "semiannual": {
      const semesterStartMonth = d.getMonth() < 6 ? 0 : 6;
      d.setMonth(semesterStartMonth, 1);
      return d;
    }
    case "annual":
      d.setMonth(0, 1);
      return d;
    default:
      return d;
  }
}

export interface LogVisitInput {
  path: string;
  sessionId: string;
  referrer?: string | null;
  device?: string | null;
}

type LogVisitResult = { success: true } | { error: "invalid" | "unknown" };

/** Enregistre une visite anonyme (ou liée à l'utilisateur connecté) sur une page publique */
export async function logVisit(input: LogVisitInput): Promise<LogVisitResult> {
  const path = input.path?.trim();
  const sessionId = input.sessionId?.trim();

  if (!path || !sessionId) {
    return { error: "invalid" };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    await prisma.visitLog.create({
      data: {
        path: path.slice(0, 500),
        sessionId: sessionId.slice(0, 200),
        userId: user?.id ?? null,
        referrer: input.referrer?.slice(0, 500) || null,
        device: input.device?.slice(0, 50) || null,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de la visite:", error);
    return { error: "unknown" };
  }
}

export interface VisitStats {
  period: VisitPeriod;
  label: string;
  count: number;
  uniqueSessions: number;
}

/** Nombre de visites (et de sessions uniques) depuis le début de la période donnée */
export async function getVisitStats(period: VisitPeriod): Promise<VisitStats> {
  const start = startOfPeriod(period);

  try {
    const [count, sessions] = await Promise.all([
      prisma.visitLog.count({ where: { createdAt: { gte: start } } }),
      prisma.visitLog.findMany({
        where: { createdAt: { gte: start } },
        select: { sessionId: true },
        distinct: ["sessionId"],
      }),
    ]);

    return { period, label: PERIOD_LABELS[period], count, uniqueSessions: sessions.length };
  } catch (error) {
    console.error("Erreur lors du calcul des statistiques de visite:", error);
    return { period, label: PERIOD_LABELS[period], count: 0, uniqueSessions: 0 };
  }
}

/** Toutes les périodes d'un coup, pour les cartes KPI du dashboard */
export async function getAllVisitStats(): Promise<VisitStats[]> {
  const periods: VisitPeriod[] = [
    "daily",
    "weekly",
    "monthly",
    "quarterly",
    "semiannual",
    "annual",
  ];
  return Promise.all(periods.map((p) => getVisitStats(p)));
}

export interface VisitTrendPoint {
  date: string; // YYYY-MM-DD
  count: number;
}

/** Nombre de visites par jour sur les N derniers jours, pour un graphique de tendance */
export async function getVisitTrend(days: number = 14): Promise<VisitTrendPoint[]> {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));

  try {
    const logs = await prisma.visitLog.findMany({
      where: { createdAt: { gte: start } },
      select: { createdAt: true },
    });

    const counts = new Map<string, number>();
    for (let i = 0; i < days; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      counts.set(d.toISOString().slice(0, 10), 0);
    }

    for (const log of logs) {
      const key = log.createdAt.toISOString().slice(0, 10);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    return Array.from(counts.entries()).map(([date, count]) => ({ date, count }));
  } catch (error) {
    console.error("Erreur lors du calcul de la tendance des visites:", error);
    return [];
  }
}

/** Pages les plus visitées sur la période donnée, pour le dashboard */
export async function getTopPages(
  period: VisitPeriod = "weekly",
  limit: number = 10,
): Promise<{ path: string; count: number }[]> {
  const start = startOfPeriod(period);

  try {
    const grouped = await prisma.visitLog.groupBy({
      by: ["path"],
      where: { createdAt: { gte: start } },
      _count: { path: true },
      orderBy: { _count: { path: "desc" } },
      take: limit,
    });

    return grouped.map((g) => ({ path: g.path, count: g._count.path }));
  } catch (error) {
    console.error("Erreur lors du calcul des pages les plus visitées:", error);
    return [];
  }
}