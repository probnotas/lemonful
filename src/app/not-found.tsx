import Link from "next/link";
export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-cream p-6 text-center">
      <div><p className="text-7xl">🍋</p><h1 className="mt-3 text-4xl">We couldn&apos;t find that page</h1><Link href="/" className="btn-coral mt-6">Back to Lemonful</Link></div>
    </div>
  );
}
