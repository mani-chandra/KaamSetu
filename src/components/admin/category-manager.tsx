"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Category = {
  id: string;
  name: string;
  icon: string | null;
  description: string | null;
  isActive: boolean;
};

export function AdminCategoryManager({ categories }: { categories: Category[] }) {
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({ name: "", description: "", icon: "🔧" });

  async function createCategory(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setMessage("Category created!");
      window.location.reload();
    }
  }

  async function toggleActive(id: string, isActive: boolean) {
    await fetch("/api/admin/categories", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isActive: !isActive }),
    });
    window.location.reload();
  }

  return (
    <div className="space-y-6">
      {message && <p className="text-sm text-brand">{message}</p>}
      <Card>
        <CardHeader><CardTitle>Add category</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={createCategory} className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Icon (emoji)</Label>
              <Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Description</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <Button type="submit">Create category</Button>
          </form>
        </CardContent>
      </Card>
      <div className="space-y-2">
        {categories.map((cat) => (
          <div key={cat.id} className="flex items-center justify-between p-3 border rounded-lg">
            <span>{cat.icon} {cat.name}</span>
            <Button size="sm" variant="outline" onClick={() => toggleActive(cat.id, cat.isActive)}>
              {cat.isActive ? "Deactivate" : "Activate"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
