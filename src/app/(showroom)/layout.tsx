import { SiteHeader } from "@/components/showroom/SiteHeader";
import { MobileContactBar, SiteFooter } from "@/components/showroom/Sections";

export default function ShowroomLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter />
      <MobileContactBar />
    </>
  );
}
