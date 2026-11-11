export const MESSAGING_AS_OF = 'November 2026';

export const PRIMARY_LINE =
  'We back the rare humans with the grit to solve the toughest challenges.';

export const POSITIONING = [
  'Born in Massachusetts. Built for the world.',
  'A global network turning bold ideas into outcomes that matter.',
];

const SHORT_BOILERPLATE =
  "Born in Massachusetts and built for the world, MassChallenge backs the rare humans with the grit to solve the world's hardest challenges.";

const MEDIUM_ADDITION =
  "What began in New England's innovation corridor is now a global network connecting startups, experts, and partners across industries and continents, all working to turn bold ideas into outcomes that matter.";

const LONG_ADDITIONS = [
  'We are the earliest believer in founders tackling complex, regulated, and high-stakes problems, providing the infrastructure, access, and catalytic capital to move from proof to scale.',
  'Since 2009, MassChallenge has supported more than 5,000 startups across five Challenge Areas, helping them raise $16B+ in funding, create 90K jobs, and collaborate with more than 500 partners worldwide.',
];

export type BoilerplateLength = 'short' | 'medium' | 'long';

export interface Boilerplate {
  length: BoilerplateLength;
  name: string;
  text: string;
}

export const BOILERPLATES: Boilerplate[] = [
  { length: 'short', name: 'Short', text: SHORT_BOILERPLATE },
  { length: 'medium', name: 'Medium', text: `${SHORT_BOILERPLATE} ${MEDIUM_ADDITION}` },
  {
    length: 'long',
    name: 'Long',
    text: [SHORT_BOILERPLATE, MEDIUM_ADDITION, ...LONG_ADDITIONS].join(' '),
  },
];

export const findBoilerplate = (length: BoilerplateLength): Boilerplate => {
  const boilerplate = BOILERPLATES.find((candidate) => candidate.length === length);
  if (!boilerplate) throw new Error(`Unknown boilerplate: ${length}`);
  return boilerplate;
};

export const wordCount = (text: string): number => text.trim().split(/\s+/).filter(Boolean).length;

export interface ApprovedFigure {
  id: string;
  value: string;
  label: string;
}

export const APPROVED_FIGURES: ApprovedFigure[] = [
  { id: 'founded', value: '2009', label: 'Founded' },
  { id: 'startups', value: '5,000+', label: 'Startups supported' },
  { id: 'challenge-areas', value: '5', label: 'Challenge Areas' },
  { id: 'raised', value: '$16B+', label: 'Raised by startups' },
  { id: 'jobs', value: '90K', label: 'Jobs created' },
  { id: 'partners', value: '500+', label: 'Partners worldwide' },
];

export const figureAsOfLine = (): string => `As of ${MESSAGING_AS_OF}`;

export const CHALLENGE_AREAS = [
  'Healthcare and Life Sciences',
  'Security and Resiliency',
  'Sustainable Food Systems',
  'Climate',
  'Global Financial Systems',
];

export const ACCELERATORS = ['Traction', 'Challenge', 'Breakthrough Bio'];

export const PARTNERSHIP_OFFER = 'Corporate Partners';

export const AUDIENCES = ['Founders', 'Experts', 'Collaborators'];

export const PRODUCT_WORDS = ['startups', 'applications', 'mentors', 'judges', 'programs'];

export const MISATTRIBUTED_LINE = 'It takes a community to raise a startup.';

export const MISATTRIBUTION_NOTE =
  "This is a founder's testimonial, not a MassChallenge line. Never present it as a tagline.";
