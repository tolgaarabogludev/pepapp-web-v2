interface BlogHeroProps {
  eyebrow?: string;
  heading: string;
  subheading?: string;
}

export function BlogHero({ eyebrow, heading, subheading }: BlogHeroProps) {
  return (
    <div className="pt-32 pb-16 px-5 md:px-8 max-w-3xl mx-auto text-center">
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-4">
          {eyebrow}
        </p>
      )}
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
        {heading}
      </h1>
      {subheading && (
        <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
          {subheading}
        </p>
      )}
    </div>
  );
}
