import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { getDashboardSummary } from "@/app/actions/admin-dashboard";
import {
  getAdminAnalyticsDashboard,
  type VisitPeriod,
} from "@/app/actions/analytics";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AnalyticsExportButton } from "@/components/admin/analytics-export-button";
import { VisitTrendChart } from "@/components/admin/visit-trend-chart";
import { requireDashboardAccess } from "@/lib/auth/admin-guard";

export const metadata = {
  title: "Vue d'ensemble | Dashboard - CSM Niangon",
};

const PERIOD_ORDER: { key: VisitPeriod; short: string }[] = [
  { key: "daily", short: "Aujourd'hui" },
  { key: "weekly", short: "Cette semaine" },
  { key: "monthly", short: "Ce mois-ci" },
  { key: "quarterly", short: "Ce trimestre" },
  { key: "semiannual", short: "Ce semestre" },
  { key: "annual", short: "Cette année" },
];

const numberFormatter = new Intl.NumberFormat("fr-FR");

function formatDuration(seconds: number): string {
  if (seconds >= 60) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds
      ? `${minutes} min ${remainingSeconds} s`
      : `${minutes} min`;
  }
  return `${seconds} s`;
}

function MetricCard({
  label,
  value,
  detail,
}: Readonly<{
  label: string;
  value: string;
  detail: string;
}>) {
  return (
    <article className="rounded-lg border border-border bg-background px-4 py-3.5">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-foreground">
        {value}
      </p>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">{detail}</p>
    </article>
  );
}

