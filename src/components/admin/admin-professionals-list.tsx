"use client";

import { useI18n } from "@/lib/i18n/context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProAdminActions } from "@/components/admin/pro-admin-actions";
import { ProDocumentsViewer } from "@/components/admin/pro-documents-viewer";
import { asStringArray } from "@/lib/utils";

type ProItem = {
  id: string;
  status: string;
  bio: string | null;
  documentUrls: unknown;
  user: { name: string | null; email: string; city: string | null };
  services: { category: { name: string } }[];
};

export function AdminProfessionalsList({ professionals }: { professionals: ProItem[] }) {
  const { t } = useI18n();

  return (
    <div className="space-y-4">
      {professionals.map((pro) => {
        const documents = asStringArray(pro.documentUrls);

        return (
          <Card key={pro.id}>
            <CardHeader className="flex flex-row justify-between pb-2">
              <div>
                <CardTitle className="text-lg">{pro.user.name}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {pro.user.email} · {pro.user.city}
                </p>
              </div>
              <Badge
                className={
                  pro.status === "APPROVED"
                    ? "bg-green-100 text-green-800"
                    : pro.status === "PENDING"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                }
              >
                {pro.status}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{pro.bio}</p>
              <p className="text-sm">
                {t.admin.servicesLabel} {pro.services.map((s) => s.category.name).join(", ")}
              </p>

              <ProDocumentsViewer documentUrls={documents} />

              <ProAdminActions professionalId={pro.id} status={pro.status} />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
