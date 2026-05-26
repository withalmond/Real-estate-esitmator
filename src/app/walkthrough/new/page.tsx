import Link from "next/link";
import { PropertyWalkthroughForm } from "@/components/walkthrough/PropertyWalkthroughForm";

export const metadata = {
  title: "Property Walkthrough | Real Estate Estimator",
  description: "Document a property room by room with photos, dimensions, and notes.",
};

export default function NewWalkthroughPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link
            href="/"
            className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
          >
            ← Home
          </Link>
          <h1 className="text-center text-base font-semibold text-slate-900 sm:text-lg">
            Property Walkthrough
          </h1>
          <span className="w-12" aria-hidden />
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6 pb-16 sm:px-6 sm:py-8">
        <p className="mb-6 text-sm text-slate-600">
          Walk the property on your phone or iPad. Enter the address, then add rooms with
          dimensions, dictated notes, and camera photos.
        </p>
        <PropertyWalkthroughForm />
      </main>
    </div>
  );
}
