import { PlaceHubClient } from "@/components/places/PlaceHubClient";

export const dynamic = "force-dynamic";

export default async function PlaceHubPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <PlaceHubClient slug={slug} />;
}
