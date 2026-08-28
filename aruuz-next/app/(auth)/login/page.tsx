'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await signIn('credentials', { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError('ای میل یا پاسورد غلط ہے');
    } else {
      router.push('/');
    }
  }

  return (
    <div className="max-w-md mx-auto mt-16 p-8 bg-white rounded-xl shadow-lg urdu">
      <h1 className="text-2xl font-bold mb-6 text-center text-green-800">لاگ ان</h1>
      {error && <p className="text-red-600 mb-4 text-center">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">ای میل</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full border rounded px-3 py-2 text-left" dir="ltr" />
        </div>
        <div>
          <label className="block text-sm mb-1">پاسورڈ</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full border rounded px-3 py-2 text-left" dir="ltr" />
        </div>
        <button type="submit" disabled={loading} className="w-full bg-green-700 text-white py-2 rounded hover:bg-green-800 disabled:opacity-50">
          {loading ? '...' : 'داخل ہوں'}
        </button>
      </form>
      <div className="my-4 text-center text-gray-500">یا</div>
      <button onClick={() => signIn('google', { callbackUrl: '/' })} className="w-full border border-gray-300 py-2 rounded hover:bg-gray-50">
        Google سے لاگ ان
      </button>
      <p className="mt-6 text-center text-sm">کھاتہ نہیں؟ <Link href="/register" className="text-green-700 underline">رجسٹر کریں</Link></p>
    </div>
  );
}
