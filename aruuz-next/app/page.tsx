import Link from 'next/link';

export default function Home() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 text-center">
      <h1 className="text-5xl font-bold urdu mb-4" style={{ direction: 'rtl' }}>آروز</h1>
      <p className="text-lg text-gray-600 mb-2">Urdu and Arabic classical poetry meter analysis</p>
      <p className="text-base text-gray-500 mb-10 urdu" style={{ direction: 'rtl' }}>اردو شاعری کا تقطیع اور وزن شناسی</p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/taqti" className="bg-green-700 text-white px-8 py-4 rounded-lg hover:bg-green-800 transition-colors">
          <div className="urdu text-lg" style={{ direction: 'rtl' }}>تقطیع کریں</div>
          <div className="text-sm opacity-80 mt-1">Analyze Poetry Meter</div>
        </Link>
        <Link href="/examples" className="border-2 border-green-700 text-green-700 px-8 py-4 rounded-lg hover:bg-green-50 transition-colors">
          <div className="urdu text-lg" style={{ direction: 'rtl' }}>امثلہ</div>
          <div className="text-sm mt-1">Browse Examples</div>
        </Link>
      </div>
    </div>
  );
}
