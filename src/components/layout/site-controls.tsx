"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useI18n } from "@/lib/i18n/context";
import { Locale, localeLabels } from "@/lib/i18n/translations";

export function SiteControls() {
  const { theme, setTheme } = useTheme();
  const { locale, setLocale } = useI18n();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="w-[120px] h-9" aria-hidden />;
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 text-muted-foreground hover:text-brand"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        aria-label="Toggle theme"
      >
        {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>

      <Select value={locale} onValueChange={(v) => setLocale(v as Locale)}>
        <SelectTrigger className="h-9 w-[110px] border-white/10 bg-transparent text-xs">
          <Globe className="h-3.5 w-3.5 mr-1 shrink-0 text-brand" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(localeLabels) as Locale[]).map((code) => (
            <SelectItem key={code} value={code} className="text-xs">
              {localeLabels[code]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
