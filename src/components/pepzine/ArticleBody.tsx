import { compile, run } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";

interface ArticleBodyProps {
  content: string;
}

export async function ArticleBody({ content }: ArticleBodyProps) {
  const compiled = await compile(content, { outputFormat: "function-body" });
  const { default: Content } = await run(compiled, {
    ...(runtime as Parameters<typeof run>[1]),
    baseUrl: import.meta.url,
  });

  return (
    <div className="px-5 max-w-2xl mx-auto pb-20">
      <div className="prose prose-neutral dark:prose-invert prose-headings:font-bold prose-headings:tracking-tight prose-a:text-accent prose-a:no-underline hover:prose-a:underline prose-blockquote:border-accent/50 prose-blockquote:text-muted-foreground max-w-none">
        <Content />
      </div>
    </div>
  );
}
