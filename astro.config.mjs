import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://propellant.masschallenge.org',
  integrations: [
    starlight({
      title: 'Propellant',
      description: 'The MassChallenge design system, for every platform we build on.',
      logo: {
        light: './src/assets/brand/propellant-lockup-color.svg',
        dark: './src/assets/brand/propellant-lockup-white.svg',
        replacesTitle: true,
      },
      favicon: '/favicon.svg',
      customCss: ['./src/styles/propellant.css'],
      social: [
        {
          icon: 'github',
          label: 'Propellant on GitHub',
          href: 'https://github.com/masschallenge/propellant',
        },
      ],
      editLink: { baseUrl: 'https://github.com/masschallenge/propellant/edit/main/' },
      lastUpdated: false,
      sidebar: [
        { label: 'About Propellant', link: '/about/' },
        { label: 'Brand', link: '/brand/' },
        { label: 'Guidelines', items: [{ autogenerate: { directory: 'guidelines' } }] },
        {
          label: 'Platforms',
          items: [
            { label: 'Overview', link: '/platforms/' },
            {
              label: 'Web',
              items: [
                { label: 'Overview', link: '/web/' },
                { label: 'Using Propellant', link: '/web/usage/' },
                { label: 'Websites', items: [{ autogenerate: { directory: 'web/websites' } }] },
              ],
            },
            {
              label: 'iOS',
              link: '/platforms/ios/',
              badge: { text: 'Planned', variant: 'default' },
            },
            {
              label: 'Android',
              link: '/platforms/android/',
              badge: { text: 'Planned', variant: 'default' },
            },
            {
              label: 'Office',
              link: '/platforms/office/',
              badge: { text: 'Planned', variant: 'default' },
            },
          ],
        },
        { label: 'Contributing', link: '/contributing/' },
      ],
    }),
  ],
});
