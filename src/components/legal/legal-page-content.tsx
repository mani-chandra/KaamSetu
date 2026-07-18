"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { legalContent, type LegalDocument } from "@/lib/i18n/legal-content";

export function LegalPageContent({ document }: { document: "terms" | "privacy" }) {
  const { locale } = useI18n();
  const copy = legalContent[locale];
  const doc: LegalDocument = copy[document];

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <Link href="/" className="text-sm text-brand hover:underline">
        {copy.backHome}
      </Link>
      <h1 className="text-3xl font-bold mt-4 mb-2">{doc.title}</h1>
      <p className="text-sm text-muted-foreground mb-8">
        {copy.lastUpdated} {doc.updated}
      </p>
      <div className="space-y-8 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
        {doc.sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              {section.title}
            </h2>
            {section.body.map((paragraph) => (
              <p key={paragraph.slice(0, 48)} className="mb-3">
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
