"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Earth,
  Menu,
  X,
  History,
  Settings as SettingsIcon,
  Compass,
  Newspaper,
  Lightbulb,
  BarChart3,
} from "lucide-react";

export interface NavbarProps {
  currentView?: "hero" | "map" | "news" | "suggestions";
  onViewChange?: (view: "hero" | "map" | "news" | "suggestions") => void;
}

export function Navbar({ currentView = "hero", onViewChange }: NavbarProps) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "hero", label: "Dashboard", icon: BarChart3 },
    { id: "map", label: "World Map", icon: Compass },
    { id: "news", label: "Climate News", icon: Newspaper },
    { id: "suggestions", label: "Suggestions", icon: Lightbulb },
  ] as const;

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.08] transition-colors duration-300"
      style={{
        background: "rgba(4, 6, 13, 0.85)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group select-none"
            aria-label="PlanetPulse Home"
            onClick={() => {
              if (isHomePage && onViewChange) onViewChange("hero");
            }}
          >
            <div className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-md shadow-primary-500/25 group-hover:scale-105 group-hover:shadow-primary-500/40 transition-all duration-200">
              <Earth size={18} className="text-dark-950 stroke-[2.2]" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-lg font-bold tracking-tight text-neutral-900 dark:text-white group-hover:text-primary-500 transition-colors">
                Planet<span className="text-primary-500">Pulse</span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {isHomePage && onViewChange ? (
              // View switchers on home page
              navItems.map((item) => {
                const active = currentView === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => onViewChange(item.id)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer group ${
                      active
                        ? "bg-primary-500/15 text-primary-400 border border-primary-500/30 shadow-sm"
                        : "text-neutral-600 dark:text-dark-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/[0.06] border border-transparent hover:shadow-sm hover:scale-[1.02]"
                    }`}
                    aria-pressed={active}
                  >
                    <Icon size={15} className={active ? "text-primary-400" : "group-hover:scale-110 transition-transform"} />
                    {item.label}
                  </button>
                );
              })
            ) : (
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-sm font-medium text-neutral-600 dark:text-dark-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/[0.06] transition-all"
              >
                <BarChart3 size={15} />
                Dashboard
              </Link>
            )}

            <div className="w-[1px] h-5 bg-neutral-200 dark:bg-white/10 mx-1.5" />

            <Link
              href="/history"
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all group ${
                pathname === "/history"
                  ? "bg-primary-500/15 text-primary-400 border border-primary-500/30 shadow-sm"
                  : "text-neutral-600 dark:text-dark-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/[0.06] hover:scale-[1.02] border border-transparent"
              }`}
            >
              <History size={15} className={pathname === "/history" ? "text-primary-400" : "group-hover:scale-110 transition-transform"} />
              History
            </Link>

            <Link
              href="/settings"
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all group ${
                pathname === "/settings"
                  ? "bg-primary-500/15 text-primary-400 border border-primary-500/30 shadow-sm"
                  : "text-neutral-600 dark:text-dark-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/[0.06] hover:scale-[1.02] border border-transparent"
              }`}
            >
              <SettingsIcon size={15} className={pathname === "/settings" ? "text-primary-400" : "group-hover:scale-110 transition-transform"} />
              Settings
            </Link>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center border border-neutral-200/80 dark:border-white/[0.08] bg-neutral-100/80 dark:bg-dark-900 text-neutral-700 dark:text-dark-200 hover:bg-neutral-200 dark:hover:bg-dark-800 transition-all cursor-pointer"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-neutral-200/80 dark:border-white/[0.08] animate-fade-in space-y-1">
            {isHomePage && onViewChange ? (
              navItems.map((item) => {
                const active = currentView === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onViewChange(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-left transition-all ${
                      active
                        ? "bg-primary-500/15 text-primary-400 border border-primary-500/25"
                        : "text-neutral-700 dark:text-dark-300 hover:bg-neutral-100 dark:hover:bg-white/[0.06]"
                    }`}
                  >
                    <Icon size={17} className={active ? "text-primary-400" : "opacity-70"} />
                    {item.label}
                  </button>
                );
              })
            ) : (
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-neutral-700 dark:text-dark-300 hover:bg-neutral-100 dark:hover:bg-white/[0.06]"
              >
                <BarChart3 size={17} className="opacity-70" />
                Dashboard
              </Link>
            )}

            <div className="pt-2 mt-1 border-t border-neutral-200/80 dark:border-white/[0.08] space-y-1">
              <Link
                href="/history"
                onClick={() => setMobileMenuOpen(false)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  pathname === "/history"
                    ? "bg-primary-500/15 text-primary-400 border border-primary-500/25"
                    : "text-neutral-700 dark:text-dark-300 hover:bg-neutral-100 dark:hover:bg-white/[0.06]"
                }`}
              >
                <History size={17} className={pathname === "/history" ? "text-primary-400" : "opacity-70"} />
                History
              </Link>

              <Link
                href="/settings"
                onClick={() => setMobileMenuOpen(false)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  pathname === "/settings"
                    ? "bg-primary-500/15 text-primary-400 border border-primary-500/25"
                    : "text-neutral-700 dark:text-dark-300 hover:bg-neutral-100 dark:hover:bg-white/[0.06]"
                }`}
              >
                <SettingsIcon size={17} className={pathname === "/settings" ? "text-primary-400" : "opacity-70"} />
                Settings
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}