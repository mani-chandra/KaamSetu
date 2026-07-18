"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card3D } from "@/components/3d/card-3d";

type City = { id: string; name: string; state: string | null; isActive: boolean; _count?: { serviceAreas: number } };

export function AdminCityManager({ cities: initial }: { cities: City[] }) {
  const [cities, setCities] = useState(initial);
  const [form, setForm] = useState({ name: "", state: "" });

  async function createCity(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/cities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const data = await res.json();
      setCities((prev) => [...prev, { ...data.city, _count: { serviceAreas: 0 } }]);
      setForm({ name: "", state: "" });
    }
  }

  async function toggle(id: string, isActive: boolean) {
    await fetch("/api/admin/cities", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isActive: !isActive }),
    });
    setCities((prev) => prev.map((c) => (c.id === id ? { ...c, isActive: !isActive } : c)));
  }

  return (
    <div className="space-y-6">
      <Card3D className="p-6">
        <form onSubmit={createCity} className="flex flex-wrap gap-3">
          <Input placeholder="City name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input placeholder="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
          <Button type="submit">Add city</Button>
        </form>
      </Card3D>
      <div className="space-y-2">
        {cities.map((city) => (
          <Card3D key={city.id} className="p-4 flex justify-between items-center text-sm">
            <span>{city.name}{city.state ? `, ${city.state}` : ""} · {city._count?.serviceAreas ?? 0} areas</span>
            <Button size="sm" variant="outline" onClick={() => toggle(city.id, city.isActive)}>
              {city.isActive ? "Deactivate" : "Activate"}
            </Button>
          </Card3D>
        ))}
      </div>
    </div>
  );
}
