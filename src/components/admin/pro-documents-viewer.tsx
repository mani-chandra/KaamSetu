"use client";

import Image from "next/image";
import { FileText } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

function isPdf(url: string) {
  return url.toLowerCase().endsWith(".pdf");
}

export function ProDocumentsViewer({ documentUrls }: { documentUrls: string[] }) {
  const { t } = useI18n();

  if (documentUrls.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">{t.admin.noVerificationDocs}</p>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{t.admin.verificationDocs}</p>
      <div className="flex flex-wrap gap-3">
        {documentUrls.map((url, i) => (
          <a
            key={url}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-lg border border-white/10 overflow-hidden hover:border-brand/40 transition-colors"
          >
            {isPdf(url) ? (
              <div className="flex items-center gap-2 px-3 py-2 text-sm text-brand">
                <FileText className="h-4 w-4" />
                {t.admin.viewDocument} {i + 1}
              </div>
            ) : (
              <div className="relative h-24 w-32 bg-muted">
                <Image src={url} alt={`${t.admin.verificationDocs} ${i + 1}`} fill className="object-cover" unoptimized />
              </div>
            )}
          </a>
        ))}
      </div>
    </div>
  );
}
