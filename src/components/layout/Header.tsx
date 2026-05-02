"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/primitives/Container";
import { useScrolled } from "@/hooks/useScrolled";
import { cn } from "@/lib/utils";

const navLinks = [
  { key: "premium", href: "/premium" },
  { key: "pepzine", href: "/pepzine" },
];

function LanguageSwitcher({ locale }: { locale: string }) {
  return (
    <div className="flex items-center gap-0.5 text-xs font-medium text-muted-foreground">
      <Link
        href="/tr"
        className={cn(
          "px-1.5 py-0.5 rounded transition-colors hover:text-foreground",
          locale === "tr" && "text-foreground"
        )}
      >
        TR
      </Link>
      <span className="opacity-30">|</span>
      <Link
        href="/en"
        className={cn(
          "px-1.5 py-0.5 rounded transition-colors hover:text-foreground",
          locale === "en" && "text-foreground"
        )}
      >
        EN
      </Link>
    </div>
  );
}

export function Header() {
  const t = useTranslations("nav");
  const scrolled = useScrolled(24);
  const [menuOpen, setMenuOpen] = useState(false);
  const locale = useLocale();

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 inset-x-0 z-50 transition-all duration-300",
          scrolled
            ? "glass border-b border-border/50 shadow-sm"
            : "bg-transparent"
        )}
      >
        <Container className="h-16 flex items-center justify-between">
          <Link href={`/${locale}`} className="flex items-center gap-1 group" aria-label="Pepapp">
            <Image
              src="/images/Pepapp-Logo.png"
              alt="Pepapp"
              width={100}
              height={78}
              priority
              className="h-16 w-auto"
            />
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.key}
                href={`/${locale}${link.href}`}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-150"
              >
                {t(link.key)}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Button size="md" variant="default" className="text-sm font-medium">
              {t("cta")}
            </Button>
          </div>

          <div className="flex md:hidden items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? t("closeMenu") : t("openMenu")}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </Container>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-background pt-16 flex flex-col md:hidden">
          <div className="flex-1 flex flex-col gap-1 px-5 py-8">
            {navLinks.map((link) => (
              <Link
                key={link.key}
                href={`/${locale}${link.href}`}
                onClick={() => setMenuOpen(false)}
                className="block py-4 text-2xl font-medium text-foreground border-b border-border/40"
              >
                {t(link.key)}
              </Link>
            ))}
          </div>

          <div className="px-5 py-8 flex flex-col gap-3">
            <Button size="xl" variant="default" className="w-full">
              {t("cta")}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
