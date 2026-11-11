import { describe, expect, it } from 'vitest';
import {
  CONTACT_EMAIL,
  FOOTER_LINKS,
  OFFICES,
  SOCIAL_LINKS,
  copyrightLine,
  findOffice,
  findSocial,
  officeAddress,
} from '../../src/brand/contact';

describe('contact, social and legal', () => {
  it('uses the official email address', () => {
    expect(CONTACT_EMAIL).toBe('contact@masschallenge.org');
  });

  it('links to the official social accounts over https', () => {
    expect(SOCIAL_LINKS.map((social) => social.name)).toEqual(['LinkedIn', 'Instagram', 'X']);
    SOCIAL_LINKS.forEach((social) => expect(social.url).toMatch(/^https:\/\//));
    expect(findSocial('instagram').handle).toBe('@masschallenge');
    expect(findSocial('x').handle).toBe('@MassChallenge');
    expect(() => findSocial('tiktok' as never)).toThrow();
  });

  it('writes the copyright line for the current year with no trademark symbol', () => {
    expect(copyrightLine(2026)).toBe('© MassChallenge 2026');
    expect(copyrightLine()).toBe(`© MassChallenge ${new Date().getFullYear()}`);
    expect(copyrightLine()).not.toMatch(/[™®]/);
  });

  it('lists the five offices from the About page', () => {
    expect(OFFICES).toHaveLength(5);
    expect(officeAddress('dallas')).toBe('3060 Pegasus Park Dr, Building 6, Dallas, TX 75247');
    expect(officeAddress('united-kingdom')).toBe(
      'Royal Docks Centre for Sustainability, 4-6 University Way, London E16 2RD, United Kingdom',
    );
    expect(officeAddress('israel')).toBe('10 Jaffa Street, Jerusalem, 9434251, Israel');
    expect(() => findOffice('paris' as never)).toThrow();
  });

  it('keeps the footer links on masschallenge.org', () => {
    FOOTER_LINKS.forEach((link) => expect(link.url).toMatch(/^https:\/\/masschallenge\.org\//));
  });
});
