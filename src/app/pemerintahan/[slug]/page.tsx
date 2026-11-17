import { SectionPage, sectionMetadata } from "../../_section/SectionViews";

type P = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: P) { return sectionMetadata("PEMERINTAHAN", (await params).slug); }
export default async function Page({ params }: P) { return <SectionPage section="PEMERINTAHAN" slug={(await params).slug} />; }
