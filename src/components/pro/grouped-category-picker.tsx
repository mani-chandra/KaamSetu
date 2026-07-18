"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { getServiceIcon } from "@/lib/service-icons";
import { useI18n } from "@/lib/i18n/context";

type Category = { id: string; name: string; slug: string; icon?: string | null };
type Group = {
  id?: string;
  name: string;
  slug: string;
  icon?: string | null;
  categories: Category[];
};

type GroupedCategoryPickerProps = {
  groups: Group[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  hint?: string;
};

export function GroupedCategoryPicker({
  groups,
  selectedIds,
  onChange,
  hint,
}: GroupedCategoryPickerProps) {
  const { t } = useI18n();
  const [openSlug, setOpenSlug] = useState<string | null>(groups[0]?.slug ?? null);
  const [query, setQuery] = useState("");

  function toggle(id: string) {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((x) => x !== id)
        : [...selectedIds, id]
    );
  }

  const filtered = groups
    .map((g) => ({
      ...g,
      categories: g.categories.filter(
        (c) =>
          !query ||
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          g.name.toLowerCase().includes(query.toLowerCase())
      ),
    }))
    .filter((g) => g.categories.length > 0);

  return (
    <div className="space-y-3">
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      <input
        type="search"
        placeholder={t.proRegister.searchServices}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm"
      />
      <p className="text-xs text-brand font-medium">{selectedIds.length} {t.common.selected}</p>
      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
        {filtered.map((group) => {
          const isOpen = openSlug === group.slug || query.length > 0;
          const groupSelected = group.categories.filter((c) => selectedIds.includes(c.id)).length;
          return (
            <div key={group.slug} className="glass-panel rounded-xl border border-white/10 overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenSlug(isOpen && !query ? null : group.slug)}
                className="w-full flex items-center justify-between gap-2 p-3 text-left hover:bg-white/5"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xl shrink-0">{group.icon || "📁"}</span>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{group.name}</p>
                    {groupSelected > 0 && (
                      <p className="text-xs text-brand">{groupSelected} {t.common.selected}</p>
                    )}
                  </div>
                </div>
                <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform", isOpen && "rotate-180")} />
              </button>
              {isOpen && (
                <div className="px-3 pb-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {group.categories.map((cat) => (
                    <label
                      key={cat.id}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-lg border cursor-pointer text-sm transition-colors",
                        selectedIds.includes(cat.id)
                          ? "border-brand bg-brand/10"
                          : "border-white/10 hover:border-brand/30"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(cat.id)}
                        onChange={() => toggle(cat.id)}
                        className="shrink-0"
                      />
                      <span className="text-base shrink-0">{getServiceIcon(cat.slug, cat.icon)}</span>
                      <span className="leading-tight">{cat.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
