'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreatePage() {
  const router = useRouter();
  const [form, setForm] = useState({ title: '', poet: '', type: '0', text: '', meters: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const TYPE_OPTIONS = [
    { value: '0', label: 'غزل' }, { value: '1', label: 'نظم' }, { value: '2', label: 'رباعی' },
    { value: '3', label: 'قطعہ' }, { value: '4', label: 'آزاد نظم' }, { value: '5', label: 'شعر' },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/poetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Save failed');
      router.push(`/taqti?id=${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold urdu text-right mb-8" style={{ direction: 'rtl' }}>شعر لکھیں</h1>
      <form onSubmit={handleSubmit} className="space-y-5" dir="rtl">
        <div>
          <label className="block text-sm font-medium urdu mb-1">عنوان</label>
          <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full border border-gray-300 rounded px-3 py-2 urdu" required />
        </div>
        <div>
          <label className="block text-sm font-medium urdu mb-1">شاعر</label>
          <input value={form.poet} onChange={e => setForm(f => ({ ...f, poet: e.target.value }))} className="w-full border border-gray-300 rounded px-3 py-2 urdu" required />
        </div>
        <div>
          <label className="block text-sm font-medium urdu mb-1">نوع</label>
          <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="w-full border border-gray-300 rounded px-3 py-2 urdu">
            {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium urdu mb-1">متن</label>
          <textarea value={form.text} onChange={e => setForm(f => ({ ...f, text: e.target.value }))} rows={8} className="w-full border border-gray-300 rounded px-3 py-2 urdu" required />
        </div>
        <div>
          <label className="block text-sm font-medium urdu mb-1">بحر</label>
          <input value={form.meters} onChange={e => setForm(f => ({ ...f, meters: e.target.value }))} className="w-full border border-gray-300 rounded px-3 py-2 urdu" required />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button type="submit" disabled={loading} className="bg-green-700 text-white px-6 py-2 rounded hover:bg-green-800 disabled:opacity-50">
          {loading ? 'Saving...' : 'محفوظ کریں'}
        </button>
      </form>
    </div>
  );
}
