'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || 'خطا ہوئی'); setLoading(false); return; }
    await signIn('credentials', { email, password, callbackUrl: '/' });
    router.push('/');
  }

  return (
    <div className="max-w-md mx-auto mt-16 p-8 bg-white rounded-xl shadow-lg urdu">
      <h1 className="text-2xl font-bold mb-6 text-center text-green-800">رجسٹریشن</h1>
      {error && <p className="text-red-600 mb-4 text-center">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">نام</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm mb-1">ای میل</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full border rounded px-3 py-2 text-left" dir="ltr" />
        </div>
        <div>
          <label className="block text-sm mb-1">پاسورڈ</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className="w-full border rounded px-3 py-2 text-left" dir="ltr" />
        </div>
        <button type="submit" disabled={loading} className="w-full bg-green-700 text-white py-2 rounded hover:bg-green-800 disabled:opacity-50">
          {loading ? '...' : 'رجسٹر کریں'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm">پہلے سے کھاتہ ہے؟ <Link href="/login" className="text-green-700 underline">لاگ ان</Link></p>
    </div>
  );
}
