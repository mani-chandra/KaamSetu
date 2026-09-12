"use client";

import { useI18n } from "@/lib/i18n/context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShopAdminActions } from "@/components/admin/shop-admin-actions";
import { ProDocumentsViewer } from "@/components/admin/pro-documents-viewer";
import { asStringArray } from "@/lib/utils";

type ShopItem = {
  id: string;
  status: string;
  shopName: string;
  slug: string;
  description: string | null;
  address: string | null;
  city: string | null;
  documentUrls: unknown;
  user: { name: string | null; email: string; phone: string | null };
  categoryGroup: { name: string };
  categories: { name: string }[];
};

export function AdminShopsList({ shops }: { shops: ShopItem[] }) {
  const { t } = useI18n();

  if (shops.length === 0) {
    return <p className="text-muted-foreground text-sm">{t.admin.noShops}</p>;
  }

  return (
    <div className="space-y-4">
      {shops.map((shop) => {
        const documents = asStringArray(shop.documentUrls);

        return (
          <Card key={shop.id}>
            <CardHeader className="flex flex-row justify-between pb-2">
              <div>
                <CardTitle className="text-lg">{shop.shopName}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {shop.user.name} · {shop.user.email}
                  {shop.city ? ` · ${shop.city}` : ""}
                </p>
                <p className="text-xs text-muted-foreground">/{shop.slug}</p>
              </div>
              <Badge
                className={
                  shop.status === "APPROVED"
                    ? "bg-green-100 text-green-800"
                    : shop.status === "PENDING"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                }
              >
                {shop.status}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              {shop.description && (
                <p className="text-sm text-muted-foreground">{shop.description}</p>
              )}
              {shop.address && (
                <p className="text-sm">{shop.address}</p>
              )}
              <p className="text-sm">
                {t.shopRegister.categoryGroup}: {shop.categoryGroup.name}
              </p>
              <p className="text-sm">
                {t.admin.servicesLabel} {shop.categories.map((c) => c.name).join(", ")}
              </p>

              <ProDocumentsViewer documentUrls={documents} />

              <ShopAdminActions shopId={shop.id} status={shop.status} />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
