import * as React from 'react';

type IconProps = React.SVGProps<SVGSVGElement>;

const BASE: IconProps = {
  viewBox: '0 0 24 24',
  width: 16,
  height: 16,
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

export const CheckIcon = (props: IconProps) => (
  <svg {...BASE} {...props}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);

export const CrossIcon = (props: IconProps) => (
  <svg {...BASE} {...props}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

export const DownloadIcon = (props: IconProps) => (
  <svg {...BASE} {...props}>
    <path d="M12 4v11M7 10.5l5 5 5-5M5 20h14" />
  </svg>
);

export const CopyIcon = (props: IconProps) => (
  <svg {...BASE} {...props}>
    <rect x="9" y="9" width="11" height="11" rx="2" />
    <path d="M5 15V6a2 2 0 0 1 2-2h9" />
  </svg>
);

export const PlayIcon = (props: IconProps) => (
  <svg {...BASE} {...props}>
    <path d="M8 5.5v13l10-6.5z" />
  </svg>
);
