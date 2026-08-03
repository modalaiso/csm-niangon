import Link from "next/link";
import { TrendingUp, Eye, FileText, MessageCircle, Megaphone, Users } from "lucide-react";
import { getAllVisitStats, getVisitTrend, getTopPages, type VisitPeriod } from "@/app/actions/analytics";
import { getDashboardSummary } from "@/app/actions/admin-dashboard";
import { requireDashboardAccess } from "@/lib/auth/admin-guard";
import { VisitTrendChart } from "@/components/admin/visit-trend-chart";

export const metadata = {
  title: "Vue d'ensemble | Dashboard admin",
};

const PERIOD_ORDER: { key: VisitPeriod; short: string }[] = [
  { key: "daily", short: "Jour" },
  { key: "weekly", short: "Semaine" },
  { key: "monthly", short: "Mois" },
  { key: "quarterly", short: "Trimestre" },
  { key: "semiannual", short: "Semestre" },
  { key: "annual", short: "Année" },
];

export default async function AdminDashboardPage() {
  const currentUser = await requireDashboardAccess();
  const canManagePosts = currentUser.role === "WRITER" || currentUser.role === "ADMIN";
  const canModerate = currentUser.role === "MODERATOR" || currentUser.role === "ADMIN";
  const isAdmin = currentUser.role === "ADMIN";

  const [visitStats, trend, topPages, summaryResult] = await Promise.all([
    getAllVisitStats(),
    getVisitTrend(14),
    getTopPages("weekly", 5),
    getDashboardSummary(),
  ]);

  const summary =
    "error" in summaryResult
      ? {
          totalPosts: 0,
          publishedPosts: 0,
          draftPosts: 0,
          archivedPosts: 0,
          pendingComments: 0,
          totalComments: 0,
          activeAnnouncements: 0,
          totalUsers: 0,
        }
      : summaryResult;

  const statsByPeriod = new Map(visitStats.map((s) => [s.period, s]));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Vue d&apos;ensemble</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Statistiques de trafic et état de la plateforme
        </p>
      </div>

      {/* Visites par période */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Visites
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {PERIOD_ORDER.map((p) => {
            const stat = statsByPeriod.get(p.key);
            const uniqueCount = stat?.uniqueSessions ?? 0;
            return (
              <div key={p.key} className="rounded-2xl border border-border bg-white p-4">
                <p className="text-xs font-medium text-muted-foreground">{p.short}</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{stat?.count ?? 0}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {uniqueCount} visiteur{uniqueCount > 1 ? "s" : ""} unique{uniqueCount > 1 ? "s" : ""}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Tendance 14 jours */}
      <section className="rounded-2xl border border-border bg-white p-5">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Tendance sur 14 jours</h2>
        </div>
        <VisitTrendChart data={trend} />
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {canManagePosts && (
          <Link
            href="/admin/posts"
            className="rounded-2xl border border-border bg-white p-5 transition-shadow hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <FileText className="h-5 w-5 text-primary" />
              <span className="text-xs text-muted-foreground">{summary.totalPosts} au total</span>
            </div>
            <p className="mt-3 text-2xl font-bold text-foreground">{summary.publishedPosts}</p>
            <p className="text-sm text-muted-foreground">Publications publiées</p>
            <p className="mt-2 text-xs text-muted-foreground">
              {summary.draftPosts} brouillon{summary.draftPosts > 1 ? "s" : ""} ·{" "}
              {summary.archivedPosts} archivé{summary.archivedPosts > 1 ? "s" : ""}
            </p>
          </Link>
        )}

        {canModerate && (
          <Link
            href="/admin/moderation"
            className="rounded-2xl border border-border bg-white p-5 transition-shadow hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <MessageCircle className="h-5 w-5 text-secondary" />
              <span className="text-xs text-muted-foreground">{summary.totalComments} au total</span>
            </div>
            <p className="mt-3 text-2xl font-bold text-foreground">{summary.pendingComments}</p>
            <p className="text-sm text-muted-foreground">Commentaires à modérer</p>
          </Link>
        )}

        {(canManagePosts || isAdmin) && (
          <div className="rounded-2xl border border-border bg-white p-5">
            <div className="flex items-center justify-between">
              <Megaphone className="h-5 w-5 text-rose-500" />
              {isAdmin && <Users className="h-4 w-4 text-muted-foreground" />}
            </div>
            <p className="mt-3 text-2xl font-bold text-foreground">{summary.activeAnnouncements}</p>
            <p className="text-sm text-muted-foreground">Annonces actives</p>
            {isAdmin && (
              <p className="mt-2 text-xs text-muted-foreground">
                {summary.totalUsers} utilisateurs inscrits
              </p>
            )}
          </div>
        )}
      </div>

      {/* Pages les plus visitées */}
      <section className="rounded-2xl border border-border bg-white p-5">
        <div className="mb-4 flex items-center gap-2">
          <Eye className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">
            Pages les plus visitées (cette semaine)
          </h2>
        </div>
        {topPages.length === 0 ? (
          <p className="text-sm text-muted-foreground">Pas encore assez de données.</p>
        ) : (
          <ul className="divide-y divide-border">
            {topPages.map((page, index) => (
              <li key={page.path} className="flex items-center justify-between py-2.5">
                <span className="flex items-center gap-2 text-sm text-foreground">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[11px] font-semibold text-muted-foreground">
                    {index + 1}
                  </span>
                  {page.path}
                </span>
                <span className="text-sm font-medium text-foreground">{page.count}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}