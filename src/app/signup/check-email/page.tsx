import Link from "next/link";

export default function CheckEmailPage() {
  return (
    <div className="flex flex-1 items-center justify-center bg-brand-50 px-4 py-16 dark:bg-neutral-950">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-sm dark:bg-neutral-900">
        <h1 className="text-xl font-bold text-brand-700 dark:text-brand-300">
          이메일을 확인해주세요
        </h1>
        <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
          가입하신 이메일로 인증 링크를 보내드렸어요. 링크를 눌러 인증을
          완료하면 로그인할 수 있습니다.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block font-medium text-brand-600 hover:underline dark:text-brand-400"
        >
          로그인 화면으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
