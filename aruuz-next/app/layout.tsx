import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Aruuz - Urdu Poetry Meter Analysis',
  description: 'Classical Urdu and Arabic poetry scansion (taqti) and meter identification tool',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ur" dir="rtl">
      <body className="min-h-screen flex flex-col bg-white text-gray-900">
        <header className="bg-green-800 text-white px-6 py-3 flex items-center justify-between">
          <a href="/" className="text-xl font-bold urdu">آروز</a>
          <nav className="flex gap-4 text-sm urdu">
            <a href="/taqti" className="hover:underline">تقطیع</a>
            <a href="/examples" className="hover:underline">امثلہ</a>
            <a href="/create" className="hover:underline">شعر لکھیں</a>
          </nav>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="bg-gray-100 text-center text-xs text-gray-500 py-3">
          © Aruuz — Urdu Poetry Meter Analysis
        </footer>
      </body>
    </html>
  );
}
