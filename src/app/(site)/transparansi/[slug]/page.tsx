import { SectionPage, sectionMetadata } from "../../_section/SectionViews";

type P = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: P) { return sectionMetadata("TRANSPARANSI", (await params).slug); }
export default async function Page({ params }: P) { return <SectionPage section="TRANSPARANSI" slug={(await params).slug} />; }
