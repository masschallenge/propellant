import type { ReactNode } from 'react';

interface PanelSectionProps {
  title: string;
  children: ReactNode;
  headingLevel?: 'h2' | 'h3';
}

export const PanelSection = ({ title, children, headingLevel = 'h3' }: PanelSectionProps) => {
  const Heading = headingLevel;
  return (
    <section className="flex flex-col gap-2 border-b border-solid border-[var(--separator)] px-4 py-4 last:border-b-0">
      <Heading className="m-0 text-[length:var(--type-caption-size)] font-bold uppercase tracking-[var(--type-caption-tracking)] text-[var(--label-secondary)]">
        {title}
      </Heading>
      {children}
    </section>
  );
};
