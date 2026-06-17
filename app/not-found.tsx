import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center pt-16 text-center animate-fade-in">
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <Compass className="h-7 w-7" />
      </span>
      <h1 className="text-xl font-bold">Page not found</h1>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">
        That page doesn&apos;t exist. Let&apos;s get you back to clearing things
        up.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition hover:brightness-110"
      >
        Back to home
      </Link>
    </div>
  );
}
