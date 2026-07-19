export function KaamSetuLoader({ label = "Loading KaamSetu" }: { label?: string }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#070b10] text-white"
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-1/4 top-0 h-[55vh] w-[55vw] rounded-full bg-teal-500/10 blur-[120px]" />
        <div className="absolute -right-1/4 bottom-0 h-[45vh] w-[45vw] rounded-full bg-amber-500/10 blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />
      </div>

      <div className="relative flex flex-col items-center px-6 text-center">
        <div className="mb-8 flex items-end gap-1">
          <span className="block h-10 w-[3px] rounded-full bg-teal-400/80 animate-loader-pillar" style={{ animationDelay: "0ms" }} />
          <span className="block h-14 w-[3px] rounded-full bg-teal-300 animate-loader-pillar" style={{ animationDelay: "120ms" }} />
          <span className="block h-12 w-[3px] rounded-full bg-amber-300/90 animate-loader-pillar" style={{ animationDelay: "240ms" }} />
          <span className="block h-16 w-[3px] rounded-full bg-teal-400 animate-loader-pillar" style={{ animationDelay: "360ms" }} />
          <span className="block h-11 w-[3px] rounded-full bg-teal-300/80 animate-loader-pillar" style={{ animationDelay: "480ms" }} />
        </div>

        <p className="font-mono text-[10px] uppercase tracking-[0.45em] text-white/45">KaamSetu</p>
        <h1 className="mt-3 text-xl font-semibold tracking-tight text-white/90 md:text-2xl">Connecting you to trusted local pros</h1>
        <p className="mt-2 text-sm text-white/45">{label}</p>

        <div className="mt-10 h-px w-48 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-teal-400 to-amber-300 animate-loader-bar" />
        </div>
      </div>
    </div>
  );
}
