import type { LucideIcon } from "lucide-react";

interface AdminPageHeaderProps {
  title: string;
  description: string;
  icon: LucideIcon;
  action?: React.ReactNode;
}

export function AdminPageHeader({
  title,
  description,
  icon: Icon,
  action,
}: Readonly<AdminPageHeaderProps>) {
  return (
    <header className="mb-7 flex flex-col gap-4 border-b border-border/70 pb-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/10">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Administration
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {title}
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
      {action}
    </header>
  );
}
