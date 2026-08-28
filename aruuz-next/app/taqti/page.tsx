'use client';
import { useState } from 'react';
import type { ScanOutput } from '@/lib/scansion/types';

export default function TaqtiPage() {
  const [text, setText] = useState('');
  const [freeVerse, setFreeVerse] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ScanOutput[]>([]);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    setError('');
    setResults([]);
    try {
      const res = await fetch('/api/taqti', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, isChecked: freeVerse }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Analysis failed');
      setResults(data.results ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold urdu mb-6 text-right" style={{ direction: 'rtl' }}>تقطیع</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="یہاں شعر لکھیں..."
          rows={6}
          className="w-full border border-gray-300 rounded-lg p-4 urdu text-right focus:outline-none focus:ring-2 focus:ring-green-600"
          style={{ direction: 'rtl' }}
        />
        <div className="flex items-center gap-3">
          <input type="checkbox" id="freeVerse" checked={freeVerse} onChange={e => setFreeVerse(e.target.checked)} className="w-4 h-4" />
          <label htmlFor="freeVerse" className="text-sm text-gray-600 urdu" style={{ direction: 'rtl' }}>آزاد نظم (Free Verse)</label>
        </div>
        <button type="submit" disabled={loading || !text.trim()} className="bg-green-700 text-white px-6 py-2 rounded-lg hover:bg-green-800 disabled:opacity-50 transition-colors">
          {loading ? 'Analyzing...' : 'تقطیع کریں'}
        </button>
      </form>
      {error && <p className="mt-4 text-red-600 text-sm">{error}</p>}
      {results.length > 0 && (
        <div className="mt-8 space-y-6">
          <h2 className="text-xl font-semibold text-gray-800">Results</h2>
          {results.map((r, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-5 bg-gray-50">
              <div className="urdu text-right text-lg mb-2" style={{ direction: 'rtl' }}>{r.meterName}</div>
              <div className="text-sm text-gray-500 mb-3">{r.feet}</div>
              <div className="urdu text-right text-base" style={{ direction: 'rtl' }}>{r.originalLine}</div>
              <div className="flex flex-wrap gap-2 mt-3 justify-end" dir="rtl">
                {r.words.map((w, wi) => (
                  <div key={wi} className="text-center bg-white border border-gray-200 rounded px-2 py-1">
                    <div className="urdu text-sm">{w.word}</div>
                    <div className="text-xs text-green-700 font-mono">{r.wordTaqti[wi]}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
