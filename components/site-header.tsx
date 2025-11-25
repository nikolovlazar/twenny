import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-2xl font-bold text-zinc-900">
          Twenny
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            href="/events"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
          >
            Browse Events
          </Link>
          <Link
            href="/admin"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
          >
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}

