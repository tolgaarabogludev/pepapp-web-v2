"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type CategoryChip = {
  title: string;
  slug: string;
};

interface CategoryChipsProps {
  active?: string | null;
  categories?: CategoryChip[];
}

export function CategoryChips({ active, categories = [] }: CategoryChipsProps) {
  const router = useRouter();

  function handleSelect(categorySlug: string | null) {
    if (!categorySlug) {
      router.push("/tr/pepzine");
      return;
    }

    router.push(`/tr/pepzine/kategori/${categorySlug}`);
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

      {categories.map((category) => (
        <button
          key={category.slug}
          onClick={() => handleSelect(category.slug)}
          className={cn(
            "px-4 py-1.5 rounded-full text-sm font-medium transition-colors border",
            active === category.slug
              ? "bg-foreground text-background border-foreground"
              : "border-border text-muted-foreground hover:text-foreground hover:border-foreground"
          )}
        >
          {category.title}
        </button>
      ))}
    </div>
  );
}
