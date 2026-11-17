import Link from "next/link";
import { requireAdmin } from "@/lib/session";
import { logout } from "../login/actions";
import AdminNav from "./AdminNav";

export const metadata = { title: { default: "Panel Admin", template: "%s · Admin Desa Ungasan" }, robots: { index: false } };

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  return (
    <div className="min-h-dvh bg-bento lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="border-b border-line bg-white lg:sticky lg:top-0 lg:h-dvh lg:border-b-0 lg:border-r">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-5 py-4">
            <Link href="/admin" className="flex items-center gap-2.5">
              <span aria-hidden className="grid size-8 place-items-center rounded-md bg-ink text-[13px] font-bold text-white">U</span>
              <span className="leading-tight"><span className="block text-sm font-semibold">Admin Ungasan</span><span className="block text-[11px] text-muted">Panel konten</span></span>
            </Link>
            <form action={logout} className="lg:hidden"><button className="btn-secondary btn-sm" aria-label={`Keluar (${user.name})`}>Keluar</button></form>
          </div>
          <AdminNav isAdmin={user.role === "ADMIN"} />
          <div className="mt-auto hidden border-t border-line px-5 py-4 text-[13px] lg:block">
            <p className="font-medium">{user.name}</p>
            <p className="text-muted">{user.email} · {user.role === "ADMIN" ? "Admin" : "Editor"}</p>
            <div className="mt-3 flex gap-2">
              <Link href="/" target="_blank" className="btn-secondary btn-sm">Lihat situs ↗</Link>
              <form action={logout}><button className="btn-secondary btn-sm">Keluar</button></form>
            </div>
          </div>
        </div>
      </aside>
      <main id="konten" className="px-5 py-8 md:px-10 md:py-10"><div className="mx-auto max-w-5xl">{children}</div></main>
    </div>
  );
}
