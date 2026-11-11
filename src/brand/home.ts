export type BrandNeedVisual =
  | 'logo'
  | 'colors'
  | 'fonts'
  | 'about'
  | 'photos'
  | 'voice'
  | 'contact'
  | 'kit';

export interface BrandNeed {
  id: string;
  title: string;
  description: string;
  href: string;
  action: string;
  visual: BrandNeedVisual;
  isDownload?: boolean;
}

export const BRAND_NEEDS: BrandNeed[] = [
  {
    id: 'logo',
    title: 'The logo',
    description: 'Download the right version for your background, with clear space and sizes.',
    href: '/brand/#logo',
    action: 'Get the logo',
    visual: 'logo',
  },
  {
    id: 'colors',
    title: 'Colors',
    description: 'Every brand color with HEX, RGB and print values, and the pairings that read.',
    href: '/brand/#color',
    action: 'See the colors',
    visual: 'colors',
  },
  {
    id: 'fonts',
    title: 'Fonts',
    description: 'Lato for everything we write, and Oswald capitals for big headlines.',
    href: '/brand/#type',
    action: 'See the fonts',
    visual: 'fonts',
  },
  {
    id: 'about',
    title: 'About MassChallenge',
    description: 'Our primary line, the approved boilerplate and the figures to quote.',
    href: '/brand/#messaging',
    action: 'Copy the words',
    visual: 'about',
  },
  {
    id: 'photos',
    title: 'Photos and video',
    description: 'MassChallenge photos and videos, and how to choose and treat your own.',
    href: '/brand/#photos',
    action: 'Browse photos',
    visual: 'photos',
  },
  {
    id: 'voice',
    title: 'Voice and writing',
    description: 'How we sound, with words to use, words to skip and a checker for your draft.',
    href: '/brand/#voice',
    action: 'Check your words',
    visual: 'voice',
  },
  {
    id: 'contact',
    title: 'Contact, social and legal',
    description: 'The email address, social links, offices and copyright line to use.',
    href: '#contact',
    action: 'Find the details',
    visual: 'contact',
  },
  {
    id: 'kit',
    title: 'The brand kit',
    description: 'One download with every logo, the fonts and the color codes.',
    href: '/downloads/masschallenge-brand-kit.zip',
    action: 'Download the kit',
    visual: 'kit',
    isDownload: true,
  },
];

export interface BrandTool {
  id: 'studio' | 'signature';
  title: string;
  description: string;
  points: string[];
  href: string;
  action: string;
}

export const BRAND_TOOLS: BrandTool[] = [
  {
    id: 'studio',
    title: 'Content studio',
    description:
      'Make a social post or graphic without a designer. Give it your words and a photo, and it lays them out with our fonts, colors and logo.',
    points: [
      'Six layouts from one set of words',
      'Only colors that read on each background',
      'Download a full size PNG',
    ],
    href: '/studio/',
    action: 'Open the studio',
  },
  {
    id: 'signature',
    title: 'Email signature',
    description:
      'Fill in your name, title and office, and copy a signature that looks right in Outlook, Gmail and Apple Mail.',
    points: ['The logo, links and address set up for you', 'Copy it in one click'],
    href: '/studio/signature/',
    action: 'Build your signature',
  },
];

export interface BrandResource {
  id: 'web' | 'office';
  title: string;
  audience: string;
  description: string;
  includes: string[];
  href: string;
  action: string;
}

export const BRAND_RESOURCES: BrandResource[] = [
  {
    id: 'web',
    title: 'Web',
    audience: 'For anyone who builds or runs a website, an app or a landing page',
    description:
      'Propellant for the web: the colors, type and components behind MassChallenge products, and step by step guides for website builders.',
    includes: [
      'Guides for WordPress, Squarespace, Webflow, Wix, HubSpot and plain HTML',
      'React components and design tokens for our products',
      'A stylesheet for any page that cannot use the components',
    ],
    href: '/web/',
    action: 'Go to Web',
  },
  {
    id: 'office',
    title: 'Office',
    audience: 'For anyone who makes documents, presentations or spreadsheets',
    description:
      'Propellant for Office: ready to use templates and guides for Microsoft Office and Google Workspace.',
    includes: [
      'Templates for Word, PowerPoint and Excel',
      'The same files for Google Docs, Slides and Sheets',
      'Guides to make any file look like MassChallenge',
    ],
    href: '/office/',
    action: 'Go to Office',
  },
];

export interface FinderEntry {
  need: string;
  place: string;
  href: string;
}

export const FINDER: FinderEntry[] = [
  { need: 'Download the logo', place: 'Brand guide, Logo', href: '/brand/#logo' },
  { need: 'Find a color code', place: 'Brand guide, Color', href: '/brand/#color' },
  {
    need: 'Find our email, socials or offices',
    place: 'Contact, social and legal',
    href: '#contact',
  },
  {
    need: 'Describe MassChallenge',
    place: 'Brand guide, Voice and messaging',
    href: '/brand/#messaging',
  },
  { need: 'Make a social post', place: 'Content studio', href: '/studio/' },
  { need: 'Set up my email signature', place: 'Email signature', href: '/studio/signature/' },
  { need: 'Start a document or deck', place: 'Office, Templates', href: '/office/templates/' },
  { need: 'Style a website', place: 'Web, Websites', href: '/web/websites/' },
  { need: 'Build a MassChallenge product', place: 'Web, Using Propellant', href: '/web/usage/' },
  { need: 'Use Claude on brand', place: 'Propellant in Claude', href: '/claude/' },
  {
    need: 'Choose and treat photos',
    place: 'Guidelines, Photography',
    href: '/guidelines/photography/',
  },
  { need: 'Read every brand rule in full', place: 'Brand reference', href: '/brand/reference/' },
];
