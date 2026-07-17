"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Banner = {
  id: string;
  title: string;
  subtitle: string | null;
  linkUrl: string | null;
  isActive: boolean;
};

export function AdminBannerManager({ banners }: { banners: Banner[] }) {
  const [form, setForm] = useState({ title: "", subtitle: "", linkUrl: "" });

  async function createBanner(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/admin/banners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    window.location.reload();
  }

  async function toggleBanner(id: string, isActive: boolean) {
    await fetch("/api/admin/banners", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isActive: !isActive }),
    });
    window.location.reload();
  }

  async function deleteBanner(id: string) {
    await fetch("/api/admin/banners", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    window.location.reload();
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Add banner</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={createBanner} className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Subtitle</Label>
              <Input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Link URL</Label>
              <Input value={form.linkUrl} onChange={(e) => setForm({ ...form, linkUrl: e.target.value })} placeholder="/search" />
            </div>
            <Button type="submit">Create banner</Button>
          </form>
        </CardContent>
      </Card>
      <div className="space-y-2">
        {banners.map((banner) => (
          <div key={banner.id} className="flex items-center justify-between p-3 border rounded-lg gap-4">
            <div>
              <div className="font-medium">{banner.title}</div>
              {banner.subtitle && <div className="text-sm text-muted-foreground">{banner.subtitle}</div>}
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => toggleBanner(banner.id, banner.isActive)}>
                {banner.isActive ? "Hide" : "Show"}
              </Button>
              <Button size="sm" variant="destructive" onClick={() => deleteBanner(banner.id)}>Delete</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
