import Link from "next/link";

export default function PageHeader({ title, desc, action, back }: { title: string; desc?: string; action?: { href: string; label: string }; back?: { href: string; label: string } }) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 border-b border-line pb-6 sm:flex-row sm:items-end">
      <div>
        {back && <Link href={back.href} className="text-[13px] text-muted hover:text-ink">← {back.label}</Link>}
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">{title}</h1>
        {desc && <p className="mt-1 text-sm text-muted">{desc}</p>}
      </div>
      {action && <Link href={action.href} className="btn-primary shrink-0">{action.label}</Link>}
    </div>
  );
}

export function Table({ head, children, empty }: { head: string[]; children: React.ReactNode; empty?: boolean }) {
  return (
    <div className="overflow-x-auto rounded-kpi border border-line-soft bg-white">
      <table className="w-full text-[13.5px]">
        <thead className="border-b border-line-soft bg-card text-[11.5px] uppercase tracking-wide text-muted">
          <tr>{head.map((h, i) => <th key={h + i} scope="col" className={`px-4 py-2.5 font-medium ${i === head.length - 1 ? "text-right" : "text-left"}`}>{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-line-soft">{children}</tbody>
      </table>
      {empty && <p className="px-4 py-8 text-center text-sm text-muted">Belum ada data.</p>}
    </div>
  );
}

export function Badge({ children, tone = "gray" }: { children: React.ReactNode; tone?: "gray" | "green" | "orange" }) {
  const t = { gray: "bg-tint text-muted", green: "bg-mint/15 text-mint-ink", orange: "bg-accent/15 text-eyebrow" }[tone];
  return <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${t}`}>{children}</span>;
}
