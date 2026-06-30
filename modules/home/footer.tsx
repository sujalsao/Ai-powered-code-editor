import Link from "next/link";
import { FaGithub } from "react-icons/fa";

export function Footer() {
  return (
    <footer className="w-full border-t border-zinc-200 dark:border-zinc-800 mt-10">
      <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">

        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          © {new Date().getFullYear()} AI Code Editor. All rights reserved.
        </p>

        <Link
          href="https://github.com"
          target="_blank"
          className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          <FaGithub className="w-5 h-5" />
        </Link>

      </div>
    </footer>
  );
}