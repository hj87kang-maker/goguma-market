import Link from "next/link";
import { signOutAction } from "@/app/auth/actions";

export function SiteHeader({ nickname }: { nickname: string | null }) {
  return (
    <header className="border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-bold text-brand-600 dark:text-brand-400">
          고구마마켓
        </Link>

        {nickname ? (
          <div className="flex items-center gap-3 text-sm">
            <span className="text-neutral-600 dark:text-neutral-300">{nickname}님</span>
            <form action={signOutAction}>
              <button
                type="submit"
                className="text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-100"
              >
                로그아웃
              </button>
            </form>
          </div>
        ) : (
          <Link
            href="/login"
            className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
          >
            로그인
          </Link>
        )}
      </div>
    </header>
  );
}
