import { compile, run } from "@mdx-js/mdx";
import Link from "next/link";
import * as runtime from "react/jsx-runtime";
import type { JSX, ReactNode } from "react";
import { toSlug } from "@/lib/pepzine/headings";

function childToString(node: unknown): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(childToString).join("");

  if (
    node &&
    typeof node === "object" &&
    "props" in node &&
    node.props &&
    typeof node.props === "object" &&
    "children" in node.props
  ) {
    return childToString(node.props.children);
  }

  return "";
}

function makeHeading(
  Tag: "h2" | "h3"
): (props: JSX.IntrinsicElements["h2"]) => JSX.Element {
  return function Heading({ children, ...props }) {
    const id = toSlug(childToString(children));

    return (
      <Tag id={id} {...props}>
        <a href={`#${id}`} className="group no-underline">
          {children}
        </a>
      </Tag>
    );
  };
}

function PepTip({ children }: { children: ReactNode }) {
  return (
    <aside className="my-8 rounded-3xl border border-accent/20 bg-accent/10 p-6 not-prose">
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-accent">
        Pep Tip
      </p>
      <div className="text-base leading-relaxed text-foreground/85">{children}</div>
    </aside>
  );
}

function InfoBox({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <aside className="my-8 rounded-3xl border border-border bg-muted/40 p-6 not-prose">
      {title ? (
        <p className="mb-2 text-sm font-semibold text-foreground">{title}</p>
      ) : null}
      <div className="text-base leading-relaxed text-muted-foreground">{children}</div>
    </aside>
  );
}

function ArticleCta({
  title = "Pepapp ile daha fazlasını keşfet",
  href = "/tr",
  children,
}: {
  title?: string;
  href?: string;
  children: ReactNode;
}) {
  return (
    <aside className="my-10 rounded-[2rem] border border-border bg-foreground p-7 text-background not-prose">
      <p className="mb-3 text-xl font-bold tracking-tight">{title}</p>
      <div className="mb-5 text-sm leading-relaxed text-background/75">{children}</div>
      <Link
        href={href}
        className="inline-flex items-center rounded-full bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition hover:opacity-90"
      >
        Pepapp’ı keşfet
      </Link>
    </aside>
  );
}

const mdxComponents = {
  h2: makeHeading("h2"),
  h3: makeHeading("h3"),
  PepTip,
  InfoBox,
  ArticleCta,
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
    <main className="px-5 max-w-2xl mx-auto pb-16">
      <article className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-h2:mt-12 prose-h2:mb-4 prose-h2:text-2xl md:prose-h2:text-3xl prose-h3:mt-8 prose-h3:mb-3 prose-h3:text-xl prose-p:text-base prose-p:leading-8 prose-p:text-foreground/80 prose-a:text-accent prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-ul:my-6 prose-li:my-2 prose-blockquote:rounded-2xl prose-blockquote:border-l-4 prose-blockquote:border-accent/50 prose-blockquote:bg-muted/40 prose-blockquote:px-5 prose-blockquote:py-3 prose-blockquote:text-muted-foreground">
        <Content components={mdxComponents} />
      </article>
    </main>
  );
}
