"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card3D } from "@/components/3d/card-3d";
import { asStringArray } from "@/lib/utils";

type Page = {
  categoryId: string;
  headline: string | null;
  content: string | null;
  pricingGuidance: string | null;
  whatsIncluded: unknown;
  faq: unknown;
  category: { name: string; slug: string };
};

export function AdminServicePageManager({ pages: initial }: { pages: Page[] }) {
  const [pages, setPages] = useState(initial);
  const [selected, setSelected] = useState(initial[0]?.categoryId || "");
  const page = pages.find((p) => p.categoryId === selected);

  async function save() {
    if (!page) return;
    const res = await fetch("/api/admin/service-pages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        categoryId: page.categoryId,
        headline: page.headline,
        content: page.content,
        pricingGuidance: page.pricingGuidance,
        whatsIncluded: asStringArray(page.whatsIncluded),
      }),
    });
    if (res.ok) alert("Saved!");
  }

  function update(field: string, value: string) {
    setPages((prev) => prev.map((p) => (p.categoryId === selected ? { ...p, [field]: value } : p)));
  }

  if (!page) return null;

  return (
    <div className="space-y-4">
      <select
        className="glass-panel rounded-md px-3 py-2 text-sm w-full max-w-xs"
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
      >
        {pages.map((p) => (
          <option key={p.categoryId} value={p.categoryId}>{p.category.name}</option>
        ))}
      </select>
      <Card3D className="p-6 space-y-4">
        <Input placeholder="Headline" value={page.headline || ""} onChange={(e) => update("headline", e.target.value)} />
        <Textarea placeholder="Content" value={page.content || ""} onChange={(e) => update("content", e.target.value)} rows={4} />
        <Textarea placeholder="Pricing guidance" value={page.pricingGuidance || ""} onChange={(e) => update("pricingGuidance", e.target.value)} rows={2} />
        <Button onClick={save}>Save service page</Button>
      </Card3D>
    </div>
  );
}
