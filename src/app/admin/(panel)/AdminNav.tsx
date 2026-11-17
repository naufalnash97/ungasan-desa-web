"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookUser, KeyRound, FileText, FolderOpen, Gauge, LayoutGrid, Newspaper, PieChart, ScrollText, Users, Wallet } from "lucide-react";

const ITEMS = [
  { href: "/admin", label: "Dasbor", icon: Gauge },
  { href: "/admin/berita", label: "Berita & Pengumuman", icon: Newspaper },
  { href: "/admin/halaman", label: "Halaman", icon: FileText },
  { href: "/admin/apbdes", label: "APBDes", icon: Wallet },
  { href: "/admin/dokumen", label: "Dokumen", icon: FolderOpen },
  { href: "/admin/statistik", label: "Statistik", icon: PieChart },
  { href: "/admin/layanan", label: "Layanan", icon: LayoutGrid },
  { href: "/admin/buku-tamu", label: "Buku Tamu", icon: BookUser },
  { href: "/admin/akun", label: "Akun saya", icon: KeyRound },
];
const ADMIN_ONLY = [
  { href: "/admin/pengguna", label: "Pengguna", icon: Users },
  { href: "/admin/audit", label: "Log Audit", icon: ScrollText },
];

export default function AdminNav({ isAdmin }: { isAdmin: boolean }) {
  const path = usePathname();
  const items = isAdmin ? [...ITEMS, ...ADMIN_ONLY] : ITEMS;
  return (
    <nav aria-label="Menu admin" className="px-3 pb-3">
      <ul className="flex gap-1 overflow-x-auto lg:flex-col">
        {items.map(({ href, label, icon: Icon }) => {
          const active = href === "/admin" ? path === "/admin" : path.startsWith(href);
          return (
            <li key={href}>
              <Link href={href} aria-current={active ? "page" : undefined}
                className={`flex items-center gap-2.5 whitespace-nowrap rounded-md px-3 py-2 text-[13.5px] ${active ? "bg-ink text-white" : "text-ink-2 hover:bg-tint"}`}>
                <Icon aria-hidden className="size-4" /> {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
