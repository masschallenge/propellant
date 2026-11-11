import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

const Glyph = ({ children, ...props }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    {children}
  </svg>
);

export const CheckIcon = (props: IconProps) => (
  <Glyph {...props}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </Glyph>
);

export const AlertIcon = (props: IconProps) => (
  <Glyph {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.5v5.5M12 16.5h.01" />
  </Glyph>
);

export const UndoIcon = (props: IconProps) => (
  <Glyph {...props}>
    <path d="M9 14L4 9l5-5" />
    <path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />
  </Glyph>
);

export const RedoIcon = (props: IconProps) => (
  <Glyph {...props}>
    <path d="M15 14l5-5-5-5" />
    <path d="M20 9H9.5a5.5 5.5 0 0 0 0 11H13" />
  </Glyph>
);

export const DownloadIcon = (props: IconProps) => (
  <Glyph {...props}>
    <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
  </Glyph>
);

export const ArrowLeftIcon = (props: IconProps) => (
  <Glyph {...props}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </Glyph>
);

export const SparkIcon = (props: IconProps) => (
  <Glyph {...props}>
    <path d="M4 6h16M4 12h10M4 18h7" />
  </Glyph>
);
