import AdminTripDetail from "./AdminTripDetail";

export const metadata = { title: "Trip Analytics" };
export const dynamic = "force-dynamic";

export default async function AdminTripPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <AdminTripDetail slug={slug} />;
}
