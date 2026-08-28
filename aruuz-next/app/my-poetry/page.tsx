'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Poem { id: number; title: string; url: string | null; mozun: number; publish: number; }

export default function MyPoetryPage() {
  const [poems, setPoems] = useState<Poem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/my-poetry').then(r => r.json()).then(data => {
      if (data.error) setError(data.error);
      else setPoems(data.poems ?? []);
      setLoading(false);
    }).catch(() => { setError('خطا ہوئی'); setLoading(false); });
  }, []);

  if (loading) return <div className="urdu text-center mt-20">لوڈ ہو رہا ہے...</div>;
  if (error) return <div className="urdu text-center mt-20"><p className="text-red-600 mb-4">{error}</p><Link href="/login" className="bg-green-700 text-white px-4 py-2 rounded">لاگ ان کریں</Link></div>;

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 urdu">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-green-800">میری شاعری</h1>
        <Link href="/create" className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800">نیا شعر</Link>
      </div>
      {poems.length === 0 ? (
        <p className="text-center text-gray-500 mt-16">ابھی تک کوئی شعر نہیں۔ <Link href="/create" className="text-green-700 underline">نیا شعر لکھیں</Link></p>
      ) : (
        <div className="space-y-3">
          {poems.map(poem => (
            <div key={poem.id} className="border rounded-lg p-4 bg-white shadow-sm flex justify-between items-start">
              <div>
                <p className="font-bold text-lg">{poem.title}</p>
                <div className="flex gap-3 mt-1 text-xs text-gray-500">
                  <span>{poem.mozun ? 'موزوں' : 'غیر موزوں'}</span>
                  <span>{poem.publish ? 'شائع' : 'مسودہ'}</span>
                </div>
              </div>
              {poem.url && <Link href={`/taqti?url=${encodeURIComponent(poem.url)}`} className="text-green-700 underline text-sm shrink-0 mr-4">تقطیع</Link>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
