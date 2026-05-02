import { cn } from "@/lib/utils";

type SectionProps = {
  children: React.ReactNode;
  className?: string;
};

export function Section({ children, className }: SectionProps) {
  return (
    <section className={cn("py-16 sm:py-24 lg:py-32", className)}>
      {children}
    </section>
  );
}