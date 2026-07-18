import { redirect } from "next/navigation";

export default async function BookProRedirectPage({
  params,
  searchParams,
}: {
  params: Promise<{ proId: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const { proId } = await params;
  const { category } = await searchParams;
  const query = new URLSearchParams({ pro: proId });
  if (category) query.set("category", category);
  redirect(`/book?${query.toString()}`);
}
