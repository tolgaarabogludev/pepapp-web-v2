"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { CATEGORIES, type PepzineCategory } from "@/lib/pepzine/types";

const LABELS: Record<PepzineCategory, string> = {
  döngü: "Döngü",
  zihin: "Zihin",
  beslenme: "Beslenme",
  hareket: "Hareket",
  uyku: "Uyku",
  ilişkiler: "İlişkiler",
};

interface CategoryChipsProps {
  active?: PepzineCategory | null;
}

export function CategoryChips({ active }: CategoryChipsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleSelect(cat: PepzineCategory | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (cat) {
      params.set("kategori", cat);
    } else {
      params.delete("kategori");
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-2 justify-center px-5">
      <button
        onClick={() => handleSelect(null)}
        className={cn(
          "px-4 py-1.5 rounded-full text-sm font-medium transition-colors border",
          !active
            ? "bg-foreground text-background border-foreground"
            : "border-border text-muted-foreground hover:text-foreground hover:border-foreground"
        )}
      >
        Tümü
      </button>
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => handleSelect(cat)}
          className={cn(
            "px-4 py-1.5 rounded-full text-sm font-medium transition-colors border",
            active === cat
              ? "bg-foreground text-background border-foreground"
              : "border-border text-muted-foreground hover:text-foreground hover:border-foreground"
          )}
        >
          {LABELS[cat]}
        </button>
      ))}
    </div>
  );
}
