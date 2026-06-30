import { Metadata } from "next";
import { Header } from "../../../modules/home/header";
import {Footer} from "../../../modules/home/footer";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: {
    template: "%s | VibeCode Editor",
    default: "Code Editor for VibeCoders - Vibecode",
  },
};

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="relative min-h-screen">
        {/* Grid */}
        <div
          className={cn(
            "absolute inset-0",
            "[background-size:40px_40px]",
            "[background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]",
            "dark:[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]"
          )}
        />

        {/* Radial Mask */}
        <div
          className={cn(
            "pointer-events-none absolute inset-0 bg-white dark:bg-black",
            "[mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"
          )}
        />

        <Header />

        <main className="relative z-20 w-full">
          {children}
        </main>

        <Footer />
      </div>
    </>
  );
}