import react from '@astrojs/react';
import starlight from '@astrojs/starlight';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://propellant.masschallenge.org',
  vite: { plugins: [tailwindcss()] },
  integrations: [
    react(),
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
        {
          label: 'Brand',
          items: [
            { label: 'Visual brand guide', link: '/brand/' },
            { label: 'Brand reference', link: '/brand/reference/' },
            { label: 'Content studio', link: '/studio/' },
            { label: 'Email signature', link: '/studio/signature/' },
          ],
        },
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
              items: [
                { label: 'Overview', link: '/office/' },
                {
                  label: 'Designing documents, decks and spreadsheets',
                  link: '/office/foundations/',
                },
                { label: 'Installing the templates', link: '/office/templates/' },
                { label: 'Word', link: '/office/word/' },
                { label: 'PowerPoint', link: '/office/powerpoint/' },
                { label: 'Excel', link: '/office/excel/' },
                { label: 'Google Docs', link: '/office/google-docs/' },
                { label: 'Google Slides', link: '/office/google-slides/' },
                { label: 'Google Sheets', link: '/office/google-sheets/' },
              ],
            },
          ],
        },
        { label: 'Propellant in Claude', link: '/claude/' },
        { label: 'Contributing', link: '/contributing/' },
      ],
    }),
  ],
});
