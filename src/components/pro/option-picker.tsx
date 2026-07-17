"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type OptionPickerProps = {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  emptyMessage?: string;
};

export function OptionPicker({
  label,
  options,
  selected,
  onChange,
  emptyMessage = "Select a city or service category first to see options.",
}: OptionPickerProps) {
  function toggle(option: string) {
    if (selected.includes(option)) {
      onChange(selected.filter((s) => s !== option));
    } else {
      onChange([...selected, option]);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        {selected.length > 0 && (
          <span className="text-xs text-muted-foreground">{selected.length} selected</span>
        )}
      </div>
      {options.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
          {options.map((option) => {
            const isSelected = selected.includes(option);
            return (
              <button
                key={option}
                type="button"
                onClick={() => toggle(option)}
                className={cn(
                  "text-left text-sm px-3 py-2 rounded-md border transition-colors",
                  isSelected
                    ? "border-brand bg-brand/10 text-brand font-medium"
                    : "border-input hover:bg-slate-50"
                )}
              >
                {option}
              </button>
            );
          })}
        </div>
      )}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {selected.map((item) => (
            <Badge key={item} variant="secondary" className="cursor-pointer" onClick={() => toggle(item)}>
              {item} ×
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
