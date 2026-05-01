import { compile, run } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import type { JSX } from "react";
import { toSlug } from "@/lib/pepzine/headings";

function childToString(node: unknown): string {
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(childToString).join("");
  return "";
}

function makeHeading(
  Tag: "h2" | "h3"
): (props: JSX.IntrinsicElements["h2"]) => JSX.Element {
  return function Heading({ children, ...props }) {
    return (
      <Tag id={toSlug(childToString(children))} {...props}>
        {children}
      </Tag>
    );
  };
}

const headingComponents = {
  h2: makeHeading("h2"),
  h3: makeHeading("h3"),
};

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
    <div className="px-5 max-w-2xl mx-auto pb-10">
      <div className="prose prose-neutral dark:prose-invert prose-headings:font-bold prose-headings:tracking-tight prose-a:text-accent prose-a:no-underline hover:prose-a:underline prose-blockquote:border-accent/50 prose-blockquote:text-muted-foreground max-w-none">
        <Content components={headingComponents} />
      </div>
    </div>
  );
}
