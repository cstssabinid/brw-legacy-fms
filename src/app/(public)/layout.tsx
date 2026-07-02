import { PublicNav } from "@/components/public-nav";
import { BerwaBot } from "@/components/berwa-bot";
import { PublicFooter } from "@/components/public-footer";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PublicNav />
      {children}
      <PublicFooter />
      <BerwaBot />
    </>
  );
}
