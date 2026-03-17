import { PlaceHubClient } from "@/components/places/PlaceHubClient";
import { buildPlaceHubs, demoPlaceMemories } from "@/features/place-hubs/utils";

export function generateStaticParams() {
  return buildPlaceHubs(demoPlaceMemories).map((hub) => ({
    slug: hub.slug,
  }));
}

export default async function PlaceHubPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <PlaceHubClient slug={slug} />;
}
