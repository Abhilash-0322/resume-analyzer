"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FileSearch, History, LogOut, Sparkles, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AuthUser } from "@/types/auth";

const links = [
  { href: "/analyze", label: "Analyze", icon: FileSearch },
  { href: "/history", label: "History", icon: History },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : { user: null }))
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/15 ring-1 ring-accent/30 transition group-hover:bg-accent/25">
            <Sparkles className="h-4.5 w-4.5 text-accent" />
          </div>
          <span className="text-lg font-semibold tracking-tight">
            Resume<span className="text-accent">AI</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {user &&
            links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
                  pathname === href || pathname.startsWith(href + "/")
                    ? "bg-accent/15 text-accent"
                    : "text-muted hover:bg-card hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            ))}

          {!loading && (
            <>
              {user ? (
                <div className="ml-2 flex items-center gap-2">
                  <div className="hidden items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-sm sm:flex">
                    <User className="h-3.5 w-3.5 text-muted" />
                    <span className="max-w-[120px] truncate">{user.name}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-muted transition hover:bg-card hover:text-foreground"
                    title="Sign out"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">Sign out</span>
                  </button>
                </div>
              ) : (
                <div className="ml-2 flex items-center gap-2">
                  <Link
                    href="/login"
                    className="rounded-lg px-3.5 py-2 text-sm font-medium text-muted transition hover:bg-card hover:text-foreground"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-hover"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
