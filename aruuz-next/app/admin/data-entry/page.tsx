'use client';
import { useState } from 'react';

export default function AdminDataEntryPage() {
  const [title, setTitle] = useState('');
  const [poet, setPoet] = useState('');
  const [type, setType] = useState('0');
  const [text, setText] = useState('');
  const [meters, setMeters] = useState('');
  const [searchString, setSearchString] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    const res = await fetch('/api/admin/poetry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, poet, type, text, meters, searchString }),
    });
    const data = await res.json();
    if (res.ok) {
      setStatus('success');
      setMessage(`شعر محفوظ ہو گیا — ID: ${data.id}`);
      setTitle(''); setPoet(''); setText(''); setMeters(''); setSearchString('');
    } else {
      setStatus('error');
      setMessage(data.error || 'خطا ہوئی');
    }
  }

  return (
    <div className="max-w-2xl mx-auto mt-8 p-8 bg-white rounded-xl shadow-lg urdu">
      <h1 className="text-2xl font-bold mb-6 text-green-800">ڈیٹا داخل کریں (ایڈمن)</h1>
      {message && <p className={`mb-4 p-3 rounded ${status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'}`}>{message}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm mb-1">عنوان *</label><input value={title} onChange={e => setTitle(e.target.value)} required className="w-full border rounded px-3 py-2" /></div>
          <div><label className="block text-sm mb-1">شاعر *</label><input value={poet} onChange={e => setPoet(e.target.value)} required className="w-full border rounded px-3 py-2" /></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm mb-1">قسم</label><select value={type} onChange={e => setType(e.target.value)} className="w-full border rounded px-3 py-2"><option value="0">غزل</option><option value="1">نظم</option><option value="2">رباعی</option></select></div>
          <div><label className="block text-sm mb-1">بحر *</label><input value={meters} onChange={e => setMeters(e.target.value)} required className="w-full border rounded px-3 py-2 text-left" dir="ltr" /></div>
        </div>
        <div><label className="block text-sm mb-1">متن *</label><textarea value={text} onChange={e => setText(e.target.value)} required rows={8} className="w-full border rounded px-3 py-2" /></div>
        <div><label className="block text-sm mb-1">تلاش کا متن</label><input value={searchString} onChange={e => setSearchString(e.target.value)} className="w-full border rounded px-3 py-2" /></div>
        <button type="submit" disabled={status === 'loading'} className="w-full bg-green-700 text-white py-2 rounded hover:bg-green-800 disabled:opacity-50">
          {status === 'loading' ? 'محفوظ ہو رہا ہے...' : 'محفوظ کریں'}
        </button>
      </form>
    </div>
  );
}
