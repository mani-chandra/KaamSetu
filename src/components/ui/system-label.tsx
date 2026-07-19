import { cn } from "@/lib/utils";

export function SystemLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "font-mono text-[10px] sm:text-xs font-normal uppercase tracking-[0.22em] text-muted-foreground",
        className
      )}
    >
      [{children}]
    </p>
  );
}

export function SystemSectionHeader({
  label,
  title,
  description,
  action,
  className,
}: {
  label: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8", className)}>
      <div className="space-y-2">
        <SystemLabel>{label}</SystemLabel>
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">{title}</h2>
        {description && <p className="text-sm text-muted-foreground max-w-xl">{description}</p>}
      </div>
      {action}
    </div>
  );
}
