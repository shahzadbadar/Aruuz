export default function ResourcesPage() {
  return (
    <div className="max-w-3xl mx-auto py-8 px-4 urdu">
      <h1 className="text-2xl font-bold text-green-800 mb-6">وسائل</h1>
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3 text-green-700">آروز کیا ہے؟</h2>
        <p className="text-gray-700 leading-8">آروز (عروض) کلاسیکی اردو اور فارسی شاعری میں بحر کے اصول و ضوابط کا علم ہے۔</p>
      </section>
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3 text-green-700">کوڈ کی علامات</h2>
        <table className="w-full border-collapse text-sm">
          <thead><tr className="bg-green-50"><th className="border px-3 py-2">علامت</th><th className="border px-3 py-2">مطلب</th></tr></thead>
          <tbody>
            <tr><td className="border px-3 py-2 text-center font-mono" dir="ltr">-</td><td className="border px-3 py-2">مختصر (لغو)</td></tr>
            <tr><td className="border px-3 py-2 text-center font-mono" dir="ltr">=</td><td className="border px-3 py-2">طویل (مد)</td></tr>
            <tr><td className="border px-3 py-2 text-center font-mono" dir="ltr">x</td><td className="border px-3 py-2">متغیر (لغو یا مد)</td></tr>
          </tbody>
        </table>
      </section>
    </div>
  );
}
