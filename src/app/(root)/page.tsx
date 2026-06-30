import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <section className="relative z-20 flex min-h-screen flex-col items-center pt-10">
      <Image
        src="/hero.svg"
        alt="Hero"
        width={360}
        height={360}
        priority
      />

      <h1 className="mt-4 text-center text-6xl font-extrabold tracking-tight bg-gradient-to-r from-rose-500 via-red-500 to-pink-500 bg-clip-text text-transparent">
        Vibe Code With Intelligence
      </h1>

      <p className="mt-8 max-w-2xl text-center text-lg text-muted-foreground">
        VibeCode Editor is a powerful and intelligent code editor that enhances
        your coding experience with advanced features and seamless integration.
        It is designed to help you write, debug, and optimize your code
        efficiently.
      </p>

      <Link href="/dashboard" className="mt-8">
        <Button size="lg" variant="brand">
          Get Started
          <ArrowUpRight className="ml-2 h-4 w-4" />
        </Button>
      </Link>
    </section>
  );
}