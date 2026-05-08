import Image from "next/image";
import type { PepzineFrontmatter } from "@/lib/pepzine/types";

interface ArticleHeroImageProps {
  frontmatter: PepzineFrontmatter;
}

export function ArticleHeroImage({ frontmatter }: ArticleHeroImageProps) {
  const imageSrc = frontmatter.image;
  const imageAlt = frontmatter.imageAlt || frontmatter.title;

  return (
    <div className="px-5 md:px-8 max-w-4xl mx-auto mt-6 mb-4">
      <div className="relative aspect-[16/8] rounded-3xl overflow-hidden bg-gradient-to-br from-accent/10 via-muted/50 to-muted border border-border/50">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 1024px"
            className="object-cover"
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center"
            aria-hidden="true"
          >
            <span className="text-5xl opacity-10 select-none">✦</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
      </div>
    </div>
  );
}
