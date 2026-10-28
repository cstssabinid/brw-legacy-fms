import { PublicNav } from "@/components/public-nav";
import { BerwaBot } from "@/components/berwa-bot";
import { PublicFooter } from "@/components/public-footer";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="public-layout-nav"><PublicNav /></div>
      <div className="public-layout-content">{children}</div>
      <div className="public-layout-footer"><PublicFooter /></div>
      <div className="public-layout-assistant"><BerwaBot /></div>
    </>
  );
}
