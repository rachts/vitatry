import Link from "next/link"
import ThemeToggle from "@/components/theme-toggle"

export default function Navigation() {
  return (
    <header className="w-full bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 transition-colors">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2" aria-label="VitaMend Home">
          <img
            src="/images/design-mode/VITAMEND_LOGO.png"
            alt="VitaMend logo"
            className="h-7 w-7 rounded"
            loading="eager"
          />
          <span className="text-sm font-semibold text-slate-900 dark:text-white">VitaMend</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8" aria-label="Primary">
          <Link
            href="/donate"
            className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:underline underline-offset-4 transition-colors"
          >
            Donate
          </Link>
          <Link
            href="/volunteer"
            className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:underline underline-offset-4 transition-colors"
          >
            Volunteer
          </Link>
          <Link
            href="/transparency"
            className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:underline underline-offset-4 transition-colors"
          >
            Transparency
          </Link>
          <Link
            href="/founders"
            className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:underline underline-offset-4 transition-colors"
          >
            Founders
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link
            href="/dashboard"
            className="rounded-md bg-emerald-600 hover:bg-emerald-700 px-3 py-2 text-sm font-semibold text-white transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </header>
  )
}
