"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Category = { id: string; name: string; slug: string };
type City = { id: string; name: string };

type Skill = {
  id: string;
  name: string;
  categoryId: string | null;
  isActive: boolean;
  category: Category | null;
};

type ServiceArea = {
  id: string;
  name: string;
  cityId: string;
  isActive: boolean;
  city: City;
};

type Language = {
  id: string;
  name: string;
  isActive: boolean;
};

type Props = {
  skills: Skill[];
  serviceAreas: ServiceArea[];
  languages: Language[];
  categories: Category[];
  cities: City[];
};

export function AdminProOptionsManager({
  skills: initialSkills,
  serviceAreas: initialAreas,
  languages: initialLanguages,
  categories,
  cities,
}: Props) {
  const [skills, setSkills] = useState(initialSkills);
  const [serviceAreas, setServiceAreas] = useState(initialAreas);
  const [languages, setLanguages] = useState(initialLanguages);
  const [message, setMessage] = useState("");
  const [skillForm, setSkillForm] = useState({ name: "", categoryId: "common" });
  const [areaForm, setAreaForm] = useState({ name: "", cityId: cities[0]?.id ?? "" });
  const [languageForm, setLanguageForm] = useState({ name: "" });
  const [skillFilter, setSkillFilter] = useState("all");

  async function createSkill(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/pro-options", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "skill",
        name: skillForm.name,
        categoryId: skillForm.categoryId === "common" ? null : skillForm.categoryId,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setSkills((prev) => [...prev, data.item]);
      setSkillForm({ name: "", categoryId: skillForm.categoryId });
      setMessage("Skill added");
    }
  }

  async function createArea(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/pro-options", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "serviceArea", name: areaForm.name, cityId: areaForm.cityId }),
    });
    if (res.ok) {
      const data = await res.json();
      setServiceAreas((prev) => [...prev, data.item]);
      setAreaForm({ name: "", cityId: areaForm.cityId });
      setMessage("Service area added");
    }
  }

  async function createLanguage(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/pro-options", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "language", name: languageForm.name }),
    });
    if (res.ok) {
      const data = await res.json();
      setLanguages((prev) => [...prev, data.item]);
      setLanguageForm({ name: "" });
      setMessage("Language added");
    }
  }

  async function toggleSkill(id: string, isActive: boolean) {
    const res = await fetch("/api/admin/pro-options", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "skill", id, isActive: !isActive }),
    });
    if (res.ok) {
      const data = await res.json();
      setSkills((prev) => prev.map((s) => (s.id === id ? data.item : s)));
    }
  }

  async function toggleArea(id: string, isActive: boolean) {
    const res = await fetch("/api/admin/pro-options", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "serviceArea", id, isActive: !isActive }),
    });
    if (res.ok) {
      const data = await res.json();
      setServiceAreas((prev) => prev.map((a) => (a.id === id ? data.item : a)));
    }
  }

  async function toggleLanguage(id: string, isActive: boolean) {
    const res = await fetch("/api/admin/pro-options", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "language", id, isActive: !isActive }),
    });
    if (res.ok) {
      const data = await res.json();
      setLanguages((prev) => prev.map((l) => (l.id === id ? data.item : l)));
    }
  }

  async function deleteItem(type: "skill" | "serviceArea" | "language", id: string) {
    const res = await fetch(`/api/admin/pro-options?type=${type}&id=${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error || "Delete failed");
      return;
    }
    if (type === "skill") setSkills((prev) => prev.filter((s) => s.id !== id));
    if (type === "serviceArea") setServiceAreas((prev) => prev.filter((a) => a.id !== id));
    if (type === "language") setLanguages((prev) => prev.filter((l) => l.id !== id));
    setMessage("Deleted");
  }

  const filteredSkills = skills.filter((skill) => {
    if (skillFilter === "all") return true;
    if (skillFilter === "common") return !skill.categoryId;
    return skill.categoryId === skillFilter;
  });

  const filteredAreas = serviceAreas.filter((a) => !areaForm.cityId || a.cityId === areaForm.cityId);

  return (
    <div className="space-y-4">
      {message && <p className="text-sm text-brand">{message}</p>}
      <p className="text-sm text-muted-foreground">
        Manage the predefined lists pros pick from. Each service category name is always included as a skill automatically.
      </p>

      <Tabs defaultValue="skills">
        <TabsList>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="areas">Service areas</TabsTrigger>
          <TabsTrigger value="languages">Languages</TabsTrigger>
        </TabsList>

        <TabsContent value="skills" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle>Add skill</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={createSkill} className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2 sm:col-span-2">
                  <Label>Skill name</Label>
                  <Input
                    value={skillForm.name}
                    onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={skillForm.categoryId}
                    onValueChange={(v) => setSkillForm({ ...skillForm, categoryId: v })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="common">Common (all services)</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit">Add skill</Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <Label>Filter by category</Label>
            <Select value={skillFilter} onValueChange={setSkillFilter}>
              <SelectTrigger className="max-w-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All skills</SelectItem>
                <SelectItem value="common">Common skills</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredSkills.map((skill) => (
              <div key={skill.id} className="flex items-center justify-between p-3 border rounded-lg text-sm">
                <div>
                  <span className="font-medium">{skill.name}</span>
                  <span className="text-muted-foreground ml-2">
                    ({skill.category?.name ?? "Common"})
                    {skill.category && skill.name === skill.category.name && " · service name"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => toggleSkill(skill.id, skill.isActive)}>
                    {skill.isActive ? "Deactivate" : "Activate"}
                  </Button>
                  {!(skill.category && skill.name === skill.category.name) && (
                    <Button size="sm" variant="ghost" onClick={() => deleteItem("skill", skill.id)}>
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="areas" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle>Add service area</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={createArea} className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Select value={areaForm.cityId} onValueChange={(v) => setAreaForm({ ...areaForm, cityId: v })}>
                    <SelectTrigger><SelectValue placeholder="Select city" /></SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city.id} value={city.id}>{city.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Area name</Label>
                  <Input
                    value={areaForm.name}
                    onChange={(e) => setAreaForm({ ...areaForm, name: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit">Add area</Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredAreas.map((area) => (
              <div key={area.id} className="flex items-center justify-between p-3 border rounded-lg text-sm">
                <span><span className="font-medium">{area.name}</span> · {area.city.name}</span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => toggleArea(area.id, area.isActive)}>
                    {area.isActive ? "Deactivate" : "Activate"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => deleteItem("serviceArea", area.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="languages" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle>Add language</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={createLanguage} className="flex gap-4">
                <Input
                  value={languageForm.name}
                  onChange={(e) => setLanguageForm({ name: e.target.value })}
                  placeholder="Language name"
                  required
                  className="max-w-xs"
                />
                <Button type="submit">Add language</Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {languages.map((lang) => (
              <div key={lang.id} className="flex items-center justify-between p-3 border rounded-lg text-sm">
                <span className="font-medium">{lang.name}</span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => toggleLanguage(lang.id, lang.isActive)}>
                    {lang.isActive ? "Deactivate" : "Activate"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => deleteItem("language", lang.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
