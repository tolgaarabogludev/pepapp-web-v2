

import { RichText } from "@payloadcms/richtext-lexical/react";
import Link from "next/link";
import type { ReactNode } from "react";

type PayloadArticleBodyProps = {
  content: unknown;
};

function sanitizeLexicalContent(value: unknown) {
  if (!value || typeof value !== "object") return value;

  const clone = JSON.parse(JSON.stringify(value)) as Record<string, unknown>;

  const stripScripts = (node: unknown): unknown => {
    if (Array.isArray(node)) {
      return node
        .map(stripScripts)
        .filter((child) => child !== null);
    }

    if (!node || typeof node !== "object") {
      return node;
    }

    const record = node as Record<string, unknown>;

    if (record.type === "html") {
      const html = String(record.value || "");

      if (/<script\b/i.test(html)) {
        return null;
      }
    }

    const next = { ...record };

    if (Array.isArray(next.children)) {
      next.children = next.children
        .map(stripScripts)
        .filter((child) => child !== null);
    }

    return next;
  };

  return stripScripts(clone);
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

export function PayloadArticleBody({ content }: PayloadArticleBodyProps) {
  if (!content) return null;
  const safeContent = sanitizeLexicalContent(content);

  return (
    <main className="px-5 max-w-2xl mx-auto pb-16">
      <article className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-h2:mt-12 prose-h2:mb-4 prose-h2:text-2xl md:prose-h2:text-3xl prose-h3:mt-8 prose-h3:mb-3 prose-h3:text-xl prose-p:text-base prose-p:leading-8 prose-p:text-foreground/80 prose-a:text-accent prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-ul:my-6 prose-li:my-2 prose-blockquote:rounded-2xl prose-blockquote:border-l-4 prose-blockquote:border-accent/50 prose-blockquote:bg-muted/40 prose-blockquote:px-5 prose-blockquote:py-3 prose-blockquote:text-muted-foreground">
        <RichText
          data={safeContent as never}
          converters={({ defaultConverters }) => ({
            ...defaultConverters,
          })}
        />
      </article>
    </main>
  );
}

export const payloadArticleComponents = {
  PepTip,
  InfoBox,
  ArticleCta,
};