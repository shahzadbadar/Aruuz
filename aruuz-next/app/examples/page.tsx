import Link from 'next/link';

interface Poem {
  id: number;
  poet: string;
  title: string;
  type: number;
  meterID: string | null;
}

const TYPE_MAP: Record<number, string> = { 0: 'غزل', 1: 'نظم', 2: 'رباعی', 3: 'قطعہ', 4: 'آزاد نظم', 5: 'شعر' };

async function getPoems(page: number) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/poetry?page=${page}`, { cache: 'no-store' });
  if (!res.ok) return { poems: [], pagination: { currentPage: 1, maxPages: 1 } };
  return res.json();
}

export default async function ExamplesPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? '1'));
  const { poems, pagination } = await getPoems(page);

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold urdu text-right mb-8" style={{ direction: 'rtl' }}>امثلہ</h1>
      <div className="space-y-4">
        {poems.map((poem: Poem) => (
          <Link key={poem.id} href={`/taqti?id=${poem.id}`} className="block border border-gray-200 rounded-lg p-4 hover:bg-green-50 transition-colors">
            <div className="flex justify-between items-start" dir="rtl">
              <div>
                <div className="urdu font-semibold text-lg">{poem.title}</div>
                <div className="urdu text-sm text-gray-600 mt-1">{poem.poet}</div>
              </div>
              <div className="text-sm text-gray-400 urdu">{TYPE_MAP[poem.type] ?? ''}</div>
            </div>
            {poem.meterID && (
              <div className="urdu text-xs text-green-700 mt-2 text-right" style={{ direction: 'rtl' }}>
                {poem.meterID.split(/[,،]/).slice(0, 2).join(' | ')}
              </div>
            )}
          </Link>
        ))}
      </div>
      {poems.length === 0 && <p className="text-gray-500 text-center py-10">No poems found</p>}
      {pagination.maxPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {page > 1 && <Link href={`/examples?page=${page - 1}`} className="px-3 py-1 border rounded hover:bg-gray-100">←</Link>}
          <span className="px-3 py-1 bg-green-700 text-white rounded">{page}</span>
          {page < pagination.maxPages && <Link href={`/examples?page=${page + 1}`} className="px-3 py-1 border rounded hover:bg-gray-100">→</Link>}
        </div>
      )}
    </div>
  );
}
