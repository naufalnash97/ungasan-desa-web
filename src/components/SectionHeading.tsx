import Link from "next/link";

export default function SectionHeading({ eyebrow, title, desc, href, cta }: {
  eyebrow: string; title: string; desc?: string; href?: string; cta?: string;
}) {
  return (
    <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="h-section mt-3 max-w-[22ch]">{title}</h2>
        {desc && <p className="mt-3 max-w-[56ch] text-muted">{desc}</p>}
      </div>
      {href && cta && <Link href={href} className="btn-secondary shrink-0">{cta}</Link>}
    </div>
  );
}
