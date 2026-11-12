export interface SitePage {
  path: string;
  title: string;
  description: string;
}

export const BRAND_GUIDE_PAGE: SitePage = {
  path: '/brand/',
  title: 'Brand guide',
  description:
    'The MassChallenge brand, shown rather than told: logos, color, type, photos, voice and motion, with everything ready to copy and download.',
};

export const STUDIO_PAGE: SitePage = {
  path: '/studio/',
  title: 'Content studio',
  description:
    'Your own little design studio. It only hands you MassChallenge fonts, colors and logos, used the way they are meant to be.',
};

export const SIGNATURE_PAGE: SitePage = {
  path: '/studio/signature/',
  title: 'Email signature',
  description: 'Build a MassChallenge email signature and copy it into your mail app.',
};

export const SITE_PAGES: SitePage[] = [BRAND_GUIDE_PAGE, STUDIO_PAGE, SIGNATURE_PAGE];
