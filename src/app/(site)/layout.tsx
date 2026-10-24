import { SiteNav } from "@/components/SiteNav";
import { Footer } from "@/components/Footer";
import { ChatWidget } from "@/components/ChatWidget";
import { ScrollProgress } from "@/components/ui/reveal";
import { PATIO_NAME } from "@/lib/format";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ScrollProgress />
      <SiteNav name={PATIO_NAME} />
      <main>{children}</main>
      <Footer />
      <ChatWidget />
    </>
  );
}
