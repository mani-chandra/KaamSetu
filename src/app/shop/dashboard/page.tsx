import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  ShopDashboardHome,
  ShopDashboardNotFound,
  ShopDashboardPendingReview,
} from "@/components/dashboard/shop-dashboard-home";

export default async function ShopDashboardPage() {
  const session = await requireAuth(["SHOP_OWNER"]);
  const shop = await prisma.shopProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      categories: { select: { name: true } },
      categoryGroup: { select: { name: true } },
    },
  });

  if (!shop) {
    return <ShopDashboardNotFound />;
  }

  if (shop.status === "PENDING") {
    return <ShopDashboardPendingReview />;
  }

  return (
    <ShopDashboardHome
      userName={session.user.name}
      shop={{
        shopName: shop.shopName,
        slug: shop.slug,
        status: shop.status,
        city: shop.city,
        address: shop.address,
        isVerified: shop.isVerified,
        categories: shop.categories,
        categoryGroup: shop.categoryGroup,
      }}
    />
  );
}
