import type { PepzineFrontmatter } from "@/lib/pepzine/types";

interface ArticleHeroImageProps {
  frontmatter: PepzineFrontmatter;
}

export function ArticleHeroImage({ frontmatter }: ArticleHeroImageProps) {
  return (
    <div className="px-5 md:px-8 max-w-2xl mx-auto mt-6 mb-2">
      <div className="relative aspect-[16/7] rounded-2xl overflow-hidden bg-gradient-to-br from-accent/10 via-muted/50 to-muted">
        <div
          className="absolute inset-0 flex items-center justify-center"
          aria-hidden="true"
        >
          <span className="text-5xl opacity-10 select-none">✦</span>
        </div>
      </div>
    </div>
  );
}
