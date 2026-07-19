export function SystemGridBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 system-grid-bg opacity-40" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/60 to-background" />
      <div className="absolute inset-x-0 top-0 h-px bg-foreground/10" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-foreground/10" />
    </div>
  );
}
