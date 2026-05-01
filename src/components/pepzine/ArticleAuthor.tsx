import type { Author } from "@/lib/pepzine/authors";

interface ArticleAuthorProps {
  author: Author;
}

export function ArticleAuthor({ author }: ArticleAuthorProps) {
  return (
    <div className="px-5 max-w-2xl mx-auto py-10 border-t border-border/40">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-semibold text-accent" aria-hidden="true">
            {author.name.charAt(0)}
          </span>
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{author.name}</p>
          <p className="text-xs text-accent mb-2">{author.role}</p>
          <p className="text-sm text-muted-foreground leading-relaxed">{author.bio}</p>
        </div>
      </div>
    </div>
  );
}
