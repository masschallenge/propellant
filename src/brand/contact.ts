export const CONTACT_EMAIL = 'contact@masschallenge.org';

export const WEBSITE_URL = 'https://masschallenge.org/';

export const WEBSITE_LABEL = 'masschallenge.org';

export type SocialId = 'linkedin' | 'instagram' | 'x';

export interface SocialLink {
  id: SocialId;
  name: string;
  url: string;
  handle: string;
}

export const SOCIAL_LINKS: SocialLink[] = [
  {
    id: 'linkedin',
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/company/masschallenge',
    handle: 'linkedin.com/company/masschallenge',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    url: 'https://www.instagram.com/masschallenge/',
    handle: '@masschallenge',
  },
  { id: 'x', name: 'X', url: 'https://x.com/MassChallenge', handle: '@MassChallenge' },
];

export const findSocial = (id: SocialId): SocialLink => {
  const link = SOCIAL_LINKS.find((candidate) => candidate.id === id);
  if (!link) throw new Error(`Unknown social link: ${id}`);
  return link;
};

export const FOOTER_LINKS = [
  { name: 'Careers', url: 'https://masschallenge.org/careers/' },
  { name: 'Ways to Support', url: 'https://masschallenge.org/give/' },
  { name: 'Privacy Policy', url: 'https://masschallenge.org/privacy-notice/' },
  { name: 'Terms of Use', url: 'https://masschallenge.org/website-terms-of-use/' },
];

export const copyrightLine = (year: number = new Date().getFullYear()): string =>
  `© MassChallenge ${year}`;

export type OfficeId = 'boston' | 'dallas' | 'israel' | 'switzerland' | 'united-kingdom';

export interface Office {
  id: OfficeId;
  name: string;
  lines: string[];
}

export const OFFICES: Office[] = [
  {
    id: 'boston',
    name: 'Boston, MA',
    lines: ['10 Fan Pier Blvd, 3rd Floor', 'Boston, MA 02210 USA'],
  },
  {
    id: 'dallas',
    name: 'Dallas, TX',
    lines: ['3060 Pegasus Park Dr, Building 6', 'Dallas, TX 75247'],
  },
  { id: 'israel', name: 'Israel', lines: ['10 Jaffa Street', 'Jerusalem, 9434251'] },
  {
    id: 'switzerland',
    name: 'Switzerland',
    lines: ['Chemin du Closel 5', '1020 Renens, Switzerland'],
  },
  {
    id: 'united-kingdom',
    name: 'United Kingdom',
    lines: ['Royal Docks Centre for Sustainability', '4-6 University Way', 'London E162RD'],
  },
];

export const findOffice = (id: OfficeId): Office => {
  const office = OFFICES.find((candidate) => candidate.id === id);
  if (!office) throw new Error(`Unknown office: ${id}`);
  return office;
};

export const officeAddress = (id: OfficeId): string => findOffice(id).lines.join(', ');
