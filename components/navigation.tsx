import Link from "next/link"

export default function Navigation() {
  return (
    <header className="w-full bg-white">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2" aria-label="VitaMend Home">
          <img
            src="/images/design-mode/VITAMEND_LOGO.png"
            alt="VitaMend logo"
            className="h-7 w-7 rounded"
            loading="eager"
          />
          <span className="text-sm font-semibold text-slate-900">VitaMend</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8" aria-label="Primary">
          <Link
            href="/donate"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 hover:underline underline-offset-4"
          >
            Donate
          </Link>
          <Link
            href="/volunteer"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 hover:underline underline-offset-4"
          >
            Volunteer
          </Link>
          <Link
            href="/transparency"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 hover:underline underline-offset-4"
          >
            Transparency
          </Link>
        </nav>

        <div className="flex items-center">
          <Link
            href="/dashboard"
            className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </header>
  )
}
