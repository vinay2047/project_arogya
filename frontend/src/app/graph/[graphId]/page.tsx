import InteractiveMedicalGraph from '@/components/graph/InteractiveMedicalGraph';

export default async function GraphPage({
  params,
}: {
  params: Promise<{ graphId: string }>;
}) {
  const { graphId } = await params;

  return (
    <main className="container mx-auto py-10">
      <InteractiveMedicalGraph graphId={graphId} />
    </main>
  );
}
