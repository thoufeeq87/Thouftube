import Link from "next/link";
import SignOutButton from "@/components/SignOutButton";

const TABS = [
  { href: "/videos", label: "Videos" },
  { href: "/photos", label: "Photos" },
  { href: "/posts", label: "Posts" },
  { href: "/categories", label: "Categories" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link href="/videos" className="text-lg font-semibold tracking-tight">
            ThoufTube
          </Link>
          <nav className="flex gap-1">
            {TABS.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                className="rounded-md px-3 py-1.5 text-sm text-muted transition hover:bg-surface-hover hover:text-foreground"
              >
                {tab.label}
              </Link>
            ))}
          </nav>
          <SignOutButton />
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
