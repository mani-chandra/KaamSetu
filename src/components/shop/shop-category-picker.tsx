"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { getServiceIcon } from "@/lib/service-icons";
import { useI18n } from "@/lib/i18n/context";

type Category = { id: string; name: string; slug: string; icon?: string | null };
type CategoryGroup = {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  categories: Category[];
};

type ShopCategoryPickerProps = {
  groups: CategoryGroup[];
  selectedGroupId: string;
  selectedCategoryIds: string[];
  onGroupChange: (groupId: string) => void;
  onCategoriesChange: (ids: string[]) => void;
};

export function ShopCategoryPicker({
  groups,
  selectedGroupId,
  selectedCategoryIds,
  onGroupChange,
  onCategoriesChange,
}: ShopCategoryPickerProps) {
  const { t } = useI18n();
  const [query, setQuery] = useState("");

  const selectedGroup = groups.find((g) => g.id === selectedGroupId);
  const categories = selectedGroup?.categories ?? [];

  const filteredCategories = categories.filter(
    (c) => !query || c.name.toLowerCase().includes(query.toLowerCase())
  );

  function toggleCategory(id: string) {
    onCategoriesChange(
      selectedCategoryIds.includes(id)
        ? selectedCategoryIds.filter((x) => x !== id)
        : [...selectedCategoryIds, id]
    );
  }

  function handleGroupChange(groupId: string) {
    onGroupChange(groupId);
    onCategoriesChange([]);
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-sm font-medium">{t.shopRegister.categoryGroup}</p>
        <p className="text-xs text-muted-foreground">{t.shopRegister.categoryGroupHint}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {groups.map((group) => (
            <button
              key={group.id}
              type="button"
              onClick={() => handleGroupChange(group.id)}
              className={cn(
                "flex items-center gap-2 p-3 rounded-lg border text-left text-sm transition-colors",
                selectedGroupId === group.id
                  ? "border-brand bg-brand/10"
                  : "border-white/10 hover:border-brand/30"
              )}
            >
              <span className="text-xl shrink-0">{group.icon || "📁"}</span>
              <span className="font-medium">{group.name}</span>
            </button>
          ))}
        </div>
      </div>

      {selectedGroup && (
        <div className="space-y-2">
          <p className="text-sm font-medium">{t.shopRegister.servicesOffer}</p>
          <p className="text-xs text-muted-foreground">{t.shopRegister.servicesHint}</p>
          <input
            type="search"
            placeholder={t.shopRegister.searchServices}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm"
          />
          <p className="text-xs text-brand font-medium">
            {selectedCategoryIds.length} {t.common.selected}
          </p>
          <div className="glass-panel rounded-xl border border-white/10 overflow-hidden">
            <div className="flex items-center justify-between gap-2 p-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-xl">{selectedGroup.icon || "📁"}</span>
                <p className="font-medium text-sm">{selectedGroup.name}</p>
              </div>
              <ChevronDown className="h-4 w-4 shrink-0 rotate-180" />
            </div>
            <div className="px-3 pb-3 pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
              {filteredCategories.map((cat) => (
                <label
                  key={cat.id}
                  className={cn(
                    "flex items-center gap-2 p-2 rounded-lg border cursor-pointer text-sm transition-colors",
                    selectedCategoryIds.includes(cat.id)
                      ? "border-brand bg-brand/10"
                      : "border-white/10 hover:border-brand/30"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selectedCategoryIds.includes(cat.id)}
                    onChange={() => toggleCategory(cat.id)}
                    className="shrink-0"
                  />
                  <span className="text-base shrink-0">{getServiceIcon(cat.slug, cat.icon)}</span>
                  <span className="leading-tight">{cat.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
