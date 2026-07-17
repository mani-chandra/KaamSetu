import Link from "next/link";

type Section = { title: string; body: string[] };

export function LegalPage({
  title,
  updated,
  sections,
}: {
  title: string;
  updated: string;
  sections: Section[];
}) {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <Link href="/" className="text-sm text-brand hover:underline">
        ← Back to home
      </Link>
      <h1 className="text-3xl font-bold mt-4 mb-2">{title}</h1>
      <p className="text-sm text-muted-foreground mb-8">Last updated: {updated}</p>
      <div className="space-y-8 text-sm leading-relaxed text-slate-700">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">{section.title}</h2>
            {section.body.map((paragraph) => (
              <p key={paragraph.slice(0, 40)} className="mb-3">
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
