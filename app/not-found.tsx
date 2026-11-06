import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <h2 className="text-2xl font-bold">Page Not Found</h2>
      <p className="mt-2 text-sm text-slate-500">The requested order or page does not exist.</p>
      <Link
        href="/"
        className="mt-4 rounded-xl bg-[#005b96] px-4 py-2 text-xs font-semibold text-white shadow hover:bg-[#004775]"
      >
        Return to ShopGuard Home
      </Link>
    </div>
  );
}
