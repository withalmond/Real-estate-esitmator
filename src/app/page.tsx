import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-6 px-6 py-12">
      <h1 className="text-center text-3xl font-semibold tracking-tight text-slate-900">
        Real Estate Estimator
      </h1>
      <p className="text-center text-slate-600">
        Document property details room by room with photos and notes.
      </p>
      <Link
        href="/walkthrough/new"
        className="rounded-xl bg-blue-600 px-6 py-3 font-medium text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98]"
      >
        Start Property Walkthrough
      </Link>
    </main>
  );
}
