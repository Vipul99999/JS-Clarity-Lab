"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brain, Code2, Compass, Gauge, Home, Lightbulb, PlayCircle, Server, Sparkles, Stethoscope } from "lucide-react";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/start", label: "Start Here", icon: PlayCircle },
  { href: "/clinic", label: "Real Bug Clinic", icon: Stethoscope },
  { href: "/concepts", label: "Concept Atlas", icon: Brain },
  { href: "/topics/javascript-event-loop-visualizer", label: "SEO Topics", icon: Lightbulb },
  { href: "/demo/promise-before-timeout", label: "Clarity Cases", icon: Sparkles },
  { href: "/analyze", label: "Analyze Code", icon: Code2 },
  { href: "/node-playground", label: "Node Runtime Lab", icon: Server },
  { href: "/discover", label: "Find Cases", icon: Compass },
  { href: "/quality", label: "Quality", icon: Gauge }
];

export function SiteNav() {
  const pathname = usePathname();
  if (pathname.startsWith("/node-playground")) return null;

  return (
    <nav className="sticky top-0 z-50 border-b border-black/10 bg-white/92 backdrop-blur">
      <div className="mx-auto flex h-12 max-w-7xl items-center gap-2 overflow-x-auto px-4 md:px-6">
        <Link href="/" className="mr-2 shrink-0 text-sm font-semibold text-slate-950">
          JS Clarity Lab
        </Link>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href)) || (item.href.startsWith("/topics") && pathname.startsWith("/topics"));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`inline-flex h-8 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-semibold ${
                active ? "bg-cyan-100 text-cyan-950" : "text-muted-foreground hover:bg-slate-100 hover:text-slate-950"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
