import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
      <div className="mx-auto flex h-14 max-w-5xl items-center px-4">
        <Link href="/" className="text-lg font-bold text-brand-600 dark:text-brand-400">
          고구마마켓
        </Link>
      </div>
    </header>
  );
}