export default async function AdminDashboardPage() {
  const currentUser = await requireDashboardAccess();
  const canManagePosts =
    currentUser.role === "WRITER" || currentUser.role === "ADMIN";
  const canModerate =
    currentUser.role === "MODERATOR" || currentUser.role === "ADMIN";
  const isAdmin = currentUser.role === "ADMIN";

  const [analyticsDashboard, summaryResult] = await Promise.all([
    getAdminAnalyticsDashboard(),
    getDashboardSummary(),
  ]);
  const { visitStats, trend, topPages, analytics } = analyticsDashboard;

  const summary = "error" in summaryResult ? null : summaryResult;
  const statsByPeriod = new Map(visitStats.map((stat) => [stat.period, stat]));
  const todayViews = statsByPeriod.get("daily")?.count ?? 0;
  const weeklyVisitors = statsByPeriod.get("weekly")?.uniqueSessions ?? 0;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <AdminPageHeader
        title="Vue d’ensemble"
        description={`Bonjour ${currentUser.prenom}. Suivez l’audience, les publications et l’activité de la communauté.`}
        action={
          <AnalyticsExportButton
            visits={visitStats}
            analytics={analytics}
            dashboard={summary}
          />
        }
      />

      {summary === null && (
        <div
          aria-live="polite"
          className="rounded-md border border-amber-300/70 bg-amber-50 px-4 py-3 text-sm text-amber-900"
        >
          Les indicateurs éditoriaux sont temporairement indisponibles. Les
          chiffres non chargés ne sont pas remplacés par des zéros.
        </div>
      )}

      <section
        aria-label="Indicateurs clés"
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        <MetricCard
          label="Vues qualifiées aujourd’hui"
          value={numberFormatter.format(todayViews)}
          detail="Pages consultées au moins 10 secondes"
        />
        <MetricCard
          label="Visiteurs uniques cette semaine"
          value={numberFormatter.format(weeklyVisitors)}
          detail="Sessions distinctes mesurées"
        />
        <MetricCard
          label="Lectures de publications"
          value={
            summary ? numberFormatter.format(summary.qualifiedViews30Days) : "—"
          }
          detail={
            summary
              ? "30 derniers jours · lectures d’au moins 10 s"
              : "Données éditoriales indisponibles"
          }
        />
        <MetricCard
          label="Temps moyen de lecture"
          value={summary ? formatDuration(summary.averagePostReadSeconds) : "—"}
          detail={
            summary
              ? "Par lecture qualifiée · 30 derniers jours"
              : "Données éditoriales indisponibles"
          }
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.8fr)]">
        <div className="min-w-0 rounded-lg border border-border bg-background p-4 sm:p-5">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold text-foreground">
                Évolution du trafic
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Vues qualifiées par jour · 30 derniers jours
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Seuil de qualification : 10 s d’activité
            </p>
          </div>
          <VisitTrendChart data={trend} />
        </div>

        <section className="rounded-lg border border-border bg-background p-4 sm:p-5">
          <h2 className="font-semibold text-foreground">Engagement</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Activité mesurée sur les 30 derniers jours
          </p>
          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Sessions engagées
                </p>
                <p className="text-xs text-muted-foreground">
                  Au moins 30 s d’activité
                </p>
              </div>
              <p className="text-xl font-bold text-foreground">
                {numberFormatter.format(analytics.engagedSessions)}
              </p>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Durée active moyenne
                </p>
                <p className="text-xs text-muted-foreground">
                  Par session mesurée
                </p>
              </div>
              <p className="text-xl font-bold text-foreground">
                {formatDuration(analytics.averageEngagementSeconds)}
              </p>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Taux d’engagement
                </p>
                <p className="text-xs text-muted-foreground">
                  Sessions engagées parmi les vues
                </p>
              </div>
              <p className="text-xl font-bold text-foreground">
                {analytics.engagementRate}%
              </p>
            </div>
            <div className="h-px bg-border" />
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-md bg-muted/60 px-2 py-3">
                <p className="text-lg font-bold text-foreground">
                  {numberFormatter.format(analytics.scrollDepth90)}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Lectures à 90 %
                </p>
              </div>
              <div className="rounded-md bg-muted/60 px-2 py-3">
                <p className="text-lg font-bold text-foreground">
                  {numberFormatter.format(analytics.searches)}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Recherches
                </p>
              </div>
              <div className="rounded-md bg-muted/60 px-2 py-3">
                <p className="text-lg font-bold text-foreground">
                  {numberFormatter.format(analytics.shares)}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Partages
                </p>
              </div>
            </div>
          </div>
        </section>
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h2 className="font-semibold text-foreground">
              Vue du trafic par période
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Vues qualifiées et visiteurs uniques
            </p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PERIOD_ORDER.map((period) => {
            const stat = statsByPeriod.get(period.key);
            const uniqueSessions = stat?.uniqueSessions ?? 0;
            return (
              <article
                key={period.key}
                className="rounded-lg border border-border bg-background px-4 py-3"
              >
                <p className="text-xs font-medium text-muted-foreground">
                  {period.short}
                </p>
                <div className="mt-2 flex items-baseline justify-between gap-3">
                  <p className="text-2xl font-bold text-foreground">
                    {numberFormatter.format(stat?.count ?? 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {numberFormatter.format(uniqueSessions)} visiteur
                    {uniqueSessions > 1 ? "s" : ""}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-lg border border-border bg-background p-4 sm:p-5">
          <div className="mb-4">
            <div>
              <h2 className="font-semibold text-foreground">
                Pages les plus consultées
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Depuis le début du mois · lecture active ≥ 10 s
              </p>
            </div>
          </div>
          {topPages.length === 0 ? (
            <p className="rounded-md bg-muted/60 px-4 py-6 text-center text-sm text-muted-foreground">
              Pas encore assez de données qualifiées.
            </p>
          ) : (
            <ol className="divide-y divide-border">
              {topPages.map((page, index) => (
                <li
                  key={page.path}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold text-muted-foreground">
                      {index + 1}
                    </span>
                    {page.path.startsWith("/") &&
                    !page.path.startsWith("//") ? (
                      <Link
                        href={page.path}
                        className="truncate text-sm font-medium text-foreground hover:text-primarys2-700 hover:underline"
                      >
                        {page.path}
                      </Link>
                    ) : (
                      <span className="truncate text-sm font-medium text-foreground">
                        {page.path}
                      </span>
                    )}
                  </span>
                  <span className="shrink-0 text-sm font-semibold text-foreground">
                    {numberFormatter.format(page.count)}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="rounded-lg border border-border bg-background p-4 sm:p-5">
          <div className="mb-4">
            <div>
              <h2 className="font-semibold text-foreground">
                Publications qui retiennent l’attention
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Classement par lectures qualifiées · 30 derniers jours
              </p>
            </div>
          </div>
          {!summary ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              Les données des publications sont temporairement indisponibles.
            </p>
          ) : summary.topPosts.length === 0 ? (
            <p className="rounded-md bg-muted/60 px-4 py-6 text-center text-sm text-muted-foreground">
              Les publications apparaîtront après les premières lectures
              qualifiées.
            </p>
          ) : (
            <ol className="divide-y divide-border">
              {summary.topPosts.map((post, index) => (
                <li
                  key={post.id}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold text-muted-foreground">
                      {index + 1}
                    </span>
                    <Link
                      href={`/posts/${post.id}`}
                      className="min-w-0 truncate text-sm font-medium text-foreground hover:text-primarys2-700 hover:underline"
                    >
                      {post.title}
                    </Link>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block text-sm font-semibold text-foreground">
                      {numberFormatter.format(post.views)} lecture
                      {post.views > 1 ? "s" : ""}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {formatDuration(post.averageReadSeconds)} en moyenne
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>

      <section aria-labelledby="admin-shortcuts-heading">
        <div className="mb-2">
          <h2
            id="admin-shortcuts-heading"
            className="font-semibold text-foreground"
          >
            Accès de gestion
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Ouvrir les outils associés à votre rôle.
          </p>
        </div>
        <div className="grid gap-x-8 sm:grid-cols-2">
          {canManagePosts && (
            <Link
              href="/admin/posts"
              className="group flex min-h-16 items-center justify-between gap-4 border-b border-border py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <div>
                <p className="text-sm font-medium text-foreground group-hover:text-primarys2-700">
                  Publications
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {summary
                    ? `${numberFormatter.format(summary.publishedPosts)} publiées · ${numberFormatter.format(summary.draftPosts)} brouillons`
                    : "Gérer les contenus et leur diffusion"}
                </p>
              </div>
              <ArrowRight
                className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primarys2-700"
                aria-hidden="true"
              />
            </Link>
          )}
          {canModerate && (
            <Link
              href="/admin/moderation"
              className="group flex min-h-16 items-center justify-between gap-4 border-b border-border py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <div>
                <p className="text-sm font-medium text-foreground group-hover:text-primarys2-700">
                  Modération
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {summary
                    ? `${numberFormatter.format(summary.pendingComments)} commentaire${summary.pendingComments === 1 ? "" : "s"} à examiner`
                    : "Examiner les commentaires signalés"}
                </p>
              </div>
              <ArrowRight
                className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primarys2-700"
                aria-hidden="true"
              />
            </Link>
          )}
          {canManagePosts && (
            <Link
              href="/admin/schedules"
              className="group flex min-h-16 items-center justify-between gap-4 border-b border-border py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <div>
                <p className="text-sm font-medium text-foreground group-hover:text-primarys2-700">
                  Emplois du temps
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Organiser les classes et les matières
                </p>
              </div>
              <ArrowRight
                className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primarys2-700"
                aria-hidden="true"
              />
            </Link>
          )}
          {isAdmin && (
            <Link
              href="/admin/users"
              className="group flex min-h-16 items-center justify-between gap-4 border-b border-border py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <div>
                <p className="text-sm font-medium text-foreground group-hover:text-primarys2-700">
                  Utilisateurs
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {summary
                    ? `${numberFormatter.format(summary.totalUsers)} comptes · gérer les rôles`
                    : "Gérer les rôles et les accès"}
                </p>
              </div>
              <ArrowRight
                className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primarys2-700"
                aria-hidden="true"
              />
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
