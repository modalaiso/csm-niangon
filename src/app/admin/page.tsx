import {
  Activity,
  ArrowRight,
  BookOpen,
  Clock3,
  Eye,
  FileText,
  Megaphone,
  MessageCircle,
  Search,
  Share2,
  ShieldAlert,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { getDashboardSummary } from "@/app/actions/admin-dashboard";
import {
  getAdminAnalyticsDashboard,
  type VisitPeriod,
} from "@/app/actions/analytics";
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
  Icon,
  tone,
}: Readonly<{
  label: string;
  value: string;
  detail: string;
  Icon: typeof Eye;
  tone: string;
}>) {
  return (
    <article className="rounded-2xl border border-border/70 bg-background p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">
            {value}
          </p>
        </div>
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}
        >
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{detail}</p>
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
          qualifiedViews30Days: 0,
          averagePostReadSeconds: 0,
          topPosts: [],
        }
      : summaryResult;
  const statsByPeriod = new Map(visitStats.map((stat) => [stat.period, stat]));
  const todayViews = statsByPeriod.get("daily")?.count ?? 0;
  const weeklyVisitors = statsByPeriod.get("weekly")?.uniqueSessions ?? 0;

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-primary/90 p-6 text-white shadow-lg sm:p-8">
        <div className="pointer-events-none absolute -right-12 -top-24 h-72 w-72 rounded-full bg-white/5 blur-2xl" />
        <div className="pointer-events-none absolute bottom-[-6rem] right-1/3 h-48 w-48 rounded-full bg-primary/25 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
              Espace de pilotage · CSM Niangon
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Bonjour, {currentUser.prenom}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">
              Votre activité, l’engagement de la communauté et les contenus qui
              retiennent vraiment l’attention.
            </p>
          </div>
          <AnalyticsExportButton
            visits={visitStats}
            analytics={analytics}
            dashboard={summary}
          />
        </div>
        <div className="relative mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/10 pt-4 text-xs text-white/70">
          <span className="inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Mesure des vues qualifiées active
          </span>
          <span>Une lecture est comptée après 10 s d’activité</span>
          <span>Durées calculées hors onglets inactifs</span>
        </div>
      </header>

      <section
        aria-label="Indicateurs clés"
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        <MetricCard
          label="Vues qualifiées aujourd’hui"
          value={numberFormatter.format(todayViews)}
          detail="Pages consultées au moins 10 secondes"
          Icon={Eye}
          tone="bg-sky-500/10 text-sky-600"
        />
        <MetricCard
          label="Visiteurs uniques cette semaine"
          value={numberFormatter.format(weeklyVisitors)}
          detail="Sessions distinctes mesurées"
          Icon={Users}
          tone="bg-violet-500/10 text-violet-600"
        />
        <MetricCard
          label="Lectures de publications"
          value={numberFormatter.format(summary.qualifiedViews30Days)}
          detail="30 derniers jours · lectures d’au moins 10 s"
          Icon={BookOpen}
          tone="bg-emerald-500/10 text-emerald-600"
        />
        <MetricCard
          label="Temps moyen de lecture"
          value={formatDuration(summary.averagePostReadSeconds)}
          detail="Par lecture qualifiée · 30 derniers jours"
          Icon={Clock3}
          tone="bg-amber-500/10 text-amber-600"
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.8fr)]">
        <div className="min-w-0 rounded-2xl border border-border/70 bg-background p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold text-foreground">
                Évolution du trafic
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Vues qualifiées par jour · 30 derniers jours
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
              <TrendingUp className="h-3.5 w-3.5" />
              Lecture active ≥ 10 s
            </span>
          </div>
          <VisitTrendChart data={trend} />
        </div>

        <section className="rounded-2xl border border-border/70 bg-background p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <h2 className="font-semibold text-foreground">
              Signaux d’engagement
            </h2>
          </div>
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
              <div className="rounded-xl bg-muted/60 px-2 py-3">
                <p className="text-lg font-bold text-foreground">
                  {numberFormatter.format(analytics.scrollDepth90)}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Lectures à 90 %
                </p>
              </div>
              <div className="rounded-xl bg-muted/60 px-2 py-3">
                <p className="text-lg font-bold text-foreground">
                  {numberFormatter.format(analytics.searches)}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Recherches
                </p>
              </div>
              <div className="rounded-xl bg-muted/60 px-2 py-3">
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
                className="rounded-2xl border border-border/70 bg-background p-4 shadow-sm"
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
        <div className="rounded-2xl border border-border/70 bg-background p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-foreground">
                Pages les plus consultées
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Depuis le début du mois · lecture active ≥ 10 s
              </p>
            </div>
            <Eye className="h-4 w-4 text-primary" />
          </div>
          {topPages.length === 0 ? (
            <p className="rounded-xl bg-muted/60 px-4 py-6 text-center text-sm text-muted-foreground">
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
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-semibold text-muted-foreground">
                      {index + 1}
                    </span>
                    {page.path.startsWith("/") &&
                    !page.path.startsWith("//") ? (
                      <Link
                        href={page.path}
                        className="truncate text-sm font-medium text-foreground hover:text-primary hover:underline"
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

        <div className="rounded-2xl border border-border/70 bg-background p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-foreground">
                Publications qui retiennent l’attention
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Classement par lectures qualifiées · 30 derniers jours
              </p>
            </div>
            <BookOpen className="h-4 w-4 text-primary" />
          </div>
          {summary.topPosts.length === 0 ? (
            <p className="rounded-xl bg-muted/60 px-4 py-6 text-center text-sm text-muted-foreground">
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
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-semibold text-muted-foreground">
                      {index + 1}
                    </span>
                    <Link
                      href={`/posts/${post.id}`}
                      className="min-w-0 truncate text-sm font-medium text-foreground hover:text-primary hover:underline"
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

      <section>
        <div className="mb-3">
          <h2 className="font-semibold text-foreground">Gestion rapide</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Accédez directement aux tâches prioritaires.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {canManagePosts && (
            <Link
              href="/admin/posts"
              className="group rounded-2xl border border-border/70 bg-background p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <FileText className="h-5 w-5 text-primary" />
                <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
              </div>
              <p className="mt-4 text-xl font-bold text-foreground">
                {numberFormatter.format(summary.publishedPosts)} publiées
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {summary.draftPosts} brouillon
                {summary.draftPosts > 1 ? "s" : ""} · {summary.archivedPosts}{" "}
                archivée
                {summary.archivedPosts > 1 ? "s" : ""}
              </p>
            </Link>
          )}
          {canModerate && (
            <Link
              href="/admin/moderation"
              className="group rounded-2xl border border-border/70 bg-background p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <ShieldAlert className="h-5 w-5 text-rose-500" />
                <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
              </div>
              <p className="mt-4 text-xl font-bold text-foreground">
                {numberFormatter.format(summary.pendingComments)} à traiter
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Commentaires signalés · {summary.totalComments} commentaires
              </p>
            </Link>
          )}
          {(canManagePosts || isAdmin) && (
            <Link
              href="/admin/posts"
              className="group rounded-2xl border border-border/70 bg-background p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <Megaphone className="h-5 w-5 text-amber-500" />
                <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
              </div>
              <p className="mt-4 text-xl font-bold text-foreground">
                {numberFormatter.format(summary.activeAnnouncements)} annonce
                {summary.activeAnnouncements > 1 ? "s" : ""} active
                {summary.activeAnnouncements > 1 ? "s" : ""}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {isAdmin
                  ? `${numberFormatter.format(summary.totalUsers)} utilisateurs inscrits`
                  : "Publications et annonces"}
              </p>
            </Link>
          )}
          {isAdmin && (
            <Link
              href="/admin/users"
              className="group rounded-2xl border border-border/70 bg-background p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <Users className="h-5 w-5 text-violet-500" />
                <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
              </div>
              <p className="mt-4 text-xl font-bold text-foreground">
                {numberFormatter.format(summary.totalUsers)} utilisateurs
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Gérer les rôles et les accès
              </p>
            </Link>
          )}
          <div className="rounded-2xl border border-border/70 bg-background p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <Search className="h-5 w-5 text-sky-500" />
              <span className="text-xs font-medium text-muted-foreground">
                30 jours
              </span>
            </div>
            <p className="mt-4 text-xl font-bold text-foreground">
              {numberFormatter.format(analytics.searches)} recherches
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Termes non conservés dans les statistiques
            </p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-background p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <Share2 className="h-5 w-5 text-emerald-500" />
              <span className="text-xs font-medium text-muted-foreground">
                30 jours
              </span>
            </div>
            <p className="mt-4 text-xl font-bold text-foreground">
              {numberFormatter.format(analytics.shares)} partages
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Publications relayées par la communauté
            </p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-background p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <MessageCircle className="h-5 w-5 text-indigo-500" />
              <span className="text-xs font-medium text-muted-foreground">
                Plateforme
              </span>
            </div>
            <p className="mt-4 text-xl font-bold text-foreground">
              {numberFormatter.format(summary.totalComments)} commentaires
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {numberFormatter.format(summary.pendingComments)} signalés à
              vérifier
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
